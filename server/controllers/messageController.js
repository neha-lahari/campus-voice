const Message = require("../models/messageModel");

// ===============================
// 1. SEND DIRECT MESSAGE (DM)
// ===============================
exports.sendDM = async (req, res) => {
    try {
        const { receiverId, text, attachments } = req.body;

        const message = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            text,
            attachments: attachments || []
        });

        res.status(201).json({
            message: "Message sent",
            data: message
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ===============================
// 2. GET DM CONVERSATION
// ===============================
exports.getConversation = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: userId },
                { sender: userId, receiver: req.user.id }
            ]
        })
            .sort({ createdAt: 1 });

        res.json(messages);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ===============================
// 3. MARK AS READ
// ===============================
exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;

        await Message.findByIdAndUpdate(messageId, {
            isRead: true
        });

        res.json({ message: "Marked as read" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ===============================
// 4. DELETE MESSAGE
// ===============================
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        await Message.findByIdAndDelete(messageId);

        res.json({ message: "Message deleted" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ===============================
// 5. SEARCH MESSAGES
// ===============================
exports.searchMessages = async (req, res) => {
    try {
        const { q } = req.query;

        const results = await Message.find({
            text: { $regex: q, $options: "i" }
        });

        res.json(results);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ===============================
// 6. COMMUNITY CHAT - SEND
// ===============================
exports.sendCommunityMessage = async (req, res) => {
    try {
        const { communityId, text } = req.body;

        const message = await Message.create({
            sender: req.user.id,
            community: communityId,
            text
        });

        res.status(201).json({
            message: "Sent to community",
            data: message
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ===============================
// 7. COMMUNITY CHAT - GET
// ===============================
exports.getCommunityMessages = async (req, res) => {
    try {
        const { communityId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const messages = await Message.find({
            community: communityId
        })
            .populate("sender", "username")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json(messages);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};