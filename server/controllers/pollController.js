const Poll = require("../models/pollModel");


// ======================================
// HELPER: CALCULATE RESULTS
// ======================================

function calculateResults(poll) {

    const total = poll.options.reduce(
        (sum, opt) => sum + opt.votes.length,
        0
    );

    return poll.options.map(opt => ({
        text: opt.text,
        votes: opt.votes.length,
        percentage: total === 0
            ? 0
            : Number(((opt.votes.length / total) * 100).toFixed(2))
    }));

}


// ======================================
// CREATE POLL
// ======================================

exports.createPoll = async (req, res) => {

    try {

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { question, options, communityId, expiresAt } = req.body;

        if (!question || !options || options.length < 2) {
            return res.status(400).json({
                message: "Question + at least 2 options required"
            });
        }

        const poll = await Poll.create({
            question,
            options: options.map(opt => ({
                text: opt,
                votes: []
            })),
            community: communityId,
            createdBy: req.user.id,
            expiresAt: expiresAt || null,
            isActive: true
        });

        res.status(201).json({
            message: "Poll created",
            poll
        });

    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};


// ======================================
// VOTE ON POLL (NO DUPLICATES)
// ======================================

exports.votePoll = async (req, res) => {

    try {

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { pollId, optionIndex } = req.body;
        const userId = req.user.id;

        const poll = await Poll.findById(pollId);

        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }

        // EXPIRE CHECK
        if (
            !poll.isActive ||
            (poll.expiresAt && poll.expiresAt < new Date())
        ) {
            poll.isActive = false;
            await poll.save();

            return res.status(400).json({
                message: "Poll is closed"
            });
        }

        if (
            optionIndex < 0 ||
            optionIndex >= poll.options.length
        ) {
            return res.status(400).json({
                message: "Invalid option"
            });
        }

        // REMOVE USER FROM ALL OPTIONS (prevents duplicate votes)
        poll.options = poll.options.map(opt => ({
            ...opt._doc,
            votes: opt.votes.filter(
                id => id.toString() !== userId
            )
        }));

        // ADD VOTE
        poll.options[optionIndex].votes.push(userId);

        await poll.save();

        res.json({
            message: "Vote recorded",
            results: calculateResults(poll)
        });

    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};


// ======================================
// GET POLL RESULTS
// ======================================

exports.getPollResults = async (req, res) => {

    try {

        const poll = await Poll.findById(req.params.pollId);

        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }

        // auto-expire check
        if (poll.expiresAt && poll.expiresAt < new Date()) {
            poll.isActive = false;
            await poll.save();
        }

        res.json({
            question: poll.question,
            isActive: poll.isActive,
            results: calculateResults(poll)
        });

    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};


// ======================================
// GET POLLS BY COMMUNITY
// ======================================

exports.getPollsByCommunity = async (req, res) => {

    try {

        let polls = await Poll.find({
            community: req.params.communityId
        }).sort({ createdAt: -1 });

        // auto-filter expired polls in response
        const now = new Date();

        polls = polls.map(poll => {
            if (poll.expiresAt && poll.expiresAt < now) {
                poll.isActive = false;
            }

            return {
                ...poll._doc,
                results: calculateResults(poll)
            };
        });

        res.json(polls);

    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};


// ======================================
// DELETE POLL (CREATOR ONLY)
// ======================================

exports.deletePoll = async (req, res) => {

    try {

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const poll = await Poll.findById(req.params.pollId);

        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }

        if (poll.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not allowed" });
        }

        await poll.deleteOne();

        res.json({ message: "Poll deleted" });

    } catch (err) {

        res.status(500).json({ message: err.message });

    }

};