const cron = require("node-cron");
const Notice = require("../models/noticeModel");
const Poll = require("../models/pollModel");
const Community = require("../models/communityModel");
const { createNotification } = require("./createNotification");

// ================= AUTO ARCHIVE NOTICES (every hour) =================
cron.schedule("0 * * * *", async () => {
    try {
        const now = new Date();
        const result = await Notice.updateMany(
            { deadline: { $lt: now }, isArchived: false, isDeleted: false },
            { isArchived: true }
        );
        console.log(`[CRON] Auto-archived ${result.modifiedCount} notices`);
    } catch (err) {
        console.error("[CRON] Archive error:", err.message);
    }
});

// ================= DEADLINE REMINDER CHECK (every 15 min) =================
cron.schedule("*/15 * * * *", async () => {
    try {
        const now = new Date();

        // ✅ populate community so we can get its members
        const notices = await Notice.find({
            isDeleted: false,
            isArchived: false
        }).populate("community");

        for (let notice of notices) {
            let changed = false;

            for (let r of notice.reminderSchedule) {
                if (!r.sent && new Date(r.time) <= now) {
                    console.log(`[REMINDER] ${notice.title} — ${r.type} reminder`);

                    // ✅ NOTIFICATION: send deadline reminder to all community members
                    try {
                        const community = await Community.findById(notice.community._id || notice.community);
                        if (community?.members?.length) {
                            for (const memberId of community.members) {
                                await createNotification({
                                    userId: memberId,
                                    type: "DEADLINE",
                                    message: `⏰ Reminder: "${notice.title}" is due in ${r.type === "24h" ? "24 hours" : "3 hours"}`,
                                    link: `/community/${community.slug}`,
                                    metadata: { noticeId: notice._id, communityId: community._id }
                                });
                            }
                        }
                    } catch (notifErr) {
                        console.error("[CRON] Notification send error:", notifErr.message);
                    }

                    r.sent = true;
                    changed = true;
                }
            }

            if (changed) await notice.save();
        }
    } catch (err) {
        console.error("[CRON] Reminder error:", err.message);
    }
});

// ================= CLOSE EXPIRED POLLS (every 5 min) =================
cron.schedule("*/5 * * * *", async () => {
    try {
        const now = new Date();
        const result = await Poll.updateMany(
            { isActive: true, expiresAt: { $ne: null, $lte: now } },
            { isActive: false }
        );
        console.log(`[CRON] Closed ${result.modifiedCount} expired polls`);
    } catch (err) {
        console.error("[CRON] Poll cron error:", err.message);
    }
});

// ================= TIME REMAINING HELPER =================
const getTimeRemaining = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0 };
    return {
        expired: false,
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60)
    };
};

module.exports = { getTimeRemaining };