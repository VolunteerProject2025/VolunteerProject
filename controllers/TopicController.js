const Topic = require('../models/Topic'); 

exports.createTopic = async (req, res) => {
    try {
        const topic = new Topic({
            name: req.body.name
        });
        await topic.save();
        res.status(201).json(topic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getTopics = async (req, res) => {
    try {
        const topics = await Topic.find();
        res.status(200).json(topics);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateTopic = async (req, res) => {
    try {
        const topic = await Topic.findByIdAndUpdate(req.params.id, {
            name: req.body.name
        }, { new: true });
        res.status(200).json(topic);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteTopic = async (req, res) => {
    try {
        await Topic.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Topic deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
