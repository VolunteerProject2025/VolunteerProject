const express = require('express');
const Project = require('../models/Project');
const Organization = require("../models/Organization");
const Project = require("../models/Project");
const Volunteer = require("../models/Volunteer");

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

// @desc Create a new project
// @route POST /projects
exports.createProject = async (req, res) => {
  try {
    const { title, description, startDate, endDate, status, organization, volunteers } = req.body;

    const newProject = new Project({
      title,
      description,
      startDate,
      endDate,
      status,
      organization,
      volunteers,
    });

    const savedProject = await newProject.save();
    res.status(201).json({ success: true, data: savedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all projects
// @route GET /projects
exports.getAllProjects = async (req, res) => {
  try {
    await Organization.find();
    await Volunteer.find();
    const projects = await Project.find()
      .populate("organization", "name email") // Populate organization info
      .populate("volunteer", "fullName email" ); // Populate volunteer info

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } 
};

// @desc Get a single project by ID
// @route GET /projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("organization", "name email")
      .populate("volunteer", "fullName email");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update a project by ID
// @route PUT /projects/:id
exports.updateProject = async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProject) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete a project by ID
// @route DELETE /projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};