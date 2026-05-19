const express = require("express");
const router = express.Router();

const pollController = require("../controllers/pollController");

router.post("/create", pollController.createPoll);
router.post("/vote", pollController.votePoll);

router.get("/:pollId/results", pollController.getPollResults);

router.get("/community/:communityId", pollController.getPollsByCommunity);

router.delete("/:pollId", pollController.deletePoll);

module.exports = router;
