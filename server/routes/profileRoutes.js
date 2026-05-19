const express = require("express");

const router = express.Router();

const {
    getUserProfile,
    getUserPosts,
    getUserComments,
    updateProfile,
    getKarmaBadges
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");



// PUBLIC ROUTES

router.get("/:userId", getUserProfile);

router.get("/:userId/posts", getUserPosts);

router.get("/:userId/comments", getUserComments);

router.get("/:userId/karma", getKarmaBadges);



router.put("/update/me", protect, updateProfile);



module.exports = router;