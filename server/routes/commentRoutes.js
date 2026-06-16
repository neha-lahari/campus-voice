const express = require('express');
const router = express.Router();
const { createComment, getComments,voteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createComment);
router.get('/', protect, getComments);
router.post("/:id/vote", protect, voteComment);

module.exports = router;