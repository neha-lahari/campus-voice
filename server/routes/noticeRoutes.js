const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// ✅ safe import — works whether uploadMiddleware exports default or named
let upload;
try {
    const uploadMiddleware = require("../middleware/uploadMiddleware");
    upload = uploadMiddleware.upload || uploadMiddleware;
} catch (e) {
    // fallback: no file upload, use multer directly
    const multer = require("multer");
    upload = multer({ storage: multer.memoryStorage() });
}

const {
    createNotice,
    getNoticesByCommunity,
    updateNotice,
    deleteNotice,
    archiveNotice,
    searchNotices
} = require("../controllers/noticeController");

// ⚠️ SEARCH must be above /:communityId
router.get("/search/all", searchNotices);

// CREATE
router.post("/", protect, upload.array("files", 5), createNotice);

// GET BY COMMUNITY
router.get("/:communityId", getNoticesByCommunity);

// UPDATE
router.put("/:noticeId", protect, updateNotice);

// DELETE
router.delete("/:noticeId", protect, deleteNotice);

// ARCHIVE
router.patch("/:noticeId/archive", protect, archiveNotice);

module.exports = router;