const Community = require("../models/communityModel");
const mongoose = require("mongoose");


// ============================
// CREATE COMMUNITY
// ============================
exports.createCommunity = async (req, res) => {
    try {
        const { name, slug, description } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ message: "Name and slug required" });
        }

        const existing = await Community.findOne({ slug });
        if (existing) {
            return res.status(400).json({ message: "Community already exists" });
        }

        const community = await Community.create({
            name,
            slug,
            description: description || "",
            members: [req.user.id],
            moderators: [req.user.id],
            createdBy: req.user.id,
            type: "custom"
        });

        res.status(201).json({ success: true, community });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// ============================
// GET ALL COMMUNITIES
// ============================
exports.getCommunities = async (req, res) => {
    try {
        const { joined } = req.query;

        let filter = {};

        if (joined === "true") {
            filter.members = req.user.id;
        }

        const communities = await Community.find(filter)
            .select("name slug description members moderators");

        res.json({
            success: true,
            count: communities.length,
            communities
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// ============================
// GET COMMUNITY BY SLUG
// ============================
exports.getCommunityBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const community = await Community.findOne({ slug })
            .populate("moderators", "username name")
            .populate("members", "username name");

        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }

        const userId = req.user.id;

        const isMember = community.members.some(
            m => m._id.toString() === userId
        );

        res.json({
            success: true,
            community: {
                _id: community._id,
                name: community.name,
                slug: community.slug,
                description: community.description,
                membersCount: community.members.length,
                moderators: community.moderators,
                isMember
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// ============================
// JOIN / LEAVE TOGGLE
// ============================
exports.joinLeaveCommunity = async (req, res) => {
    try {
        const userId = req.user.id;
        const communityId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(communityId)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const community = await Community.findById(communityId);

        if (!community) {
            return res.status(404).json({ message: "Not found" });
        }

        const isMember = community.members.some(
            id => id.toString() === userId
        );

        if (isMember) {
            community.members = community.members.filter(
                id => id.toString() !== userId
            );
        } else {
            community.members.push(userId);
        }

        await community.save();

        res.json({
            success: true,
            message: isMember ? "Left community" : "Joined community",
            memberCount: community.members.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getCommunityById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid community id" });
        }

        const community = await Community.findById(id)
            .populate("moderators", "username name")
            .populate("members", "username name");

        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }

        const userId = req.user.id;

        const isMember = community.members.some(
            m => m._id.toString() === userId
        );

        res.json({
            success: true,
            community: {
                _id: community._id,
                name: community.name,
                slug: community.slug,
                description: community.description,
                membersCount: community.members.length,
                moderators: community.moderators,
                isMember
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};