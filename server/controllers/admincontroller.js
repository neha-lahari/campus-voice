const User = require("../models/userModel");
const CRRequest = require("../models/Crrequestmodel");

exports.submitCRRequest = async (req, res) => {
    try {
        const { reason, community } = req.body;

        if (!reason?.trim()) {
            return res.status(400).json({ message: "Reason is required" });
        }
        const existing = await CRRequest.findOne({
            user: req.user.id,
            status: "pending"
        });

        if (existing) {
            return res.status(400).json({ message: "You already have a pending CR request" });
        }

        if (req.user.role !== "student") {
            return res.status(400).json({ message: "You are already a CR or admin" });
        }

        const request = await CRRequest.create({
            user: req.user.id,
            reason,
            community: community || ""
        });

        res.status(201).json({ message: "CR request submitted", request });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMyCRRequest = async (req, res) => {
    try {
        const request = await CRRequest.findOne({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json(request || null);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getAllCRRequests = async (req, res) => {
    try {
        const { status = "pending" } = req.query;

        const requests = await CRRequest.find({ status })
            .populate("user", "name email rollNumber department batch role avatar")
            .populate("reviewedBy", "name")
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.approveCRRequest = async (req, res) => {
    try {
        const request = await CRRequest.findById(req.params.requestId)
            .populate("user");

        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.status !== "pending") {
            return res.status(400).json({ message: "Request already reviewed" });
        }

        await User.findByIdAndUpdate(request.user._id, { role: "cr" });

        request.status = "approved";
        request.reviewedBy = req.user.id;
        request.reviewedAt = new Date();
        await request.save();

        res.json({ message: "CR request approved" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.rejectCRRequest = async (req, res) => {
    try {
        const request = await CRRequest.findById(req.params.requestId);

        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.status !== "pending") {
            return res.status(400).json({ message: "Request already reviewed" });
        }

        request.status = "rejected";
        request.reviewedBy = req.user.id;
        request.reviewedAt = new Date();
        await request.save();

        res.json({ message: "CR request rejected" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.revokeRole = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === "admin") {
            return res.status(403).json({ message: "Cannot revoke admin role" });
        }

        await User.findByIdAndUpdate(userId, { role: "student" });

        res.json({ message: "Role revoked, user is now student" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { role, q } = req.query;

        let filter = {};
        if (role) filter.role = role;
        if (q) filter.name = { $regex: q, $options: "i" };

        const users = await User.find(filter)
            .select("name email rollNumber department batch role avatar createdAt")
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};