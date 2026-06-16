const Post = require("../models/postModel");
const User = require("../models/userModel");
const Community = require("../models/communityModel");

const globalSearch = async (req, res) => {
    try {
        const { q = "", page = 1, limit = 10, sort = "new" } = req.query;

        if (!q.trim()) {
            return res.json({ posts: [], users: [], communities: [] });
        }

        const skip = (page - 1) * limit;

        const sortOption = sort === "old"
            ? { createdAt: 1 }
            : { createdAt: -1 };

        // ======================
        // POSTS (FIXED: body not content)
        // ======================
        const posts = await Post.find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { body: { $regex: q, $options: "i" } }
            ]
        })
            .populate("author", "name avatar")
            .sort(sortOption)
            .limit(Number(limit))
            .skip(skip);

        // ======================
        // USERS
        // ======================
        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: "i" } },
                { rollNumber: { $regex: q, $options: "i" } }
            ]
        }).select("name avatar karma department batch rollNumber");

        // ======================
        // COMMUNITIES (FIXED + memberCount added)
        // ======================
        const communitiesRaw = await Community.find({
            $or: [
                { name: { $regex: q, $options: "i" } },
                { slug: { $regex: q, $options: "i" } }
            ]
        }).limit(Number(limit));

        const communities = communitiesRaw.map(c => ({
            _id: c._id,
            name: c.name,
            slug: c.slug,
            memberCount: c.members?.length || 0
        }));

        return res.status(200).json({
            posts,
            users,
            communities
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { globalSearch };