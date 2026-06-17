const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        body: {
            type: String,
            default: "",
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            required: true,
        },

        flair: {
            type: String,
            default: "",
        },

        isAnonymous: {
            type: Boolean,
            default: false,
        },

        link: {
            type: String,
            default: "",
        },

        attachments: [
            {
                url: String,
                fileType: String,
            },
        ],

        upvotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        downvotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

    },
    { timestamps: true }
);

module.exports =
    mongoose.models.Post ||
    mongoose.model("Post", postSchema);
