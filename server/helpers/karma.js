const User = require("../models/userModel");

// POST UPVOTE
exports.upvotePost = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        $inc: { karma: 1 }
    });
};

// POST DOWNVOTE
exports.downvotePost = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        $inc: { karma: -1 }
    });
};

// COMMENT UPVOTE
exports.upvoteComment = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        $inc: { karma: 1 }
    });
};

// POST SOLVED (+5)
exports.markSolved = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        $inc: { karma: 5 }
    });
};