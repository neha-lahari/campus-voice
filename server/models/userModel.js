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

    bio: {
        type: String,
        default: ""
    },

    avatar: {
        type: String,
        default: ""
    },


    isAnonymous: {
        type: Boolean,
        default: false
    },

    savedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],

    joinedCommunities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community"
    }]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);