const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment,
    upvoteComment,
    downvoteComment
} = require("../controllers/commentController");

// ===============================
// CREATE COMMENT
// ===============================
router.post("/", protect, createComment);

// ===============================
// GET COMMENTS OF POST
// ===============================
router.get("/:postId", getCommentsByPost);

// ===============================
// UPDATE COMMENT
// ===============================
router.put("/:commentId", protect, updateComment);

// ===============================
// DELETE COMMENT
// ===============================
router.delete("/:commentId", protect, deleteComment);

// ===============================
// UPVOTE COMMENT
// ===============================
router.post("/upvote/:commentId", protect, upvoteComment);

// ===============================
// DOWNVOTE COMMENT
// ===============================
router.post("/downvote/:commentId", protect, downvoteComment);

module.exports = router;