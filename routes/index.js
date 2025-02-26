const express = require('express');
const volunteerRoutes = require('./volunteerRoutes');
const postRoutes = require('./postRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const organizationRoutes = require('./organizationRoutes');
const projectRoutes = require('./projectRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// Định tuyến các route
router.use('/volunteers', volunteerRoutes);
router.use('/post', postRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/projects', projectRoutes);
router.use('/organizations', organizationRoutes);
router.use('/projects', projectRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/users', userRoutes);

module.exports = router;
