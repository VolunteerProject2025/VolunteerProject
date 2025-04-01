const express = require('express');
const OrganizationController = require('../controllers/OrgController');
const {authenticateToken} = require("../middleware/auth");
const upload = require('../middleware/upload');
const router = express.Router();
router.post('/',authenticateToken,upload.single('profileImage'), OrganizationController.createNewOrganization);

router.get('/org-details',authenticateToken, OrganizationController.orgProfile);
router.put('/:organizationId/approve', OrganizationController.approveOrganization);
router.get('/', OrganizationController.getAllOrganization);
router.get('/pending', OrganizationController.getPendingOrganization);
router.get('/:userId/details', OrganizationController.getOrganizationDetailsByUserId);
router.get('/:organizationId', OrganizationController.getOrganizationDetails);
router.put('/edit-org',authenticateToken,upload.single('profileImage'), OrganizationController.editOrganization);

module.exports = router;
