const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
    getCommunities,
    createCommunity,
    joinLeaveCommunity,
    getCommunityBySlug,
    getCommunityById
} = require("../controllers/communityControllers");


router.get("/", protect, getCommunities);
router.post("/", protect, createCommunity);
router.post("/:id/join", protect, joinLeaveCommunity);
router.get("/id/:id", protect, getCommunityById);
router.get("/:slug", protect, getCommunityBySlug);

module.exports = router;