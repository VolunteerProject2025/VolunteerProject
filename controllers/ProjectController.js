const express = require('express');
const mongoose = require("mongoose");
const Project = require('../models/Project');
const Organization = require("../models/Organization");
const Volunteer = require("../models/Volunteer");




// exports.getAllProjects = async (req, res) => {
//     try {
//         const projects = await Project.find();

//         res.json(projects)
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

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
      const { title, description, location, categories, startDate, endDate, status, organization, volunteerNumber } = req.body;

      

      // Nếu có ảnh, lấy đường dẫn file
      const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

      // Tạo một dự án mới
      const newProject = new Project({
          title,
          description,
          location,
          categories,
          image: imagePath, // Lưu đường dẫn ảnh
          startDate,
          endDate,
          organization,
          status,
          
          volunteerNumber
      });
      console.log(newProject);

      // Lưu vào database
      await newProject.save();

       // ✅ Trả về projectId để client sử dụng
       res.status(201).json({ 
        message: "Project created successfully", 
        projectId: newProject._id, 
        project: newProject 
    });
    console.log("projectid: "+ newProject._id);
  } catch (error) {
      res.status(500).json({ message: "Error creating project", error: error.message });
  }
};


// @desc Get all projects
// @route GET /projects
exports.getAllProjects = async (req, res) => {
  try {
    await Organization.find();
    const projects = await Project.find()
      .populate("organization", "name email") // Populate organization info
      // .populate("volunteer", "fullName email" ); // Populate volunteer info
      console.log("Projects:", projects);

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
      .populate("organization")
      // .populate("volunteer", "fullName email");

   

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    } 

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc Get all projects by Organization ID
// @route GET /projects/organization/:organizationId
exports.getProjectByOrgId = async (req, res) => {
  try {
      const { organizationId } = req.params;

      // Kiểm tra tổ chức có tồn tại không
      const organizationExists = await Organization.findById(organizationId);
      if (!organizationExists) {
          return res.status(404).json({ success: false, message: "Organization not found" });
      }

      // Tìm tất cả dự án thuộc về tổ chức đó
      const projects = await Project.find({ organization: organizationId })
          .populate("organization", "name email");
          
          console.log( "project:" + projects);

      if (!projects.length) {
          return res.status(404).json({ success: false, message: "No projects found for this organization" });
      }

      res.status(200).json(projects);
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};


// @desc Update a project by ID
// @route PUT /projects/:id
exports.updateProject = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Nếu có file ảnh, thêm vào dữ liệu cập nhật
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    console.log("Request body:", req.body); // Log request body
    console.log("Request params:", req.params);
    console.log(updatedProject);
    
    if (!updatedProject) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true , updatedProject });
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