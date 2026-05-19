const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    createNotice,
    getNoticesByCommunity,
    updateNotice,
    deleteNotice,
    archiveNotice
} = require("../controllers/noticeController");

// CREATE (WITH FILES)
router.post(
    "/",
    protect,
    upload.array("files", 5),
    createNotice
);

// GET
router.get("/:communityId", getNoticesByCommunity);

// UPDATE
router.put("/:noticeId", protect, updateNotice);

// DELETE
router.delete("/:noticeId", protect, deleteNotice);

// ARCHIVE
router.patch("/:noticeId/archive", protect, archiveNotice);

module.exports = router;