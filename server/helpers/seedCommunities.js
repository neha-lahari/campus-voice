require("dotenv").config();
const mongoose = require("mongoose");
const Community = require("../models/communityModel");

const communities = [
    {
        name: "Doubt Clearing",
        slug: "doubt-clearing",
        description: "Ask and solve academic doubts",
    },
    {
        name: "Placements",
        slug: "placements",
        description: "Placement updates and interview prep",
    },
    {
        name: "Hostel",
        slug: "hostel",
        description: "Hostel life discussions",
    },
    {
        name: "Lost & Found",
        slug: "lost-found",
        description: "Lost and found items",
    },
    {
        name: "Professor Reviews",
        slug: "professor-reviews",
        description: "Rate and review professors",
    },
    {
        name: "Events",
        slug: "events",
        description: "College events and fests",
    },
    {
        name: "Teammate Finder",
        slug: "teammate-finder",
        description: "Find teammates for projects",
    },
    {
        name: "Memes",
        slug: "memes",
        description: "College memes ",
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Community.deleteMany();
        await Community.insertMany(communities);

        console.log("✅ Communities seeded successfully");

        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

seed();