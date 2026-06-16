const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const { createNotification } = require("../helpers/createNotification");

/* CREATE OR GET CONVERSATION */
exports.createConversation = async (req, res) => {
    try {
        const { userId } = req.body;

        let convo = await Conversation.findOne({
            participants: { $all: [req.user.id, userId] },
        });

        if (!convo) {
            convo = await Conversation.create({
                participants: [req.user.id, userId],
            });
        }

        res.json(convo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/* GET ALL CONVERSATIONS */
exports.getConversations = async (req, res) => {
    try {
        const convos = await Conversation.find({
            participants: req.user.id,
        })
            .populate("participants", "name avatar department batch")
            .populate({
                path: "lastMessage",
                populate: { path: "sender", select: "name avatar" }
            })
            .sort({ updatedAt: -1 });

        res.json(convos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/* GET DM MESSAGES */
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            conversation: req.params.id,
        })
            .populate("sender", "name avatar")
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/* SEND DM MESSAGE */
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, body } = req.body;

        const convo = await Conversation.findById(conversationId);
        if (!convo) return res.status(404).json({ message: "Conversation not found" });

        const message = await Message.create({
            conversation: conversationId,
            sender: req.user.id,
            body
        });

        // update lastMessage on conversation
        convo.lastMessage = message._id;
        await convo.save();

        await message.populate("sender", "name avatar");

        // ✅ NOTIFICATION: notify the other participant
        const receiverId = convo.participants.find(
            p => p.toString() !== req.user.id
        );

        if (receiverId) {
            await createNotification({
                userId: receiverId,
                type: "DM",
                message: `${req.user.name || "Someone"} sent you a message`,
                link: `/messages`,
                metadata: { conversationId, senderId: req.user.id }
            });
        }

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

/* GET COMMUNITY MESSAGES */
exports.getCommunityMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            community: req.params.communityId,
        })
            .populate("sender", "name avatar")
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};