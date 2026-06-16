const cron = require("node-cron");
const Notice = require("../models/noticeModel");
const { createNotification } = require("../helpers/createNotification");

cron.schedule("*/15 * * * *", async () => {
    try {
        const now = new Date();

        const notices = await Notice.find({
            reminderFired: false,
            reminderTime: {
                $lte: new Date(now.getTime() + 15 * 60000),
                $gte: now
            }
        }).populate("community");

        for (let notice of notices) {
            for (let member of notice.community.members) {
                await createNotification({
                    userId: member,
                    type: "DEADLINE",
                    message: "⚠️ Deadline is approaching!",
                    link: `/community/${notice.community.slug}`
                });
            }

            notice.reminderFired = true;
            await notice.save();
        }
    } catch (err) {
        console.log("Cron Error:", err.message);
    }
});