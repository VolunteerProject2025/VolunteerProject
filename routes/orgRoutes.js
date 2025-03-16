const express = require('express');
const router = express.Router();
const {orgProfile,editOrganization} = require('../controllers/OrgController');
const {authenticateToken} = require("../middleware/auth");


router.get('/org-details',authenticateToken, orgProfile);
router.post('/edit-org', editOrganization);

module.exports = router;