const express = require('express');
const OrganizationController = require('../controllers/OrgController');

const router = express.Router();

router.get('/', OrganizationController.getAllOrganization);
router.get('/pending', OrganizationController.getPendingOrganization);
router.get('/:organizationId', OrganizationController.getOrganizationDetails);
router.put('/:organizationId/approve', OrganizationController.approveOrganization);

module.exports = router;
