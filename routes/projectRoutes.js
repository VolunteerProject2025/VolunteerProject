const express = require('express');
const ProjectController = require('../controllers/ProjectController');

const router = express.Router();

router.get('/', ProjectController.getAllProjects);
router.get('/:projectId/approve', ProjectController.approveProject);
router.post("/", ProjectController.createProject);
router.get("/", ProjectController.getAllProjects);
router.get("/:id", ProjectController.getProjectById);
router.put("/:id", ProjectController.updateProject);
router.delete("/:id", ProjectController.deleteProject);

module.exports = router;
