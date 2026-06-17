const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

const { upload } = uploadMiddleware;

// BUG FIX: added unarchiveNotice to the import
const {
    createNotice,
    getNoticesByCommunity,
    updateNotice,
    deleteNotice,
    archiveNotice,
    unarchiveNotice,
    searchNotices
} = require("../controllers/noticeController");

router.get("/search/all", searchNotices);
router.post("/", protect, upload.array("files", 5), createNotice);

router.get("/:communityId", getNoticesByCommunity);
router.put("/:noticeId", protect, updateNotice);
router.delete("/:noticeId", protect, deleteNotice);
router.patch("/:noticeId/archive", protect, archiveNotice);
router.patch("/:noticeId/unarchive", protect, unarchiveNotice);

module.exports = router;