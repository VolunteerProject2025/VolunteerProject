const express = require('express');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const VolunteerParticipation = require('../models/VolunteerParticipation');
const Notification = require("../models/Notification");

const getVolunteerParticipationByStatus = async (status, req, res) => {
    try {
        const { projectId } = req.params;
        const volunteers = await VolunteerParticipation.find({ status, project: projectId })
            .populate({
                path: 'volunteer',
                populate: { path: 'skills' }
            })
            .populate('project')
        ;

        res.json(volunteers)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getPendingVolunteerParticipation = (req, res) => getVolunteerParticipationByStatus("Pending", req, res);
exports.getCompletedVolunteerParticipation = (req, res) => getVolunteerParticipationByStatus("Completed", req, res);

exports.approveVolunteerToProject = async (req, res) => {
    try {
        const { volunteerId, projectId } = req.params;

        const volunteer = await VolunteerParticipation.findOne({ volunteer: volunteerId, project: projectId })
            .populate('volunteer')
            .populate('project')
            
        ;
        // console.log(volunteer);

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        volunteer.status = 'Accepted';
        await volunteer.save();
        await Notification.create({
            user: volunteer.volunteer.user,
            type: 'PROJECT_APPROVED',
            message: `Your have been approved to join "${volunteer.project.title}" !`,
            read: false
          });
        res.json({ message: 'Volunteer approved successfully', volunteer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.rejectVolunteerToProject = async (req, res) => {
    try {
        const { volunteerId, projectId } = req.params;

        const volunteer = await VolunteerParticipation.findOne({ volunteer: volunteerId, project: projectId })
            .populate('volunteer')
            .populate('project')
        ;
        // console.log(volunteer);

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        volunteer.status = 'Rejected';
        await volunteer.save();
        await Notification.create({
            user: volunteer.volunteer.user,
            type: 'PROJECT_REJECTED',
            message: `Your have been rejected to join "${volunteer.project.title}" !`,
            read: false
          });
        res.json({ message: 'Volunteer approved successfully', volunteer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};