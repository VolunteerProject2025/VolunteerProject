const express = require('express');
const mongoose = require("mongoose");
const Project = require('../models/Project');
const Organization = require("../models/Organization");
const Volunteer = require("../models/Volunteer");
const VolunteerParticipation = require("../models/VolunteerParticipation")

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
    const projects = await Project.find()
      .populate("organization", "name email") // Populate tổ chức
      .lean(); // ✅ Chuyển đổi sang object để dễ xử lý dữ liệu

    // ✅ Tìm danh sách tất cả các volunteer tham gia dự án (đã được accept)
    const participationList = await VolunteerParticipation.find({ status: "Accepted" })
      .populate("volunteer", "fullName email")
      .populate("project", "_id");

    // ✅ Gán danh sách volunteer vào project tương ứng
    const projectMap = projects.map((project) => {
      const volunteers = participationList
        .filter((p) => p.project._id.toString() === project._id.toString())
        .map((p) => ({
          _id: p.volunteer._id,
          fullName: p.volunteer.fullName,
          email: p.volunteer.email,
          status: p.status,
        }));

      return { ...project, volunteers }; // ✅ Gán danh sách volunteers vào từng project
    });

    res.status(200).json({ success: true, data: projectMap });
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get a single project by ID
// @route GET /projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("organization", "name email")
      .lean(); // ✅ Chuyển đổi sang object để dễ xử lý dữ liệu

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // ✅ Tìm volunteer có trạng thái "Accepted" trong project này
    const participationList = await VolunteerParticipation.find({ project: req.params.id, status: "Accepted" })
      .populate("volunteer", "fullName email");

    // ✅ Gán danh sách volunteers vào project
    project.volunteers = participationList.map((p) => ({
      _id: p.volunteer._id,
      fullName: p.volunteer.fullName,
      email: p.volunteer.email,
      status: p.status,
    }));

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error("❌ Error fetching project:", error);
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

exports.joinProject = async (req, res) => {
  try {
      const { projectId } = req.params;
      const volunteerId = req.user?.userId; // Lấy ID từ token

      console.log("📌 Join Request: Project ID:", projectId);
      console.log("📌 Join Request: User ID:", volunteerId);

      if (!volunteerId) {
          console.log("❌ Unauthorized request, missing userId");
          return res.status(401).json({ error: "Unauthorized - No user ID found" });
      }

      // Kiểm tra dự án có tồn tại không
      const project = await Project.findById(projectId);
      if (!project) {
          console.log("❌ Project not found");
          return res.status(404).json({ error: "Project not found" });
      }

      // Kiểm tra người dùng có phải tình nguyện viên không
      const volunteer = await Volunteer.findOne({ user: volunteerId });
      if (!volunteer) {
          console.log("❌ User is not a registered volunteer");
          return res.status(403).json({ error: "You are not a volunteer" });
      }

      console.log("📌 Volunteer found:", volunteer._id);

      // Kiểm tra nếu đã gửi yêu cầu trước đó
      const existingRequest = await VolunteerParticipation.findOne({ 
          volunteer: volunteer._id, 
          project: projectId 
      });

      if (existingRequest) {
          console.log("❌ Join request already exists with status:", existingRequest.status);
          return res.status(400).json({ error: `Join request already sent (Status: ${existingRequest.status})` });
      }

      // Thêm tình nguyện viên vào danh sách dự án
      const newParticipation = new VolunteerParticipation({
        volunteer: volunteer._id,
        project: projectId,
        status: "Pending"
      });

      await newParticipation.save();
      console.log("✅ Join request saved:", newParticipation);
      await new Promise((resolve) => setTimeout(resolve, 500));
      res.status(201).json({ message: "Join request sent, waiting for approval" });

  } catch (error) {
      console.error("❌ Join Project Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.manageVolunteerRequest = async (req, res) => {
  try {
      const { projectId, volunteerId } = req.params;
      const { action } = req.body; // "Accept" hoặc "Reject"

      // ✅ Tìm request của volunteer trong dự án
      const participation = await VolunteerParticipation.findOne({ volunteer: volunteerId, project: projectId });
      if (!participation) {
          return res.status(404).json({ error: "Volunteer request not found" });
      }

      if (!["Accepted", "Rejected"].includes(action)) {
          return res.status(400).json({ error: "Invalid action" });
      }

      // ✅ Cập nhật trạng thái
      participation.status = action;
      await participation.save();

      res.status(200).json({ message: `Volunteer request ${action.toLowerCase()} successfully` });

  } catch (error) {
      console.error("❌ Manage Volunteer Request Error:", error);
      res.status(500).json({ error: "Failed to manage request", details: error.message });
  }
};

exports.getProjectVolunteers = async (req, res) => {
  try {
      const { projectId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      // ✅ Tìm danh sách đã được Accepted
      const participationList = await VolunteerParticipation.find({ project: projectId, status: "Accepted" })
          .populate('volunteer', 'fullName email')
          .skip(skip)
          .limit(parseInt(limit));

      const totalVolunteers = await VolunteerParticipation.countDocuments({ project: projectId, status: "Accepted" });

      // ✅ Nếu chưa có volunteer nào, trả về 200 với danh sách rỗng
      if (!participationList.length) {
          return res.status(200).json({ success: true, data: [], total: 0, totalPages: 1 });
      }

      // ✅ Chuẩn hóa dữ liệu trả về
      const volunteers = participationList.map(participation => ({
          _id: participation.volunteer._id,
          fullName: participation.volunteer.fullName,
          email: participation.volunteer.email
      }));

      res.status(200).json({
          success: true,
          data: volunteers,
          total: totalVolunteers,
          totalPages: Math.ceil(totalVolunteers / limit)
      });

  } catch (error) {
      console.error("Get Project Volunteers Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }  
};

exports.getUserParticipationStatus = async (req, res) => {
  try {
      const { projectId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
          console.log("❌ Unauthorized request, missing userId");
          return res.status(401).json({ error: "Unauthorized - No user ID found" });
      }

      console.log("📌 Checking participation for user:", userId, "in project:", projectId);

      // 🔍 Tìm `volunteerId` tương ứng với `userId`
      const volunteer = await Volunteer.findOne({ user: userId });

      if (!volunteer) {
          console.log("❌ User is not a registered volunteer");
          return res.status(404).json({ status: "Not Joined" });
      }

      console.log("📌 Found Volunteer ID:", volunteer._id);

      // 🔍 Tìm participation bằng `volunteer._id`
      const participation = await VolunteerParticipation.findOne({
          project: new mongoose.Types.ObjectId(projectId),
          volunteer: volunteer._id
      });

      if (!participation) {
          console.log("ℹ️ No participation found");
          return res.status(200).json({ status: "Not Joined" });
      }

      console.log("✅ User participation status:", participation.status);
      res.status(200).json({ status: participation.status });

  } catch (error) {
      console.error("❌ Error fetching participation status:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};