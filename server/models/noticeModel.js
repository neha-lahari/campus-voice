const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            default: "general",
            trim: true,
            lowercase: true
        },

        deadline: {
            type: Date,
            default: null
        },

        priority: {
            type: String,
            enum: ["high", "medium", "normal"],
            default: "normal"
        },

        community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        attachments: [
            {
                url: String,
                public_id: String,
                name: String
            }
        ],

        isArchived: {
            type: Boolean,
            default: false
        },

        reminderSent: {
            type: Boolean,
            default: false
        }

    },
    { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);