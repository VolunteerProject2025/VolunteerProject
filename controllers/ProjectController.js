const express = require('express');
const Project = require('../models/Project');

exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();

        res.json(projects)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.approveProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Cập nhật trạng thái thành "approved"
        project.status = 'Approved';
        await project.save();

        res.json({ message: 'Project approved successfully', project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};