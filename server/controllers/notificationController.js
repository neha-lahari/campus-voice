const Notification = require("../models/notificationModel");

exports.getNotifications = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;

        const limit = 20;

        const skip = (page - 1) * limit;

        const notifications = await Notification.find({
            user: req.user.id
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const unread = await Notification.countDocuments({
            user: req.user.id,
            isRead: false
        });

        res.json({
            notifications,
            unread
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.markAllRead = async (req, res) => {
    try {

        await Notification.updateMany(
            {
                user: req.user.id,
                isRead: false
            },
            {
                isRead: true
            }
        );

        res.json({
            message: "Notifications marked read"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.markOneRead = async (req, res) => {
    try {

        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            {
                isRead: true
            },
            {
                new: true
            }
        );

        res.json(notification);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};