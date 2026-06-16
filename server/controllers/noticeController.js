const Notice = require("../models/noticeModel");
const Community = require("../models/communityModel");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { createNotification } = require("../helpers/createNotification");

// ================= HELPERS =================
const createReminders = (deadline) => {
    if (!deadline) return [];
    const d = new Date(deadline);
    return [
        { time: new Date(d.getTime() - 24 * 60 * 60 * 1000), type: "24h", sent: false },
        { time: new Date(d.getTime() - 3 * 60 * 60 * 1000), type: "3h", sent: false }
    ];
};

const normalizeRole = (role) => role?.toLowerCase();

const uploadToCloudinary = (buffer, originalname) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "campusvoice/notices", resource_type: "auto" },
            (err, result) => err ? reject(err) : resolve(result)
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// ================= CREATE =================
exports.createNotice = async (req, res) => {
    try {
        const role = normalizeRole(req.user?.role);
        if (!req.user || !["admin", "cr", "moderator"].includes(role)) {
            return res.status(403).json({ message: "Not allowed" });
        }

        const { title, content, type, communityId, deadline, priority } = req.body;

        if (!title || !content || !communityId) {
            return res.status(400).json({ message: "title, content and communityId are required" });
        }

        let attachments = [];
        if (req.files?.length) {
            for (let file of req.files) {
                const result = await uploadToCloudinary(file.buffer, file.originalname);
                attachments.push({
                    url: result.secure_url,
                    public_id: result.public_id,
                    name: file.originalname
                });
            }
        }

        const notice = await Notice.create({
            title,
            content,
            type: type || "general",
            community: communityId,
            createdBy: req.user.id,
            deadline: deadline || null,
            priority: priority || "normal",
            attachments,
            reminderSchedule: createReminders(deadline)
        });

        const populated = await notice.populate("createdBy", "name role");

        // ✅ NOTIFICATION: alert all community members about new notice
        try {
            const community = await Community.findById(communityId);
            if (community?.members?.length) {
                for (const memberId of community.members) {
                    // don't notify the creator themselves
                    if (memberId.toString() !== req.user.id) {
                        await createNotification({
                            userId: memberId,
                            type: "NOTICE",
                            message: `📢 New notice in ${community.name}: "${title}"`,
                            link: `/community/${community.slug}`,
                            metadata: { noticeId: notice._id, communityId }
                        });
                    }
                }
            }
        } catch (notifErr) {
            // don't fail the whole request if notification fails
            console.error("Notice notification error:", notifErr.message);
        }

        res.status(201).json({ message: "Notice created", notice: populated });
    } catch (err) {
        console.error("createNotice error:", err);
        res.status(500).json({ message: err.message });
    }
};

// ================= GET BY COMMUNITY =================
exports.getNoticesByCommunity = async (req, res) => {
    try {
        const { type, includeArchived, q } = req.query;

        let filter = {
            community: req.params.communityId,
            isDeleted: false
        };

        if (includeArchived !== "true") filter.isArchived = false;
        if (type && type !== "all") filter.type = type.toLowerCase();

        let notices = await Notice.find(filter)
            .populate("createdBy", "name role")
            .sort({ createdAt: -1 });

        if (q) {
            const query = q.toLowerCase();
            notices = notices.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.content.toLowerCase().includes(query)
            );
        }

        const priorityOrder = { high: 1, medium: 2, normal: 3 };
        notices.sort((a, b) =>
            (priorityOrder[a.priority] - priorityOrder[b.priority]) ||
            (new Date(b.createdAt) - new Date(a.createdAt))
        );

        res.json({ notices });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= UPDATE =================
exports.updateNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.noticeId);
        if (!notice) return res.status(404).json({ message: "Not found" });

        const role = normalizeRole(req.user?.role);
        if (notice.createdBy.toString() !== req.user.id && role !== "admin") {
            return res.status(403).json({ message: "Not allowed" });
        }

        const { title, content, type, deadline, priority } = req.body;
        if (title) notice.title = title;
        if (content) notice.content = content;
        if (type) notice.type = type;
        if (priority) notice.priority = priority;
        if (deadline !== undefined) {
            notice.deadline = deadline || null;
            notice.reminderSchedule = createReminders(deadline);
        }

        await notice.save();
        await notice.populate("createdBy", "name role");
        res.json({ message: "Updated", notice });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= SOFT DELETE =================
exports.deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.noticeId);
        if (!notice) return res.status(404).json({ message: "Not found" });

        const role = normalizeRole(req.user?.role);
        if (notice.createdBy.toString() !== req.user.id && role !== "admin") {
            return res.status(403).json({ message: "Not allowed" });
        }

        notice.isDeleted = true;
        await notice.save();
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= ARCHIVE =================
exports.archiveNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.noticeId);
        if (!notice) return res.status(404).json({ message: "Not found" });

        const role = normalizeRole(req.user?.role);
        if (notice.createdBy.toString() !== req.user.id && role !== "admin") {
            return res.status(403).json({ message: "Not allowed" });
        }

        notice.isArchived = true;
        await notice.save();
        res.json({ message: "Archived" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= SEARCH =================
exports.searchNotices = async (req, res) => {
    try {
        const { q, community } = req.query;
        if (!q || !community) {
            return res.status(400).json({ message: "q and community are required" });
        }

        const notices = await Notice.find({
            community,
            isDeleted: false,
            $or: [
                { title: { $regex: q, $options: "i" } },
                { content: { $regex: q, $options: "i" } }
            ]
        }).populate("createdBy", "name role");

        res.json({ notices });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};