const cron = require("node-cron");
const Poll = require("../models/pollModel");

// runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {

    try {

        const now = new Date();

        await Poll.updateMany(
            {
                isActive: true,
                expiresAt: { $ne: null, $lte: now }
            },
            {
                isActive: false
            }
        );

        console.log("Expired polls closed");

    } catch (err) {

        console.log("Poll cron error:", err.message);

    }

});