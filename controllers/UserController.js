const express = require('express');
const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.json(users)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.inActiveAccount = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cập nhật trạng thái thành "approved"
        user.status = 'Inactive';
        await user.save();

        res.json({ message: 'User deactive successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
