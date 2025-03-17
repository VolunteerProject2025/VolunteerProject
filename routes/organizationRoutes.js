const express = require('express');
const OrganizationController = require('../controllers/OrganizationController');
const {authenticateToken} = require("../middleware/auth");
const router = express.Router();

router.get('/', OrganizationController.getAllOrganization);
router.get('/org-details',authenticateToken, OrganizationController.orgProfile);

router.get('/pending', OrganizationController.getPendingOrganization);

// router.get('/:organizationId', OrganizationController.getOrganizationDetails);
router.put('/:organizationId/approve', OrganizationController.approveOrganization);
router.get('/user/:userId', OrganizationController.getOrganizationByUserId);

module.exports = router;
