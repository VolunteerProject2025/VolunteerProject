const express = require('express');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const VolunteerParticipation = require('../models/VolunteerParticipation');
const Certificate = require('../models/Certificate');
const Feedback = require('../models/Feedback');

const router = express.Router();

// Lấy thông tin chi tiết của một tình nguyện viên
exports.getVolunteerDetails = async (req, res) => {
    try {
        const { volunteerId } = req.params;

        // Tìm thông tin tình nguyện viên
        const volunteer = await Volunteer.findById(volunteerId).populate('user');
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        // Lấy danh sách các dự án đã tham gia
        const participations = await VolunteerParticipation.find({ volunteer: volunteerId })
            .populate('project');

        // Lấy danh sách chứng chỉ của tình nguyện viên
        const certificates = await Certificate.find({ volunteer: volunteerId })
            .populate('project');

        // Lấy danh sách đánh giá mà tình nguyện viên đã để lại
        const feedbacks = await Feedback.find({ user: volunteer.user._id })
            .populate('project');

        res.json({
            volunteer,
            participations,
            certificates,
            feedbacks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllVolunteer = async (req, res) => {
    try {
        res.send("Tao la Volunteer!!")
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

