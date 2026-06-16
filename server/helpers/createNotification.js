const Notification = require("../models/notificationModel");

let ioInstance = null;

const setSocket = (io) => {
    ioInstance = io;
};

const createNotification = async ({
    userId,
    type,
    message,
    link = "/",
    metadata = {}
}) => {
    try {

        if (!userId) return null;

        const notification = await Notification.create({
            user: userId,
            type,
            message,
            link,
            metadata
        });

        const populated = await notification.populate(
            "user",
            "name username avatar profilePic"
        );

        if (ioInstance) {
            ioInstance
                .to(`user-${userId}`)
                .emit("notification", populated);
        }

        return populated;

    } catch (err) {
        console.log("createNotification error:", err.message);
    }
};

module.exports = {
    createNotification,
    setSocket
};