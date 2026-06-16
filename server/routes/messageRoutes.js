// routes/messageRoutes.js
// Mount as: app.use("/api/messages", messageRoutes)

const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { getCommunityMessages } = require("../controllers/messageController");

// GET /api/messages/community/:communityId  → community chat history
router.get("/community/:communityId", protect, getCommunityMessages);

module.exports = router;    