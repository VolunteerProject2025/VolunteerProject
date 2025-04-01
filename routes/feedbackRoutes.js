const express = require('express');
const FeedbackController = require('../controllers/FeedbackController');
const {authenticateToken} = require("../middleware/auth");

const router = express.Router();

router.get('/', FeedbackController.getAllFeedback);
router.post('/', authenticateToken, FeedbackController.createFeedback);

// Get feedback for a specific project
router.get('/project/:projectId', FeedbackController.getProjectFeedback);

// Get feedback for an organization
router.get('/organization/:organizationId', FeedbackController.getOrganizationFeedback);
module.exports = router;