const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const { createNotification } = require('../helpers/createNotification');

exports.createComment = async (req, res) => {
    try {
        const { postId, body, parentCommentId } = req.body;

        if (!postId || !body) {
            return res.status(400).json({
                success: false,
                message: "postId and body required"
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const comment = await Comment.create({
            body,
            author: req.user.id,
            post: postId,
            parentComment: parentCommentId || null
        });

        await comment.populate("author", "name rollNumber avatar");

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (parentComment && parentComment.author.toString() !== req.user.id) {
                await createNotification({
                    userId: parentComment.author,
                    type: "REPLY",
                    message: `${req.user.name || "Someone"} replied to your comment`,
                    link: `/post/${postId}`,
                    metadata: { postId, commentId: comment._id }
                });
            }
        }
        else {
            if (post.author.toString() !== req.user.id) {
                await createNotification({
                    userId: post.author,
                    type: "COMMENT",
                    message: `${req.user.name || "Someone"} commented on your post`,
                    link: `/post/${postId}`,
                    metadata: { postId, commentId: comment._id }
                });
            }
        }

        res.status(201).json({
            success: true,
            comment
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { postId } = req.query;

        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "postId required"
            });
        }

        const comments = await Comment.find({ post: postId })
            .populate("author", "name rollNumber avatar")
            .sort({ createdAt: 1 });

        res.json({
            success: true,
            comments
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.voteComment = async (req, res) => {
    try {
        const { type } = req.body;
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const userId = req.user.id;

        comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId);
        comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId);

        let userVote = null;

        if (type === "up") {
            comment.upvotes.push(userId);
            userVote = "up";
        } else if (type === "down") {
            comment.downvotes.push(userId);
            userVote = "down";
        }

        await comment.save();

        return res.json({
            success: true,
            upvotes: comment.upvotes.length,
            downvotes: comment.downvotes.length,
            voteCount: comment.upvotes.length - comment.downvotes.length,
            userVote
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};