const express = require("express");
const router = express.Router();

const {
    createPost,
    getFeedPosts,
    getPostById,
    votePost,
    savePost,
    markSolved,
    updatePost,
    deletePost
} = require("../controllers/postControllers");

const { protect } = require("../middleware/authMiddleware");

// IMPORTANT: destructure properly
const { upload, uploadErrorHandler } = require("../middleware/uploadMiddleware");

router.post(
    "/",
    protect,
    upload.array("file"),
    uploadErrorHandler,
    createPost
);

router.get("/", protect, getFeedPosts);
router.get("/:id", protect, getPostById);

router.post("/:id/vote", protect, votePost);
router.post("/:id/save", protect, savePost);
router.patch("/:id/solve", protect, markSolved);

router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;