const Skill = require('../models/Skill'); 

exports.createSkill = async (req, res) => {
    try {
        const skill = new Skill({
            name: req.body.name
        });
        await skill.save();
        res.status(201).json(skill);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getSkills = async (req, res) => {
    try {
        const skills = await Skill.find();
        res.status(200).json(skills);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateSkill = async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(req.params.id, {
            name: req.body.name
        }, { new: true });
        res.status(200).json(skill);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteSkill = async (req, res) => {
    try {
        await Skill.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Skill deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
