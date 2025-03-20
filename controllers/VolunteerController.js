const express = require('express');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const VolunteerParticipation = require('../models/VolunteerParticipation');
const Certificate = require('../models/Certificate');
const Feedback = require('../models/Feedback');
const cloudinary = require('../config/cloudiary');

//Lấy thông tin chi tiết của một tình nguyện viên
exports.getVolunteerDetails = async (req, res) => {
    try {
        const { volunteerId } = req.params;

        // ✅ Tìm thông tin tình nguyện viên
        const volunteer = await Volunteer.findById(volunteerId).populate('user');
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        //Lấy danh sách dự án đã tham gia
        const participations = await VolunteerParticipation.find({ volunteer: volunteerId })
            .populate({
                path: 'project',
                select: 'title description startDate endDate'
            });

        //Lấy danh sách chứng chỉ của tình nguyện viên
        const certificates = await Certificate.find({ volunteer: volunteerId })
            .populate({
                path: 'project',
                select: 'title'
            });

        //Lấy danh sách feedbacks của tình nguyện viên
        const feedbacks = await Feedback.find({ user: volunteer.user._id })
            .populate({
                path: 'project',
                select: 'title'
            });

        res.status(200).json({
            success: true,
            data: {
                volunteer,
                participations,
                certificates,
                feedbacks
            }
        });
    } catch (error) {
        console.error("❌ Error fetching volunteer details:", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.    getCurrentVolunteer = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        if (!userId) {
            return res.status(401).json({ message: 'User ID not found in request' });
        }

        // Populate user và skills
        const volunteer = await Volunteer.findOne({ user: userId })
            .populate('user', '-password') // Exclude password for security
            .populate('skills', 'name');

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer profile not found' });
        }

        res.status(200).json(volunteer);
    } catch (error) {
        console.error("❌ Error fetching volunteer profile:", error);
        res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};

//Lấy danh sách tất cả tình nguyện viên
exports.getAllVolunteer = async (req, res) => {
    try {
        const volunteers = await Volunteer.find().populate('user', 'fullName email img_profile');

        res.status(200).json({
            success: true,
            data: volunteers
        });

    } catch (error) {
        console.error("❌ Error fetching all volunteers:", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// exports.updateProfile = async (req, res) => {
//     try {
//         const userId = req.user.userId; // Lấy ID user từ token

//         // Tìm volunteer theo userId
//         let volunteer = await Volunteer.findOne({ user: userId }).populate('user');
//         if (!volunteer) {
//             return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
//         }

//         // Cập nhật thông tin volunteer
//         const { fullName, phone, dateOfBirth, gender, bio, location, skills } = req.body;
//         if (fullName) {
//             volunteer.fullName = fullName;
//             await User.findByIdAndUpdate(userId, { fullName }); // ✅ Cập nhật tên trong User model
//         }
//         if (phone) volunteer.phone = phone;
//         if (dateOfBirth) volunteer.dateOfBirth = dateOfBirth;
//         if (gender) volunteer.gender = gender;
//         if (bio) volunteer.bio = bio;
//         if (location) volunteer.location = location;
//         if (skills) volunteer.skills = skills;

//         await volunteer.save();

//         res.status(200).json({ success: true, message: 'Profile updated successfully', volunteer });
//     } catch (error) {
//         console.error("❌ Error updating volunteer profile:", error);
//         res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// };

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from token

        // Find volunteer by userId
        let volunteer = await Volunteer.findOne({ user: userId }).populate('user');
        if (!volunteer) {
            return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
        }
        let user = await User.findById({ _id : userId })
        // Update volunteer information
        const { fullName, phone, dateOfBirth, gender, bio, location } = req.body;
        
        // Handle skills which is sent as a JSON string
        let skills = [];
        if (req.body.skills) {
            try {
                skills = JSON.parse(req.body.skills);
            } catch (err) {
                console.error("Error parsing skills:", err);
            }
        }
        
        // Update basic fields
        if (fullName) {
            volunteer.fullName = fullName;
            await User.findByIdAndUpdate(userId, { fullName }); // Update name in User model
        }
        if (phone) volunteer.phone = phone;
        if (dateOfBirth) volunteer.dateOfBirth = dateOfBirth;
        if (gender) volunteer.gender = gender;
        if (bio) volunteer.bio = bio;
        if (location) volunteer.location = location;
        if (skills.length > 0) volunteer.skills = skills;
        // Handle profile image upload
        if (req.file) {
            // If there's an existing profile image, delete it from Cloudinary first
            if (user.img_profile) {
                // Extract the public_id from the URL
                const urlParts = user.img_profile.split('/');
                const publicIdWithExtension = urlParts[urlParts.length - 1];
                const publicId = publicIdWithExtension.split('.')[0];
                const folderPath = 'user_profiles';
                
                // Delete the existing image
                await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
            }
            
            // Upload the new image
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'user_profiles',
            });
            user.img_profile = result.secure_url;
        }

        await volunteer.save();
        await user.save();
        res.status(200).json({ 
            success: true, 
            message: 'Profile updated successfully', 
            volunteer 
        });
    } catch (error) {
        console.error("❌ Error updating volunteer profile:", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};