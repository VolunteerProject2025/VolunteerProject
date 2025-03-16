const express = require('express');
const volunteerRoutes = require('./volunteerRoutes');
const postRoutes = require('./postRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const organizationRoutes = require('./organizationRoutes');
const projectRoutes = require('./projectRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('../routes/authRoutes');
const orgRoutes = require('../routes/orgRoutes');
const skillRoutes = require('./skillRoutes');

const router = express.Router();

// Định tuyến các route
router.use('/auth', authRoutes);
router.use('/org', orgRoutes);
router.use('/volunteers', volunteerRoutes);
router.use('/post', postRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/projects', projectRoutes);
router.use('/organizations', organizationRoutes);
router.use('/projects', projectRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/users', userRoutes);
router.use('/skills', skillRoutes);

module.exports = router;
