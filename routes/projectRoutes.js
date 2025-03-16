const express = require('express');
const ProjectController = require('../controllers/ProjectController');
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get('/', ProjectController.getAllProjects);
router.get('/:projectId/approve', ProjectController.approveProject);
router.post("/", ProjectController.createProject);
router.get("/", ProjectController.getAllProjects);
router.get("/:id", ProjectController.getProjectById);
router.put("/:id", ProjectController.updateProject);
router.delete("/:id", ProjectController.deleteProject);
router.post('/:projectId/join', authenticateToken, ProjectController.joinProject);
router.put('/:projectId/volunteers/:volunteerId', authenticateToken, ProjectController.manageVolunteerRequest);
router.get('/:projectId/volunteers', ProjectController.getProjectVolunteers);
router.get("/:projectId/participation-status", authenticateToken, ProjectController.getUserParticipationStatus);

module.exports = router;
