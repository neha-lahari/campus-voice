const Post = require("../models/postModel");
const User = require("../models/userModel");
const Community = require("../models/communityModel");
const Notice = require("../models/noticeModel");



// =======================================
// GLOBAL SEARCH
// =======================================

const globalSearch = async (req, res) => {

    try {

        const {
            query,
            page = 1,
            limit = 10,
            sort = "new"
        } = req.query;

        const skip = (page - 1) * limit;

        let sortOption = {};



        // SORTING

        if (sort === "new") {
            sortOption = { createdAt: -1 };
        }

        if (sort === "old") {
            sortOption = { createdAt: 1 };
        }



        // =======================================
        // SEARCH POSTS
        // =======================================

        const posts = await Post.find({
            $or: [
                {
                    title: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {
                    content: {
                        $regex: query,
                        $options: "i"
                    }
                }
            ]
        })
            .populate("author", "name avatar")
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));



        // =======================================
        // SEARCH USERS
        // =======================================

        const users = await User.find({
            $or: [
                {
                    name: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {
                    rollNumber: {
                        $regex: query,
                        $options: "i"
                    }
                }
            ]
        })
            .select("name avatar karma department batch");



        // =======================================
        // SEARCH COMMUNITIES
        // =======================================

        const communities = await Community.find({
            name: {
                $regex: query,
                $options: "i"
            }
        })
            .skip(skip)
            .limit(Number(limit));



        // =======================================
        // SEARCH NOTICES
        // =======================================

        const notices = await Notice.find({
            $or: [
                {
                    title: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {
                    content: {
                        $regex: query,
                        $options: "i"
                    }
                }
            ]
        })
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));



        res.status(200).json({
            posts,
            users,
            communities,
            notices
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};



module.exports = {
    globalSearch
};