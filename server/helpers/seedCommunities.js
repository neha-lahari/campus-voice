const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Community = require("../models/communityModel");

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const communities = [
    {
        name: "Doubt Clearing",
        slug: "doubt-clearing",
        description: "Ask academic doubts",
        type: "predefined",
        members: [],
        moderators: []
    },
    {
        name: "Placements",
        slug: "placements",
        description: "Placement discussions",
        type: "predefined",
        members: [],
        moderators: []
    },
    {
        name: "Hostel",
        slug: "hostel",
        description: "Hostel discussions",
        type: "predefined",
        members: [],
        moderators: []
    },
    {
        name: "Lost & Found",
        slug: "lost-found",
        description: "Lost items in campus",
        type: "predefined",
        members: [],
        moderators: []
    },
    {
        name: "Professor Reviews",
        slug: "professor-reviews",
        description: "Review professors",
        type: "predefined",
        members: [],
        moderators: []
    },
    {
        name: "Events",
        slug: "events",
        description: "Campus events",
        type: "predefined",
        members: [],
        moderators: []
    },
    {
        name: "Teammate Finder",
        slug: "teammate-finder",
        description: "Find teammates",
        type: "predefined",
        members: [],
        moderators: []
    },
    {
        name: "Memes",
        slug: "memes",
        description: "Campus memes",
        type: "predefined",
        members: [],
        moderators: []
    }
];

const seedCommunities = async () => {
    try {

        await Community.deleteMany();
        await Community.insertMany(communities);

        console.log("Communities Seeded");

        process.exit();

    } catch (err) {

        console.error(err);

        process.exit(1);
    }
};

seedCommunities();