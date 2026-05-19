const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    // /post/javascript-basics-for-beginners
    // like this we have the slug, and we can use it to access the community page like /c/javascript-basics-for-beginners
    description: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        enum: ["predefined", "custom"],
        default: "custom"
    },

    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    moderators: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true });

module.exports = mongoose.model("Community", communitySchema);