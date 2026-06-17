const Community = require("../models/communityModel");
const Post = require("../models/postModel");
const mongoose = require("mongoose");


exports.createCommunity = async (req, res) => {
    try {

        const { name, slug, description } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Name and slug are required"
            });
        }

        const existing = await Community.findOne({
            slug: slug.toLowerCase()
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Community already exists"
            });
        }

        const community = await Community.create({
            name,
            slug: slug.toLowerCase(),
            description: description || "",
            members: [req.user.id],
            moderators: [req.user.id],
            createdBy: req.user.id,
            type: "custom"
        });

        res.status(201).json({
            success: true,
            community
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


exports.getCommunities = async (req, res) => {
    try {

        const { joined } = req.query;

        let filter = {};

        if (joined === "true") {
            filter.members = req.user.id;
        }

        const communities = await Community.find(filter)
            .populate("moderators", "username")
            .sort({ createdAt: -1 });

        const formatted = communities.map((community) => {

            const isJoined = community.members.some(
                (member) => member.toString() === req.user.id
            );

            return {
                _id: community._id,
                name: community.name,
                slug: community.slug,
                description: community.description,
                type: community.type,
                memberCount: community.members.length,
                moderators: community.moderators,
                isJoined
            };
        });

        res.status(200).json({
            success: true,
            count: formatted.length,
            communities: formatted
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

exports.getCommunityBySlug = async (req, res) => {
    try {

        const { slug } = req.params;

        const community = await Community.findOne({ slug })
            .populate("moderators", "username name")
            .populate("createdBy", "username name");

        if (!community) {
            return res.status(404).json({
                success: false,
                message: "Community not found"
            });
        }

        const recentActivity = await Post.find({
            community: community._id
        })
            .populate("author", "username name")
            .sort({ createdAt: -1 })
            .limit(20);

        const isJoined = community.members.some(
            (member) => member.toString() === req.user.id
        );

        res.status(200).json({
            success: true,
            community: {
                _id: community._id,
                name: community.name,
                slug: community.slug,
                description: community.description,
                type: community.type,
                memberCount: community.members.length,
                moderators: community.moderators,
                isJoined,
                recentActivity
            }
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


exports.joinLeaveCommunity = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid community id"
            });
        }

        const community = await Community.findById(id);

        if (!community) {
            return res.status(404).json({
                success: false,
                message: "Community not found"
            });
        }

        const userId = req.user.id;

        const isMember = community.members.some(
            (member) => member.toString() === userId
        );

        // LEAVE
        if (isMember) {

            community.members = community.members.filter(
                (member) => member.toString() !== userId
            );

            community.moderators = community.moderators.filter(
                (mod) => mod.toString() !== userId
            );

            await community.save();

            return res.status(200).json({
                success: true,
                message: "Left community",
                joined: false,
                memberCount: community.members.length
            });
        }

        // JOIN
        community.members.push(userId);

        await community.save();

        res.status(200).json({
            success: true,
            message: "Joined community",
            joined: true,
            memberCount: community.members.length
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};