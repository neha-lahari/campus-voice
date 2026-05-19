const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({

    body: {
        type: String,
        required: true
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },

    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },

    upvotes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    downvotes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    isAnonymous: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports =
    mongoose.models.Comment ||
    mongoose.model("Comment", commentSchema);