// controllers/karmaController.js
const User = require("../models/userModel");
const Post = require("../models/postModel");
const getBadges = require("../helpers/getBadges");

// ================= LEADERBOARD =================
// GET /api/users/leaderboard?community=
exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.find()
            .select("name avatar karma department batch role")
            .sort({ karma: -1 })
            .limit(10);

        const withBadges = users.map(u => ({
            ...u._doc,
            badges: getBadges(u.karma)
        }));

        res.json(withBadges);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= UPVOTE POST =================
// POST /api/posts/:id/vote  body: { type: "up" | "down" }
exports.votePost = async (req, res) => {
    try {
        const { type } = req.body; // "up" or "down"
        const userId = req.user.id;

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const alreadyUpvoted = post.upvotes?.includes(userId);
        const alreadyDownvoted = post.downvotes?.includes(userId);

        let karmaChange = 0;

        if (type === "up") {
            if (alreadyUpvoted) {
                // undo upvote
                post.upvotes.pull(userId);
                karmaChange = -1;
            } else {
                post.upvotes.addToSet(userId);
                karmaChange = 1;
                if (alreadyDownvoted) {
                    post.downvotes.pull(userId);
                    karmaChange = 2; // remove -1 and add +1
                }
            }
        } else if (type === "down") {
            if (alreadyDownvoted) {
                // undo downvote
                post.downvotes.pull(userId);
                karmaChange = 1;
            } else {
                post.downvotes.addToSet(userId);
                karmaChange = -1;
                if (alreadyUpvoted) {
                    post.upvotes.pull(userId);
                    karmaChange = -2;
                }
            }
        }

        await post.save();

        // ✅ update post author karma atomically
        if (karmaChange !== 0 && post.author.toString() !== userId) {
            await User.findByIdAndUpdate(post.author, { $inc: { karma: karmaChange } });
        }

        res.json({
            upvotes: post.upvotes.length,
            downvotes: post.downvotes.length,
            userVote: post.upvotes.includes(userId) ? "up" : post.downvotes.includes(userId) ? "down" : null
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};