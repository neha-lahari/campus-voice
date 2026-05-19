const Notice = require("../models/noticeModel");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// ==========================
// CREATE NOTICE + FILE UPLOAD
// ==========================

exports.createNotice = async (req, res) => {
    try {
        if (!req.user || !["admin", "cr"].includes(req.user.role)) {
            return res.status(403).json({
                message: "Only CR/Admin can create notices"
            });
        }

        const {
            title,
            content,
            type,
            communityId,
            deadline,
            priority
        } = req.body;

        let attachments = [];

        // FILE UPLOAD HANDLING
        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "campusvoice/notices",
                    resource_type: "auto"
                });

                attachments.push({
                    url: result.secure_url,
                    public_id: result.public_id,
                    name: file.originalname
                });

                fs.unlinkSync(file.path);
            }
        }

        const notice = await Notice.create({
            title,
            content,
            type: type ? type.toLowerCase() : "general",
            community: communityId,
            createdBy: req.user.id,
            deadline: deadline || null,
            priority: priority || "normal",
            attachments
        });

        res.status(201).json({
            message: "Notice created successfully",
            notice
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ==========================
// GET NOTICES
// ==========================

exports.getNoticesByCommunity = async (req, res) => {
    try {

        const { type, archived } = req.query;

        let filter = {
            community: req.params.communityId
        };

        if (archived === "true") {
            filter.isArchived = true;
        } else {
            filter.isArchived = false;
        }

        if (type) {
            filter.type = type.toLowerCase();
        }

        const notices = await Notice.find(filter)
            .populate("createdBy", "username")
            .sort({ createdAt: -1 });

        res.json(notices);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ==========================
// UPDATE NOTICE
// ==========================

exports.updateNotice = async (req, res) => {
    try {

        const notice = await Notice.findById(req.params.noticeId);

        if (!notice) {
            return res.status(404).json({
                message: "Notice not found"
            });
        }

        if (
            notice.createdBy.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "Not allowed"
            });
        }

        const { title, content, type, deadline, priority } = req.body;

        if (title) notice.title = title;
        if (content) notice.content = content;
        if (type) notice.type = type.toLowerCase();
        if (deadline !== undefined) notice.deadline = deadline;
        if (priority) notice.priority = priority;

        await notice.save();

        res.json({
            message: "Notice updated",
            notice
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ==========================
// DELETE NOTICE
// ==========================

exports.deleteNotice = async (req, res) => {
    try {

        const notice = await Notice.findById(req.params.noticeId);

        if (!notice) {
            return res.status(404).json({
                message: "Notice not found"
            });
        }

        if (
            notice.createdBy.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "Not allowed"
            });
        }

        await notice.deleteOne();

        res.json({
            message: "Notice deleted"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ==========================
// ARCHIVE NOTICE
// ==========================

exports.archiveNotice = async (req, res) => {
    try {

        const notice = await Notice.findById(req.params.noticeId);

        if (!notice) {
            return res.status(404).json({
                message: "Notice not found"
            });
        }

        notice.isArchived = true;
        await notice.save();

        res.json({
            message: "Notice archived"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};