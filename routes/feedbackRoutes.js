const express = require('express');
const FeedbackController = require('../controllers/FeedbackController');

const router = express.Router();

router.get('/', FeedbackController.getAllFeedback);

module.exports = router;