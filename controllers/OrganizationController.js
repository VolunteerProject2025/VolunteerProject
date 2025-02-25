const express = require('express');
const User = require('../models/User');
const Organization = require('../models/Organization');

// exports.getPendingOrganization = async (req, res) => {
//     try {
//         const pendings = await Organization.find({ status: "Pending" });

//         res.json(pendings)
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// exports.getRejectOrganization = async (req, res) => {
//     try {
//         const rejects = await Organization.find({ status: "Rejected" });

//         res.json(rejects)
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// exports.getApproveOrganization = async (req, res) => {
//     try {
//         const approved = await Organization.find({ status: "Approved" });

//         res.json(approved)
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

const getOrganizationByStatus = async (status, res) => {
    try {
        const organizations = await Organization.find({ status });

        res.json(organizations)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getPendingOrganization = (req, res) => getOrganizationByStatus("Pending", res);
exports.getRejectOrganization = (req, res) => getOrganizationByStatus("Rejected", res);
exports.getApproveOrganization = (req, res) => getOrganizationByStatus("Approved", res);

exports.getAllOrganization = async (req, res) => {
    try {
        const organizations = await Organization.find();
        
        res.json(organizations)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getOrganizationDetails = async (req, res) => {
    try {
        const { organizationId } = req.params;

        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        res.json({ organization });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.approveOrganization = async (req, res) => {
    try {
        const { organizationId } = req.params;

        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Cập nhật trạng thái thành "approved"
        organization.status = 'Approved';
        await organization.save();

        res.json({ message: 'Organization approved successfully', organization });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};