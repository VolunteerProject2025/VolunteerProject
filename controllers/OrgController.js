const Organization = require("../models/Organization");
const Notification = require("../models/Notification");
const cloudinary = require('../config/cloudiary');
const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^0\d{9}$/; 
    return phoneRegex.test(phone);
};

exports.createNewOrganization = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        const { name,address, description,  phone } = req.body;
        let org_profile = null;

        if (!name || !phone) {
            return res.status(400).json({ message: 'Name,  and Phone are required fields' });
        }
        if (!isValidPhoneNumber(phone)) {
            return res.status(400).json({ message: 'Invalid phone number. It must start with 0 and be exactly 10 digits long.' });
        }
        // Handle file upload if present
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'organization_profiles',
            });
            org_profile = result.secure_url;
        }

        const organization = new Organization({
            user: req.user.userId,

            name,
            description,
            contactEmail: req.user.email,
            address,
            phone,
            org_profile: org_profile,
        });

        await organization.save();

        res.status(201).json({ message: 'Organization created successfully', organization });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.approveOrganization = async (req, res) => {
    try {
    
        const { organizationId } = req.params;

        const organization = await Organization.findById(organizationId);
        // if (!organization) {
        //     return res.status(404).json({ message: 'Organization not found' });
        // }

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
        const { name, description, address, phone } = req.body;


        // Ensure req.user is populated by the authentication middleware
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }
        if (!name || !phone) {
            return res.status(400).json({ message: 'Name,  and Phone are required fields' });
        }
        if (!isValidPhoneNumber(phone)) {
            return res.status(400).json({ message: 'Invalid phone number. It must start with 0 and be exactly 10 digits long.' });
        }
        let updateData = {
            name,
            description,
            contactEmail: req.user.email,
            address,
            phone,
            status: 'Pending'
        };
      
        // Handle file upload if present
        if (req.file) {
            // If there's an existing profile image, delete it from Cloudinary first
            if (existingOrg.org_profile) {
                // Extract the public_id from the URL
                const publicId = existingOrg.org_profile.split('/').pop().split('.')[0];
                const folderPath = 'organization_profiles';

                // Delete the existing image
                await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
            }

            // Upload the new image
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
            return res.status(404).json({ organization : null });
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

