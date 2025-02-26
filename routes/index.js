const express = require('express');
const volunteerRoutes = require('./volunteerRoutes');
const postRoutes = require('./postRoutes');
const scheduleRoutes = require('./scheduleRoutes');


const router = express.Router();

// Định tuyến các route
router.use('/volunteers', volunteerRoutes);
router.use('/post', postRoutes);
router.use('/schedules', scheduleRoutes);

module.exports = router;
