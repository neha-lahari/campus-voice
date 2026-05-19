const express = require("express");
const router = express.Router();

const {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost
} = require("../controllers/postControllers");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createPost);
router.get("/", protect, getPosts);
router.get("/:id", protect, getPostById);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;