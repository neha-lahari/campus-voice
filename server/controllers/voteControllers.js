const Post = require("../models/postModel");


// ======================================
// UPVOTE POST
// ======================================

exports.upvotePost = async (req, res) => {

    try {

        if (!req.user?.id) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.user.id;

        // CHECK ALREADY UPVOTED
        const alreadyUpvoted = post.upvotes.some(
            (id) => id.toString() === userId
        );

        // TOGGLE OFF
        if (alreadyUpvoted) {

            post.upvotes = post.upvotes.filter(
                (id) => id.toString() !== userId
            );

            await post.save();

            return res.json({
                message: "Upvote removed",
                karma: post.upvotes.length - post.downvotes.length
            });
        }

        // REMOVE DOWNVOTE IF EXISTS
        post.downvotes = post.downvotes.filter(
            (id) => id.toString() !== userId
        );

        // ADD UPVOTE
        post.upvotes.push(userId);

        await post.save();

        return res.json({
            message: "Post upvoted",
            karma: post.upvotes.length - post.downvotes.length
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

};


// ======================================
// DOWNVOTE POST
// ======================================

exports.downvotePost = async (req, res) => {

    try {

        if (!req.user?.id) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.user.id;

        // CHECK ALREADY DOWNVOTED
        const alreadyDownvoted = post.downvotes.some(
            (id) => id.toString() === userId
        );

        // TOGGLE OFF
        if (alreadyDownvoted) {

            post.downvotes = post.downvotes.filter(
                (id) => id.toString() !== userId
            );

            await post.save();

            return res.json({
                message: "Downvote removed",
                karma: post.upvotes.length - post.downvotes.length
            });
        }

        // REMOVE UPVOTE IF EXISTS
        post.upvotes = post.upvotes.filter(
            (id) => id.toString() !== userId
        );

        // ADD DOWNVOTE
        post.downvotes.push(userId);

        await post.save();

        return res.json({
            message: "Post downvoted",
            karma: post.upvotes.length - post.downvotes.length
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

};


// ======================================
// REMOVE VOTE (RESET)
// ======================================

exports.removeVote = async (req, res) => {

    try {

        if (!req.user?.id) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.user.id;

        post.upvotes = post.upvotes.filter(
            (id) => id.toString() !== userId
        );

        post.downvotes = post.downvotes.filter(
            (id) => id.toString() !== userId
        );

        await post.save();

        return res.json({
            message: "Vote removed",
            karma: post.upvotes.length - post.downvotes.length
        });

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

};