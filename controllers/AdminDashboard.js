const express = require('express');
const Project = require('../models/Project');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Post = require('../models/Post');

exports.getDashboard = async (req, res) => {
    try {
        const [
            projects, pendingProjects, approveProjects, rejectProjects, completedProjects,
            org, pendingOrg, approveOrg, rejectOrg,
            users, activeUser, inActiveUser, volunteers, organizations,
            posts
        ] = await Promise.all([
            Project.countDocuments(),
            Project.countDocuments({ status: 'Pending' }),
            Project.countDocuments({ status: 'Approved' }),
            Project.countDocuments({ status: 'Rejected' }),
            Project.countDocuments({ status: 'Completed' }),

            Organization.countDocuments(),
            Organization.countDocuments({ status: 'Pending' }),
            Organization.countDocuments({ status: 'Approved' }),
            Organization.countDocuments({ status: 'Rejected' }),

            User.countDocuments(),
            User.countDocuments({ status: 'Active' }),
            User.countDocuments({ status: 'Inactive' }),
            User.countDocuments({ role: 'Volunteer' }),
            User.countDocuments({ role: 'Organization' }),

            Post.countDocuments()
        ]);

        res.json({
            projects: { total: projects, pending: pendingProjects, approved: approveProjects, rejected: rejectProjects, completed: completedProjects },
            organizations: { total: org, pending: pendingOrg, approved: approveOrg, rejected: rejectOrg },
            users: { total: users, active: activeUser, inactive: inActiveUser, volunteers, organizations },
            posts: { total: posts }
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};