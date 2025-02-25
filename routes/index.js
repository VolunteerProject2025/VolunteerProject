const express = require('express');
const volunteerRoutes = require('./volunteerRoutes');
const projectRoutes = require('./projectRoutes');

const router = express.Router();

// Định tuyến các route
router.use('/volunteers', volunteerRoutes);
router.use('/projects', projectRoutes);


module.exports = router;
