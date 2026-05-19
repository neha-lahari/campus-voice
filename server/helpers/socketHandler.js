const Message = require("../models/messageModel");

module.exports = (io) => {

    io.on("connection", (socket) => {

        console.log("User Connected:", socket.id);

        // =====================================================
        // COMMUNITY CHAT
        // =====================================================

        socket.on("joinCommunity", (communityId) => {

            socket.join(communityId);

            console.log(`Joined Community: ${communityId}`);
        });


        socket.on("leaveCommunity", (communityId) => {

            socket.leave(communityId);

            console.log(`Left Community: ${communityId}`);
        });


        socket.on("typingIndicator", (data) => {

            socket.to(data.communityId).emit("showTyping", {
                userId: data.userId,
                username: data.username
            });
        });


        socket.on("sendMessage", async (data) => {

            try {

                // SAVE TO DATABASE

                const message = await Message.create({
                    sender: data.senderId,
                    community: data.communityId,
                    text: data.text
                });

                // POPULATE SENDER

                const populatedMessage = await Message.findById(message._id)
                    .populate("sender", "username");

                // SEND TO ROOM

                io.to(data.communityId).emit(
                    "receiveMessage",
                    populatedMessage
                );

            } catch (err) {

                console.log(err);
            }
        });



        // =====================================================
        // DIRECT MESSAGES
        // =====================================================

        socket.on("joinDM", ({ senderId, receiverId }) => {

            const roomId = [senderId, receiverId]
                .sort()
                .join("-");

            socket.join(roomId);

            console.log(`Joined DM Room: ${roomId}`);
        });


        socket.on("sendPrivateMessage", async (data) => {

            try {

                const roomId = [data.senderId, data.receiverId]
                    .sort()
                    .join("-");

                // SAVE TO DATABASE

                const message = await Message.create({
                    sender: data.senderId,
                    receiver: data.receiverId,
                    text: data.text,
                    attachments: data.attachments || []
                });

                // POPULATE

                const populatedMessage = await Message.findById(message._id)
                    .populate("sender", "username");

                // SEND TO ROOM

                io.to(roomId).emit(
                    "receivePrivateMessage",
                    populatedMessage
                );

            } catch (err) {

                console.log(err);
            }
        });



        // =====================================================
        // READ RECEIPTS
        // =====================================================

        socket.on("markAsRead", async (data) => {

            try {

                await Message.findByIdAndUpdate(
                    data.messageId,
                    { isRead: true }
                );

                io.to(data.roomId).emit("messageRead", {
                    messageId: data.messageId
                });

            } catch (err) {

                console.log(err);
            }
        });



        // =====================================================
        // DISCONNECT
        // =====================================================

        socket.on("disconnect", () => {

            console.log("User Disconnected");
        });

    });

};