// routes/dmRoutes.js
// Mount this in server.js as: app.use("/api/dm", dmRoutes)

const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const {
    createConversation,
    getConversations,
    getMessages,
} = require("../controllers/messageController");

// POST /api/dm/conversation       → create or get existing convo
router.post("/conversation", protect, createConversation);

// GET  /api/dm/conversations      → list all your conversations
router.get("/conversations", protect, getConversations);

// GET  /api/dm/messages/:id       → get messages for a conversation
router.get("/messages/:id", protect, getMessages);

module.exports = router;