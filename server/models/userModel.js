const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    rollNumber: {
        type: String,
        unique: true
    },

    department: String,

    batch: String,

    year: Number,

    role: {
        type: String,
        enum: ["student", "cr", "admin"],
        default: "student"
    },



    // ======================
    // PROFILE FIELDS
    // ======================

    bio: {
        type: String,
        default: ""
    },

    avatar: {
        type: String,
        default: ""
    },



    // ======================
    // KARMA + BADGES
    // ======================

    karma: {
        type: Number,
        default: 0
    },

    badges: [
        {
            type: String
        }
    ],



    // ======================
    // SETTINGS
    // ======================

    isAnonymous: {
        type: Boolean,
        default: false
    },



    // ======================
    // SAVED POSTS
    // ======================

    savedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);