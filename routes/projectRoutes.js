const express = require('express');
const ProjectController = require('../controllers/ProjectController');

const router = express.Router();

router.get('/', ProjectController.getAllProjects);
router.get('/:projectId/approve', ProjectController.approveProject);

module.exports = router;
