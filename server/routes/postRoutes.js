const express = require("express");
const router = express.Router();

const {
    createPost,
    getFeedPosts,
    getPostById,
    votePost,
    savePost,
    updatePost,
    deletePost
} = require("../controllers/postControllers");

const { protect } = require("../middleware/authMiddleware");
const { upload, uploadErrorHandler } = require("../middleware/uploadMiddleware");

router.post("/", protect, upload.array("file"), uploadErrorHandler, createPost);

router.get("/", protect, getFeedPosts);
router.get("/:id", protect, getPostById);

router.post("/:id/vote", protect, votePost);
router.post("/:id/save", protect, savePost);

router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;