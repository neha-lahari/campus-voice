const User = require("../models/userModel");
const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");



// =======================================
// GET USER PROFILE
// =======================================

const getUserProfile = async (req, res) => {

    try {

        const userId = req.params.userId;

        const user = await User.findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



// =======================================
// GET USER POSTS
// =======================================

const getUserPosts = async (req, res) => {

    try {

        const userId = req.params.userId;

        const posts = await Post.find({
            author: userId
        })
            .populate("author", "name avatar")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};




// =======================================
// GET USER COMMENTS
// =======================================

const getUserComments = async (req, res) => {

    try {

        const userId = req.params.userId;

        const comments = await Comment.find({
            user: userId
        })
            .populate("user", "name avatar")
            .sort({ createdAt: -1 });

        res.status(200).json(comments);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};




// =======================================
// UPDATE OWN PROFILE
// =======================================

const updateProfile = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            name,
            bio,
            avatar,
            department,
            batch,
            year,
            isAnonymous
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                name,
                bio,
                avatar,
                department,
                batch,
                year,
                isAnonymous
            },
            { new: true }
        ).select("-password");

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};




// =======================================
// GET KARMA + BADGES
// =======================================

const getKarmaBadges = async (req, res) => {

    try {

        const userId = req.params.userId;

        const user = await User.findById(userId)
            .select("name avatar karma badges");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};




module.exports = {
    getUserProfile,
    getUserPosts,
    getUserComments,
    updateProfile,
    getKarmaBadges
};