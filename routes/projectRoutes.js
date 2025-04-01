const express = require('express');
const ProjectController = require('../controllers/ProjectController');
const VolunteerParticipationController = require('../controllers/VolunteerParticipationController');

const {authenticateToken} = require("../middleware/auth");

const router = express.Router();

router.get('/', ProjectController.getAllProjects);
router.get('/pending', ProjectController.getPendingProjects);
router.get('/:projectId/pending-volunteer', VolunteerParticipationController.getPendingVolunteerParticipation);
router.put('/:volunteerId/:projectId/approveVolunteer', VolunteerParticipationController.approveVolunteerToProject);
router.put('/:volunteerId/:projectId/rejectVolunteer', VolunteerParticipationController.rejectVolunteerToProject);
router.post('/:projectId/join', authenticateToken, ProjectController.joinProject);
router.get('/:projectId/volunteers', ProjectController.getProjectVolunteers);
router.get("/:projectId/participation-status", authenticateToken, ProjectController.getUserParticipationStatus);
router.get("/organization/:organizationId", ProjectController.getProjectByOrgId)
router.get('/completed-projects', authenticateToken, ProjectController.getCompletedProjects);

router.get('/:projectId/approve', ProjectController.approveProject);
router.get('/:projectId/reject', ProjectController.rejectProject);
router.post("/", ProjectController.createProject);
router.get("/", ProjectController.getAllProjects);
router.get("/:id", ProjectController.getProjectById);
router.put("/completed/:id", ProjectController.updateProjectCompleted);

router.put("/:id", ProjectController.updateProject);
router.delete("/:id", ProjectController.deleteProject);

module.exports = router;
