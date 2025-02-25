const express = require('express');
const Feedback = require('../models/Feedback');

exports.getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find();

        res.json(feedbacks)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};