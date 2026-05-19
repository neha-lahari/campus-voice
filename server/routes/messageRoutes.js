const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    sendDM,
    getConversation,
    markAsRead,
    deleteMessage,
    searchMessages,
    sendCommunityMessage,
    getCommunityMessages
} = require("../controllers/messageController");

// ================= DM ROUTES =================
router.post("/dm", protect, sendDM);
router.get("/dm/:userId", protect, getConversation);
router.patch("/read/:messageId", protect, markAsRead);
router.delete("/:messageId", protect, deleteMessage);
router.get("/search", protect, searchMessages);

// ================= COMMUNITY ROUTES =================
router.post("/community", protect, sendCommunityMessage);
router.get("/community/:communityId", protect, getCommunityMessages);

// ❗ THIS WAS MISSING
module.exports = router;