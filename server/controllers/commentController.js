const Comment = require("../models/commentModel");
const Post = require("../models/postModel");


// ======================================
// BUILD COMMENT TREE
// ======================================

function buildCommentTree(comments, parent = null) {

    let result = [];

    comments.forEach((comment) => {

        // TOP LEVEL COMMENTS

        if (

            (!comment.parentComment && !parent)

            ||

            comment.parentComment?.toString() ===
            parent?.toString()

        ) {

            result.push({

                ...comment._doc,

                replies: buildCommentTree(
                    comments,
                    comment._id
                )

            });

        }

    });

    return result;
}


// ======================================
// CREATE COMMENT / REPLY
// ======================================

exports.createComment = async (req, res) => {

    try {

        const {
            body,
            postId,
            parentComment,
            isAnonymous
        } = req.body;

        // VALIDATE BODY

        if (!body || !body.trim()) {

            return res.status(400).json({
                message: "Comment body is required"
            });

        }

        // CHECK POST EXISTS

        const post = await Post.findById(postId);

        if (!post) {

            return res.status(404).json({
                message: "Post not found"
            });

        }

        // CHECK PARENT COMMENT EXISTS

        if (parentComment) {

            const parentExists =
                await Comment.findById(parentComment);

            if (!parentExists) {

                return res.status(404).json({
                    message: "Parent comment not found"
                });

            }

        }

        // CREATE COMMENT

        const comment = await Comment.create({

            body,

            author: req.user.id,

            post: postId,

            parentComment: parentComment || null,

            isAnonymous: isAnonymous || false

        });

        res.status(201).json({

            message: "Comment created",

            comment

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// ======================================
// GET COMMENTS OF POST
// ======================================

exports.getCommentsByPost = async (req, res) => {

    try {

        const comments = await Comment.find({

            post: req.params.postId

        })

            .populate("author", "username")

            .sort({ createdAt: -1 });

        // BUILD TREE

        const threadedComments =
            buildCommentTree(comments);

        res.json(threadedComments);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// ======================================
// UPDATE COMMENT
// ======================================

exports.updateComment = async (req, res) => {

    try {

        const comment = await Comment.findById(
            req.params.commentId
        );

        if (!comment) {

            return res.status(404).json({
                message: "Comment not found"
            });

        }

        // OWNER CHECK

        if (
            comment.author.toString() !== req.user.id
        ) {

            return res.status(403).json({
                message: "Unauthorized"
            });

        }

        // VALIDATE BODY

        if (!req.body.body || !req.body.body.trim()) {

            return res.status(400).json({
                message: "Comment body is required"
            });

        }

        comment.body = req.body.body;

        await comment.save();

        res.json({

            message: "Comment updated",

            comment

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// ======================================
// DELETE COMMENT
// ======================================

exports.deleteComment = async (req, res) => {

    try {

        const comment = await Comment.findById(
            req.params.commentId
        );

        if (!comment) {

            return res.status(404).json({
                message: "Comment not found"
            });

        }

        // OWNER CHECK

        if (
            comment.author.toString() !== req.user.id
        ) {

            return res.status(403).json({
                message: "Unauthorized"
            });

        }

        await comment.deleteOne();

        res.json({
            message: "Comment deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// ======================================
// UPVOTE COMMENT
// ======================================

exports.upvoteComment = async (req, res) => {

    try {

        const comment = await Comment.findById(
            req.params.commentId
        );

        if (!comment) {

            return res.status(404).json({
                message: "Comment not found"
            });

        }

        const userId = req.user.id;

        // ALREADY UPVOTED ?

        const alreadyUpvoted =
            comment.upvotes.some(
                (id) => id.toString() === userId
            );

        // TOGGLE REMOVE

        if (alreadyUpvoted) {

            comment.upvotes =
                comment.upvotes.filter(
                    (id) => id.toString() !== userId
                );

            await comment.save();

            return res.json({
                message: "Upvote removed",
                karma:
                    comment.upvotes.length -
                    comment.downvotes.length
            });

        }

        // REMOVE DOWNVOTE

        comment.downvotes =
            comment.downvotes.filter(
                (id) => id.toString() !== userId
            );

        // ADD UPVOTE

        comment.upvotes.push(userId);

        await comment.save();

        res.json({

            message: "Comment upvoted",

            karma:
                comment.upvotes.length -
                comment.downvotes.length

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


// ======================================
// DOWNVOTE COMMENT
// ======================================

exports.downvoteComment = async (req, res) => {

    try {

        const comment = await Comment.findById(
            req.params.commentId
        );

        if (!comment) {

            return res.status(404).json({
                message: "Comment not found"
            });

        }

        const userId = req.user.id;

        // ALREADY DOWNVOTED ?

        const alreadyDownvoted =
            comment.downvotes.some(
                (id) => id.toString() === userId
            );

        // TOGGLE REMOVE

        if (alreadyDownvoted) {

            comment.downvotes =
                comment.downvotes.filter(
                    (id) => id.toString() !== userId
                );

            await comment.save();

            return res.json({

                message: "Downvote removed",

                karma:
                    comment.upvotes.length -
                    comment.downvotes.length

            });

        }

        // REMOVE UPVOTE

        comment.upvotes =
            comment.upvotes.filter(
                (id) => id.toString() !== userId
            );

        // ADD DOWNVOTE

        comment.downvotes.push(userId);

        await comment.save();

        res.json({

            message: "Comment downvoted",

            karma:
                comment.upvotes.length -
                comment.downvotes.length

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// MongoDB returns:

// [
//     comment1,
//     comment2,
//     comment3
// ]

// FLAT array.

// We convert into:

// [
//     {
//         comment,
//         replies: [
//             {
//                 reply,
//                 replies: []
//             }
//         ]
//     }
// ]

// TREE structure.