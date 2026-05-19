const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // DM chat (user ↔ user)
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Community chat (group)
        community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            default: null
        },

        text: {
            type: String,
            trim: true,
            default: ""
        },

        attachments: [
            {
                url: String,
                name: String
            }
        ],

        isRead: {
            type: Boolean,
            default: false
        }

    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);