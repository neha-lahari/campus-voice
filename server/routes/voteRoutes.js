const express = require("express");

const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    upvotePost,
    downvotePost,
    removeVote
} = require("../controllers/voteControllers");
router.post("/upvote/:postId", protect, upvotePost);
router.post("/downvote/:postId", protect, downvotePost);
router.delete("/remove/:postId", protect, removeVote);

module.exports = router;