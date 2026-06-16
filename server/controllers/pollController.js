const Poll = require("../models/pollModel");

// =====================================
// HELPER — add vote counts + percentages
// =====================================
const formatPoll = (poll) => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
    return {
        ...poll._doc,
        options: poll.options.map(opt => ({
            ...opt._doc,
            voteCount: opt.votes.length,
            percentage: totalVotes === 0
                ? 0
                : Math.round((opt.votes.length / totalVotes) * 100)
        })),
        totalVotes
    };
};

// =====================================
// CREATE POLL
// =====================================
exports.createPoll = async (req, res) => {
    try {
        const { question, options, community, expiresAt } = req.body;

        if (!question) return res.status(400).json({ message: "Question required" });
        if (!options || options.length < 2 || options.length > 4) {
            return res.status(400).json({ message: "2-4 options required" });
        }
        if (!community) return res.status(400).json({ message: "community required" });

        const poll = await Poll.create({
            question,
            options: options.map(opt => ({ text: opt, votes: [] })),
            community,
            createdBy: req.user.id,
            expiresAt: expiresAt || null,
            isActive: true
        });

        const populated = await Poll.findById(poll._id)
            .populate("createdBy", "name karma"); // ✅ name not username

        res.status(201).json(formatPoll(populated));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =====================================
// VOTE
// =====================================
exports.votePoll = async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const userId = req.user.id;

        const poll = await Poll.findById(req.params.id)
            .populate("createdBy", "name karma");

        if (!poll) return res.status(404).json({ message: "Poll not found" });

        // CHECK EXPIRED
        if (!poll.isActive || (poll.expiresAt && new Date(poll.expiresAt) < new Date())) {
            poll.isActive = false;
            await poll.save();
            return res.status(400).json({ message: "Poll closed" });
        }

        // CHECK VALID OPTION
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ message: "Invalid option" });
        }

        // CHECK ALREADY VOTED
        const alreadyVoted = poll.options.some(opt =>
            opt.votes.some(v => v.toString() === userId)
        );
        if (alreadyVoted) return res.status(400).json({ message: "Already voted" });

        poll.options[optionIndex].votes.push(userId);
        await poll.save();

        const updated = await Poll.findById(poll._id).populate("createdBy", "name karma");
        res.json(formatPoll(updated));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =====================================
// GET POLLS FOR COMMUNITY
// =====================================
exports.getPolls = async (req, res) => {
    try {
        const { community } = req.query;
        if (!community) return res.status(400).json({ message: "community required" });

        const now = new Date();
        let polls = await Poll.find({ community })
            .populate("createdBy", "name karma")
            .sort({ createdAt: -1 });

        polls = polls.map(poll => {
            if (poll.expiresAt && poll.expiresAt < now) poll.isActive = false;
            return formatPoll(poll);
        });

        res.json(polls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =====================================
// GET RESULTS
// =====================================
exports.getPollResults = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.pollId)
            .populate("createdBy", "name karma");
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        res.json(formatPoll(poll));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =====================================
// DELETE
// =====================================
exports.deletePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.pollId);
        if (!poll) return res.status(404).json({ message: "Poll not found" });

        if (poll.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await poll.deleteOne();
        res.json({ message: "Poll deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};