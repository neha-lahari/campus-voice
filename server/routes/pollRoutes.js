const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware"); // ✅ named import, not default

const pollController = require("../controllers/pollController");

// CREATE POLL
router.post("/", protect, pollController.createPoll);

// VOTE
router.post("/:id/vote", protect, pollController.votePoll);

// GET COMMUNITY POLLS
router.get("/", pollController.getPolls);

// GET RESULTS
router.get("/:pollId/results", pollController.getPollResults);

// DELETE
router.delete("/:pollId", protect, pollController.deletePoll);

module.exports = router;