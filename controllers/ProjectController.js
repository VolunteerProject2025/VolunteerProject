const Project = require('../models/Project');
const User = require('../models/User');

const Organization = require("../models/Organization");
const Notification = require("../models/Notification");
const VolunteerParticipation = require("../models/VolunteerParticipation")
const { sendSuccessEmail, sendRejectEmail } = require('./authController');
const Volunteer = require("../models/Volunteer");
const mongoose = require('mongoose');

exports.getCompletedProjects = async (req, res) => {
  try {
      // Get the logged-in user's ID from the request (assuming auth middleware sets this)
      const userId = req.user.userId;

      // Find the volunteer profile associated with this user
      const volunteer = await Volunteer.findOne({ user: userId });
      
      if (!volunteer) {
          return res.status(404).json({ 
              success: false, 
              message: 'Volunteer profile not found for this user' 
          });
      }

      // Find all completed participations for this volunteer
      const completedParticipations = await VolunteerParticipation.find({
        volunteer: volunteer._id,
        status: 'Completed'
    })
    .populate({
        path: 'project',
        match: { status: 'Completed' }, // Only include completed projects
        populate: {
            path: 'organization',
            select: 'name img_profile description' // Populate organization details
        }
    });
      // Filter out any null projects (in case a project was deleted or isn't completed)
      const completedProjects = completedParticipations
      .filter(participation => participation.project)
      .map(participation => ({
          ...participation.project.toObject(),
          volunteerFullName: volunteer.fullName // Attach the volunteer's full name
      }));  
      return res.status(200).json({
        success: true,
        count: completedProjects.length,
        data: completedProjects
    });
  } catch (error) {
      console.error('Error fetching completed projects:', error);
      return res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message
      });
  }
};
exports.getPendingProjects = async (req, res) => {
  try {
    await Organization.find();
    await Volunteer.find();
    const projects = await Project.find({status: 'Pending'})
      .populate("organization", "name email")
      .populate("volunteer", "fullName email" )
      .sort({ updatedAt: -1 });
    console.log(projects);
    

    res.status(200).json( projects );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } 
};

exports.approveProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("organization");

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const organization = await Organization.findById(project.organization._id).populate("user");
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Update project status
    project.status = 'Approved';
    await project.save();

    // Send email notification
    const ownerEmail = organization.user.email;
    sendSuccessEmail(ownerEmail, `Your project "${project.title}" has been approved!`);

    // Send real-time notification via Socket.io
  
    
    // Create notification object
    await Notification.create({
      user: organization.user._id,
      type: 'PROJECT_APPROVED',
      message: `Your project "${project.title}" has been approved!`,
      projectId: project._id,
      organizationId: organization._id,
      read: false
    });

    // You might want to store notifications in the database too
    // This ensures users will see them even if they're offline when the notification is created
    
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
      const admins = await User.find({ role: 'Admin' });
    
    // Create notifications for all admins
    if (admins.length > 0) {
      const notifications = admins.map(admin => ({
        user: admin._id,
        type: 'PROJECT_CREATED',
        message: `A project "${newProject.title}" has been created!`,
        read: false
      }));
      await Notification.insertMany(notifications);
    }
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
    console.log("error: "+ error);

      res.status(500).json({ message: "Error creating project", error: error.message });
  }
};
// @desc Get all projects
// @route GET /projects
exports.getAllProjects = async (req, res) => {
  try {
    await Organization.find();
    await Volunteer.find();
    const projects = await Project.find({status: 'Approved'})
      .populate("organization", "name email") // Populate organization info
      .populate("volunteer", "fullName email" ) // Populate volunteer info
      .sort({ createdAt: -1 }); 

    res.status(200).json( projects );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } 
};

// @desc Get a single project by ID
// @route GET /projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({path: "organization",
        select: "name contactEmail address user"})
      .populate({
        path: "volunteer",
        populate: [
          {
            path: 'user',
            model: 'User',
            select: 'fullName email'
          }
        ]
      });
   
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.updateProjectCompleted = async (req, res) => {
  try {
    const updateData = { ...req.body };
   
    console.log(updateData);
    
    // Remove volunteer field from update data to prevent CastError
    // Only let the specialized joinProject endpoint manage volunteers
    delete updateData.volunteer;
    
    // Handle organization ObjectId conversion
    if (updateData.organization) {
      try {
        // Convert string to ObjectId or leave as is if already an ObjectId
        if (typeof updateData.organization === 'string' && updateData.organization.trim() !== '') {
          updateData.organization = new mongoose.Types.ObjectId(updateData.organization);
        } else {
          // Remove empty strings or invalid values
          delete updateData.organization;
        }
      } catch (err) {
        // If conversion fails, just delete the field to prevent errors
        delete updateData.organization;
        console.log("Invalid organization ID, removing from update data");
      }
    }

    // Remove any empty strings or null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '' || updateData[key] === null || updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // If there's an image file, add it to update data
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    console.log("Final update data:", updateData);

    const updatedProject = await Project.findByIdAndUpdate(req.params.id,  { $set: updateData }, {
      new: true,
      runValidators: true,
    });
    
    if (!updatedProject) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const admins = await User.find({ role: 'Admin' });
    
    // Create notifications for all admins
    if (admins.length > 0) {
      const notifications = admins.map(admin => ({
        user: admin._id,
        type: 'PROJECT_MODIFY',
        message: `A project "${updatedProject.title}" has been updated!`,
        read: false
      }));
      await Notification.insertMany(notifications);
    }
    res.status(200).json({ success: true, data: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc Update a project by ID
// @route PUT /projects/:id
exports.updateProject = async (req, res) => {
  try {
    const updateData = { ...req.body };
   
    console.log(updateData);
    
    // Remove volunteer field from update data to prevent CastError
    // Only let the specialized joinProject endpoint manage volunteers
    delete updateData.volunteer;
    
    // Handle organization ObjectId conversion
    if (updateData.organization) {
      try {
        // Convert string to ObjectId or leave as is if already an ObjectId
        if (typeof updateData.organization === 'string' && updateData.organization.trim() !== '') {
          updateData.organization = new mongoose.Types.ObjectId(updateData.organization);
        } else {
          // Remove empty strings or invalid values
          delete updateData.organization;
        }
      } catch (err) {
        // If conversion fails, just delete the field to prevent errors
        delete updateData.organization;
        console.log("Invalid organization ID, removing from update data");
      }
    }

    // Remove any empty strings or null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '' || updateData[key] === null || updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // If there's an image file, add it to update data
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    console.log("Final update data:", updateData);

    const updatedProject = await Project.findByIdAndUpdate(req.params.id,  { $set: updateData, status: 'Pending' }, {
      new: true,
      runValidators: true,
    });
    
    if (!updatedProject) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const admins = await User.find({ role: 'Admin' });
    
    // Create notifications for all admins
    if (admins.length > 0) {
      const notifications = admins.map(admin => ({
        user: admin._id,
        type: 'PROJECT_MODIFY',
        message: `A project "${updatedProject.title}" has been updated!`,
        read: false
      }));
      await Notification.insertMany(notifications);
    }
    res.status(200).json({ success: true, data: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
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
          .populate("organization", "name email user");
          
          console.log( "project:" + projects);

      if (!projects.length) {
          return res.status(404).json({ success: false, message: "No projects found for this organization" });
      }

      res.status(200).json(projects);
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectProject = async (req, res) => {
  try {
      const { projectId } = req.params;

      const project = await Project.findById(projectId).populate("organization");
      // console.log(project.organization._id);
      const organization = await Organization.findById(project.organization._id).populate("user");
      // console.log(organization);
      // console.log(organization.contactEmail);

      if (!project) {
          return res.status(404).json({ message: 'Project not found' });
      }
      await Notification.create({
        user: organization.user._id,
        type: 'PROJECT_REJECT',
        message: `Your project "${project.title}" has been rejected!`,
        projectId: project._id,
        organizationId: organization._id,
        read: false
      });
      // Cập nhật trạng thái thành "rejected"
      project.status = 'Rejected';
      await project.save();

      sendRejectEmail(organization.contactEmail, organization.name)

      res.json({ message: 'Project rejected successfully', project });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.joinProject = async (req, res) => {
  try {
      const { projectId } = req.params;
      const volunteerId = req.user?.userId; // Lấy ID từ token
      const {message} = req.body


      if (!volunteerId) {
          return res.status(401).json({ error: "Unauthorized - No user ID found" });
      }

      // Kiểm tra dự án có tồn tại không
      const project = await Project.findById(projectId).populate("organization");
      const organization = await Organization.findById(project.organization._id).populate("user");

      if (!project) {
          return res.status(404).json({ error: "Project not found" });
      }

      // Kiểm tra người dùng có phải tình nguyện viên không
      const volunteer = await Volunteer.findOne({ user: volunteerId });
      if (!volunteer) {
          return res.status(403).json({ error: "You are not a volunteer" });
      }


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
        status: "Pending",
        message : message
      });
      await Notification.create({
        user: organization.user._id,
        type: 'PROJECT_REJECT',
        message: `A volunteer has submit a request to join "${project.title}"!`,
        projectId: project._id,
        organizationId: organization._id,
        volunteerId:volunteerId,
        read: false
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