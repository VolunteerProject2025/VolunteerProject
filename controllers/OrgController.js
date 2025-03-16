const Organization = require("../models/Organization");

exports.editOrganization = async (req, res) => {
    try {
        const { name, description, contactEmail, address, phone } = req.body;

        // Ensure req.user is populated by the authentication middleware
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        // Find and update organization by authenticated user
        const updatedOrganization = await Organization.findOneAndUpdate(
            { user: req.user.id },
            { name, description, contactEmail, address, phone },
            { new: true, runValidators: true }
        );

        if (!updatedOrganization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        res.status(200).json({ message: 'Organization updated successfully', organization: updatedOrganization });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.orgProfile = async (req,res) => {
    console.log("Inside orgProfile...");
    console.log("User Data:", req.user); 
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        const organization = await Organization.findOne({ user: req.user.userId });
        console.log(organization);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        res.status(200).json({ organization });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

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