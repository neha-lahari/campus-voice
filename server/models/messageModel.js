const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", default: null },
        community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", default: null },

        text: { type: String, default: "" },

        attachments: [
            {
                url: String,
                fileType: String,
                name: String
            }
        ],

        pinned: { type: Boolean, default: false },

        seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

        deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);