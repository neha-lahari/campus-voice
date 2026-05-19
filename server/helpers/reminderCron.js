const cron = require("node-cron");
const Notice = require("../models/noticeModel");

// runs every minute
cron.schedule("* * * * *", async () => {
    try {
        const now = new Date();

        const notices = await Notice.find({
            deadline: { $lte: now },
            reminderSent: false
        });

        for (let notice of notices) {
            console.log("REMINDER:", notice.title);

            notice.reminderSent = true;
            await notice.save();
        }

    } catch (err) {
        console.log(err.message);
    }
});