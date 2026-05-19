const Post = require("../models/postModel");
const Community = require("../models/communityModel");


// ============================
// CREATE POST
// ============================
exports.createPost = async (req, res) => {
    try {
        const {
            title,
            body,
            communityId,
            type,
            flair,
            isAnonymous,
            attachments
        } = req.body;

        if (!title || !communityId) {
            return res.status(400).json({
                message: "title & communityId required"
            });
        }

        const community = await Community.findById(communityId);

        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }

        const post = await Post.create({
            title,
            body: body || "",
            community: communityId,
            author: req.user.id,
            type: type || "text",
            flair: flair || "",
            isAnonymous: isAnonymous || false,
            attachments: attachments || []
        });

        res.status(201).json({ success: true, post });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// ============================
// GET FEED (PAGINATION)
// ============================
exports.getPosts = async (req, res) => {
    try {
        const {
            community,
            page = 1,
            limit = 10
        } = req.query;

        let filter = {};

        if (community) {
            filter.community = community;
        }

        const skip = (page - 1) * limit;

        const posts = await Post.find(filter)
            .populate("author", "username name")
            .populate("community", "name slug")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean();

        // ADD KARMA BEFORE SENDING RESPONSE
        posts.forEach(p => {
            p.karma = p.upvotes.length - p.downvotes.length;
        });

        res.json({
            success: true,
            page: Number(page),
            count: posts.length,
            posts
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// ============================
// GET POST BY ID
// ============================
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "username name")
            .populate("community", "name slug");

        if (!post) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json({ success: true, post });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// ============================
// UPDATE POST (ONLY OWNER)
// ============================
exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Not found" });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not allowed" });
        }

        post.body = req.body.body || post.body;

        await post.save();

        res.json({ success: true, post });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// ============================
// DELETE POST (OWNER ONLY)
// ============================
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("community");

        if (!post) {
            return res.status(404).json({ message: "Not found" });
        }

        const isAuthor = post.author.toString() === req.user.id;

        const isModerator = post.community.moderators.some(
            id => id.toString() === req.user.id
        );

        if (!isAuthor && !isModerator) {
            return res.status(403).json({ message: "Not allowed" });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: "Deleted" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};