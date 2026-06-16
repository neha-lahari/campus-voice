const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    getNotifications,
    markAllRead,
    markOneRead
} = require("../controllers/notificationController");

router.get("/", protect, getNotifications);

router.patch("/read-all", protect, markAllRead);

router.patch("/:id/read", protect, markOneRead);

module.exports = router;