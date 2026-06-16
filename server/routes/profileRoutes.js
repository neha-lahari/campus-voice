const express = require("express");
const router = express.Router();

const {
    getUserProfile,
    getUserPosts,
    getUserComments,
    updateProfile,
    getSavedPosts
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");

// IMPORTANT: must destructure upload
const { upload } = require("../middleware/uploadMiddleware");

router.get("/me/saved", protect, getSavedPosts);
router.get("/:userId", getUserProfile);
router.get("/:userId/posts", getUserPosts);
router.get("/:userId/comments", getUserComments);

router.put(
    "/update/me",
    protect,
    upload.single("avatar"),
    updateProfile
);

module.exports = router;