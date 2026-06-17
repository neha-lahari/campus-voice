const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const {
    createConversation,
    getConversations,
    getMessages,
} = require("../controllers/messageController");

router.post("/conversation", protect, createConversation);
router.get("/conversations", protect, getConversations);
router.get("/messages/:id", protect, getMessages);

module.exports = router;