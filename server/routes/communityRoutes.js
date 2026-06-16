const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    getCommunities,
    createCommunity,
    joinLeaveCommunity,
    getCommunityBySlug
} = require("../controllers/communityControllers");

router.get("/", protect, getCommunities);

router.post("/", protect, createCommunity);

router.post("/:id/join", protect, joinLeaveCommunity);

router.get("/:slug", protect, getCommunityBySlug);

module.exports = router;