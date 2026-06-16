const jwt = require("jsonwebtoken");
const Message = require("../models/messageModel");
const Conversation = require("../models/conversationModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const { createNotification } = require("./createNotification");

// ✅ HELPER: keep only latest 20 notifications per user, delete the rest
const trimNotifications = async (userId) => {
    try {
        const all = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .select("_id");

        if (all.length > 20) {
            const toDelete = all.slice(20).map(n => n._id);
            await Notification.deleteMany({ _id: { $in: toDelete } });
        }
    } catch (err) {
        console.error("trimNotifications error:", err.message);
    }
};

module.exports = (io) => {

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("No token"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            socket.user = {
                id: decoded.userId || decoded.id || decoded._id
            };

            if (!socket.user.id) return next(new Error("Invalid token"));

            next();

        } catch (err) {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {

        console.log("User connected:", socket.user.id);

        socket.join(`user-${socket.user.id}`);

        // ================= COMMUNITY CHAT =================
        socket.on("joinCommunity", (communityId) => {
            if (!communityId) return;
            socket.join(`community-${communityId}`);
        });

        socket.on("communityMessage", async ({ communityId, text, attachments = [] }) => {
            try {
                if (!socket.user?.id || !communityId) return;
                if (!text && attachments.length === 0) return;

                const msg = await Message.create({
                    sender: socket.user.id,
                    community: communityId,
                    text,
                    attachments
                });

                const fullMsg = await msg.populate("sender", "name avatar");

                io.to(`community-${communityId}`).emit("newCommunityMessage", fullMsg);

            } catch (err) {
                console.log("communityMessage error:", err);
            }
        });

        // ================= DM CHAT =================
        socket.on("joinConversation", ({ conversationId }) => {
            if (!conversationId) return;
            socket.join(`dm-${conversationId}`);
        });

        socket.on("dmMessage", async ({ conversationId, text, attachments = [] }) => {
            try {
                if (!socket.user?.id || !conversationId) return;

                const msg = await Message.create({
                    sender: socket.user.id,
                    conversation: conversationId,
                    text,
                    attachments
                });

                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: msg._id
                });

                const fullMsg = await msg.populate("sender", "name avatar");

                io.to(`dm-${conversationId}`).emit("newDMMessage", fullMsg);

                // ✅ FIX BUG 1: Send notification to the OTHER person in the conversation
                const convo = await Conversation.findById(conversationId);
                const receiverId = convo?.participants?.find(
                    p => p.toString() !== socket.user.id
                );

                if (receiverId) {
                    // get sender name for the message
                    const sender = await User.findById(socket.user.id).select("name");

                    await createNotification({
                        userId: receiverId,
                        type: "DM",
                        message: `💬 ${sender?.name || "Someone"} sent you a message`,
                        link: `/messages`,
                        metadata: { conversationId, senderId: socket.user.id }
                    });

                    // ✅ FIX Q3: trim to keep only latest 20 notifications
                    await trimNotifications(receiverId);
                }

            } catch (err) {
                console.log("dmMessage error:", err);
            }
        });

        // ================= PIN =================
        socket.on("pinMessage", async ({ messageId, communityId }) => {
            try {
                const pinnedCount = await Message.countDocuments({
                    community: communityId,
                    pinned: true
                });

                if (pinnedCount >= 3) {
                    const oldest = await Message.findOne({
                        community: communityId,
                        pinned: true
                    }).sort({ updatedAt: 1 });

                    if (oldest) {
                        oldest.pinned = false;
                        await oldest.save();
                        io.to(`community-${communityId}`).emit("messageUnpinned", oldest);
                    }
                }

                const msg = await Message.findByIdAndUpdate(
                    messageId,
                    { pinned: true },
                    { new: true }
                ).populate("sender", "name avatar");

                io.to(`community-${communityId}`).emit("messagePinned", msg);
            } catch (err) {
                console.log(err);
            }
        });

        // ================= SEEN =================
        socket.on("seenMessages", async ({ conversationId }) => {
            try {
                await Message.updateMany(
                    { conversation: conversationId, sender: { $ne: socket.user.id } },
                    { $addToSet: { seenBy: socket.user.id } }
                );

                io.to(`dm-${conversationId}`).emit("messagesSeen", {
                    conversationId,
                    userId: socket.user.id
                });
            } catch (err) {
                console.log(err);
            }
        });

        socket.on("disconnect", () => {
            console.log("Disconnected:", socket.user.id);
        });
    });
};