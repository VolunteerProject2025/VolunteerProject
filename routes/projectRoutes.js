const express = require('express');
const ProjectController = require('../controllers/ProjectController');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/", ProjectController.getAllProjects);
router.post("/", ProjectController.createProject);
router.get('/:projectId/approve', ProjectController.approveProject);


router.get("/:id", ProjectController.getProjectById);
router.put("/:id", upload.single("image"), ProjectController.updateProject);
router.delete("/:id", ProjectController.deleteProject);
router.get('/organization/:organizationId', ProjectController.getProjectByOrgId);

module.exports = router;
