const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    body: {
        type: String,
        default: ""
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        required: true
    },

    type: {
        type: String,
        lowercase: true,
        trim: true,
        default: "general"
    },

    flair: String,

    upvotes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    },

    downvotes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    },

    isAnonymous: {
        type: Boolean,
        default: false
    },

    attachments: [String]

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

postSchema.virtual("karma").get(function () {
    return this.upvotes.length - this.downvotes.length;
});

module.exports =
    mongoose.models.Post ||
    mongoose.model("Post", postSchema);
