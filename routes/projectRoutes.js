const express = require('express');
const ProjectController = require('../controllers/ProjectController');
const {authenticateToken} = require("../middleware/auth");

const router = express.Router();

router.get('/', ProjectController.getAllProjects);
router.get('/pending', ProjectController.getPendingProjects);

router.post('/:projectId/join', authenticateToken, ProjectController.joinProject);
router.get('/:projectId/volunteers', ProjectController.getProjectVolunteers);
router.get("/:projectId/participation-status", authenticateToken, ProjectController.getUserParticipationStatus);
router.get("/organization/:organizationId", ProjectController.getProjectByOrgId)
router.get('/:projectId/approve', ProjectController.approveProject);
router.get('/:projectId/reject', ProjectController.rejectProject);
router.post("/", ProjectController.createProject);
router.get("/", ProjectController.getAllProjects);
router.get("/:id", ProjectController.getProjectById);
router.put("/:id", ProjectController.updateProject);
router.delete("/:id", ProjectController.deleteProject);
module.exports = router;
