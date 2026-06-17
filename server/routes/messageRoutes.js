const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { getCommunityMessages } = require("../controllers/messageController");

router.get("/community/:communityId", protect, getCommunityMessages);

module.exports = router;    