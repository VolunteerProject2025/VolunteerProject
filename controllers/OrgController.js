const Organization = require("../models/Organization");
const Notification = require("../models/Notification");
const cloudinary = require('../config/cloudiary');
exports.createNewOrganization = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        const { name, description, contactEmail, address, phone } = req.body;
        let org_profile = null;

        if (!name || !contactEmail || !phone) {
            return res.status(400).json({ message: 'Name, Email, and Phone are required fields' });
        }

        // Handle file upload if present
        if (req.file) {
            const cloudinary = require('../utils/cloudinary');
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'organization_profiles',
            });
            org_profile = result.secure_url;
        }

        const organization = new Organization({
            name,
            description,
            contactEmail,
            address,
            phone,
            user: req.user.userId,
            org_profile: org_profile,
        });

        await organization.save();

        res.status(201).json({ message: 'Organization created successfully', organization });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};
exports.approveOrganization = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }
        const { organizationId } = req.params;

        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Cập nhật trạng thái thành "approved"
        organization.status = 'Approved';
        await organization.save();
        const notfication = await Notification.create({
            user: organization.user._id,
            type: 'ORGANIZATION_APPROVED',
            message: `Your organization "${organization.name}" has been approved!`,
            organizationId: organization._id,
            read: false
          });
          console.log(notfication);
        res.json({ message: 'Organization approved successfully', organization });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.editOrganization = async (req, res) => {
    try {
        const { name, description, contactEmail, address, phone } = req.body;
        let updateData = { 
            name, 
            description, 
            contactEmail, 
            address, 
            phone, 
            status: 'Pending' 
        };

        // Ensure req.user is populated by the authentication middleware
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        // Handle file upload if present
        if (req.file) {
      
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'organization_profiles',
            });
            updateData.org_profile = result.secure_url;
        }

        // Find and update organization by authenticated user
        const updatedOrganization = await Organization.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        );
            
        if (!updatedOrganization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        res.status(200).json({ message: 'Organization updated successfully', organization: updatedOrganization });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
    exports.orgProfile = async (req, res) => {
        try {
            if (!req.user || !req.user.userId) {
                return res.status(401).json({ message: 'Unauthorized - User not found' });
            }
    
            const organization = await Organization.findOne({ user: req.user.userId }).populate("user");
            if (!organization) {
                return res.status(404).json({ message: 'Organization not found' });
            }
    
            res.status(200).json({ organization });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    };
    

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

