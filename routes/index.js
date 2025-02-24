const express = require('express');
const volunteerRoutes = require('./volunteerRoutes');

const router = express.Router();

// Định tuyến các route
router.use('/volunteers', volunteerRoutes);

module.exports = router;
