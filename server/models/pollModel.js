const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({

    question: {
        type: String,
        required: true,
        trim: true
    },

    options: [
        {
            text: String,
            votes: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }
            ]
        }
    ],

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

    expiresAt: {
        type: Date,
        default: null
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Poll", pollSchema);