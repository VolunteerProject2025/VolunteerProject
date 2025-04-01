const Feedback = require('../models/Feedback');
const Project = require('../models/Project');

exports.getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate('user').populate('organization').populate('project');

        res.json(feedbacks)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createFeedback = async (req, res) => {
    try {
        const { project, organization, content, rating } = req.body;
        const userId = req.user.userId;

        // Check if user has already submitted feedback for this project
        const existingFeedback = await Feedback.findOne({
            user: userId,
            project: project
        });

        if (existingFeedback) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted feedback for this project'
            });
        }

        // Verify the project exists and is completed
        const projectExists = await Project.findOne({
            _id: project,
            status: 'Completed'
        });

        if (!projectExists) {
            return res.status(404).json({
                success: false,
                message: 'Project not found or not completed'
            });
        }

        // Create new feedback
        const feedback = new Feedback({
            user: userId,
            project,
            organization,
            content,
            rating
        });

        await feedback.save();

        return res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: feedback
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return res.status(500).json({
            success: false,
            message: 'Error submitting feedback',
            error: error.message
        });
    }
};
exports.getProjectFeedback = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const feedback = await Feedback.find({ project: projectId })
            .populate('user', 'fullName profilePicture')
            .sort({ createdAt: -1 });
            
        return res.status(200).json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        console.error('Error fetching project feedback:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching project feedback',
            error: error.message
        });
    }
};

/**
 * Get all feedback for an organization
 * @route GET /api/feedback/organization/:organizationId
 */
exports.getOrganizationFeedback = async (req, res) => {
    try {
        const { organizationId } = req.params;
        
        const feedback = await Feedback.find({ organization: organizationId })
            .populate('user', 'fullName profilePicture')
            .populate('project', 'title')
            .sort({ createdAt: -1 });
            
        return res.status(200).json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        console.error('Error fetching organization feedback:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching organization feedback',
            error: error.message
        });
    }
};
