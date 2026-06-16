const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const getBadges = require("../helpers/getBadges");////removeee thisss



const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId)
            .select("-password -email -rollNumber") 
            .populate("joinedCommunities", "name slug")
            .lean();

        if (!user) return res.status(404).json({ message: "User not found" });

        const posts = await Post.find({ author: userId })
            .populate("author", "name avatar karma")
            .populate("community", "name slug")
            .sort({ createdAt: -1 });

        const comments = await Comment.find({ author: userId })
            .populate("author", "name avatar")
            .populate("post", "title")
            .sort({ createdAt: -1 });

        const badges = getBadges(user.karma || 0);//// removee thiss

        res.json({
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
            bio: user.bio,
            karma: user.karma,
            role: user.role,           // ✅ include role
            department: user.department,
            batch: user.batch,
            badges,///removee thiss
            createdAt: user.createdAt,
            joinedCommunities: user.joinedCommunities,
            postsCount: posts.length,
            commentsCount: comments.length,
            posts,
            comments
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =======================================
// GET USER POSTS
// =======================================
const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.userId })
            .populate("author", "name avatar karma")
            .populate("community", "name slug")
            .sort({ createdAt: -1 });
        res.json({ posts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =======================================
// GET USER COMMENTS
// =======================================
const getUserComments = async (req, res) => {
    try {
        const comments = await Comment.find({ author: req.params.userId })
            .populate("author", "name avatar")
            .populate("post", "title")
            .sort({ createdAt: -1 });
        res.json({ comments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =======================================
// GET SAVED POSTS
// =======================================
const getSavedPosts = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: "savedPosts",
            populate: [
                { path: "author", select: "name avatar karma" },
                { path: "community", select: "name slug" }
            ]
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ posts: user.savedPosts || [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =======================================
// UPDATE PROFILE
// =======================================
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, bio } = req.body;

        let avatarUrl;

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "campusVoice/avatars", resource_type: "image" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });
            avatarUrl = result.secure_url;
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (avatarUrl) updateData.avatar = avatarUrl;

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
            .select("-password -email -rollNumber");

        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getUserProfile,
    getUserPosts,
    getUserComments,
    updateProfile,
    getSavedPosts
};