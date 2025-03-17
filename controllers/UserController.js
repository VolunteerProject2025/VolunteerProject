const express = require('express');
const User = require('../models/User');

exports.searchUsers = async (req,res)=> {
    try{
        const { term } = req.query;
        if (!term) {
            return res.status(400).json({ error: "Search term is required" });
        }

        const users = await User.find({  $or: [
            { fullName: { $regex: term, $options: "i" } },
            { email: { $regex: term, $options: "i" } }
        ] })
        
        res.status(200).json(users)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: error });
    }
}


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json(users)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
};

exports.inActiveAccount = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = 'Inactive';
        await user.save();

        res.status(200).json({ message: 'User deactive successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
};

exports.activeAccount = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = 'Active';
        await user.save();

        res.status(200).json({ message: 'User active successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
};
exports.findUserById = async (req,res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user)


    }
    catch (error) {
        console.error("Error fetching user:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
