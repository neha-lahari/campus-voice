const mongoose = require("mongoose");

const Post = require("../models/postModel");
const User = require("../models/userModel");
const Community = require("../models/communityModel");

const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");


const createPost = async (req, res) => {
    try {
        const { title, body, community, flair, isAnonymous, link } = req.body;

        if (!title || !community) {
            return res.status(400).json({
                success: false,
                message: "Title and community are required"
            });
        }

        const communityExists = await Community.findById(community);
        if (!communityExists) {
            return res.status(404).json({
                success: false,
                message: "Community not found"
            });
        }

        let attachments = [];

        if (req.files?.length) {
            for (const file of req.files) {

                const isPDF = file.mimetype === "application/pdf";

                const uploadedFile = await new Promise((resolve, reject) => {
                    const publicId = isPDF
                        ? `${Date.now()}-${file.originalname}`      
                        : `${Date.now()}-${file.originalname.replace(".pdf", "")}`;
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: "campusvoice_posts",
                            resource_type: isPDF ? "raw" : "auto",
                            public_id: publicId,
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );

                    streamifier.createReadStream(file.buffer).pipe(stream);
                });

                let fileType = "file";

                if (file.mimetype.startsWith("image/")) {
                    fileType = "image";
                } else if (isPDF) {
                    fileType = "pdf";
                }

                // force inline PDF rendering
                let finalUrl = uploadedFile.secure_url;

                if (isPDF) {
                    finalUrl = finalUrl.replace(
                        "/upload/",
                        "/upload/fl_attachment:false/fl_inline/"
                    );
                }

                attachments.push({
                    url: uploadedFile.secure_url,
                    fileType
                });
            }
        }

        const post = await Post.create({
            title,
            body: body || "",
            author: req.user.id,
            community,
            flair: flair || "",
            isAnonymous: isAnonymous === "true" || isAnonymous === true,
            link: link || "",
            attachments,
            upvotes: [],
            downvotes: []
        });

        return res.status(201).json({
            success: true,
            post
        });

    } catch (err) {
        console.error("CREATE POST ERROR:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


const getFeedPosts = async (req, res) => {
    try {
        const filter = req.query.community
            ? { community: new mongoose.Types.ObjectId(req.query.community) }
            : {};

        const posts = await Post.find(filter)
            .populate("author", "name rollNumber avatar")
            .populate("community", "name slug")
            .sort({ createdAt: -1 });

        res.json({ success: true, posts });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ================= GET POST BY ID =================
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "name rollNumber avatar")
            .populate("community", "name slug");

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Not found"
            });
        }

        res.json({
            success: true,
            post,
            voteCount: post.upvotes.length - post.downvotes.length
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const votePost = async (req, res) => {
    try {
        const { type } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const userId = req.user.id;

        const hadUpvote = post.upvotes.some(id => id.toString() === userId);
        const hadDownvote = post.downvotes.some(id => id.toString() === userId);

        post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
        post.downvotes = post.downvotes.filter(id => id.toString() !== userId);

        let userVote = null;

        if (type === "up") {
            if (!hadUpvote) {
                post.upvotes.push(userId);
                userVote = "up";
            }
        }

        if (type === "down") {
            if (!hadDownvote) {
                post.downvotes.push(userId);
                userVote = "down";
            }
        }

        await post.save();

        res.json({
            success: true,
            upvotes: post.upvotes.length,
            downvotes: post.downvotes.length,
            voteCount: post.upvotes.length - post.downvotes.length,
            userVote
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const savePost = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const id = req.params.id;

        const exists = user.savedPosts.includes(id);

        if (exists) {
            user.savedPosts = user.savedPosts.filter(p => p.toString() !== id);
        } else {
            user.savedPosts.push(id);
        }

        await user.save();

        res.json({ success: true, saved: !exists });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not allowed" });
        }

        if (req.body.title) post.title = req.body.title;
        if (req.body.body) post.body = req.body.body;

        await post.save();

        res.json({ success: true, post });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const isAuthor = post.author.toString() === req.user.id;
        const isModerator =
            req.user.role === "admin" ||
            req.user.role === "moderator";

        if (!isAuthor && !isModerator) {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Post deleted"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


module.exports = {
    createPost,
    getFeedPosts,
    getPostById,
    votePost,
    savePost,
    updatePost,
    deletePost
};