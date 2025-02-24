const express = require('express');

const router = express.Router();

exports.getAllVolunteer = async (req, res) => {
    try {
        res.send("Tao la Volunteer!!")
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

