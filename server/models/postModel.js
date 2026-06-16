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

        flair: {/// im i relly using thiss, letes seee
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

        isSolved: {///removeeee thisss
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

postSchema.virtual("karma").get(function () {////removeee thissss
    return this.upvotes.length - this.downvotes.length;
});

module.exports =
    mongoose.models.Post ||
    mongoose.model("Post", postSchema);
