const Topic = require("../models/Topic");
const Thread = require("../models/Thread");

exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find();

    const topicData = await Promise.all(
      topics.map(async (topic) => {
        let threadCount = 0;
        let latestThread = null;

        try {
          threadCount = await Thread.countDocuments({ topicId: topic._id });
          latestThread = await Thread.findOne({ topicId: topic._id }).sort({ updatedAt: -1 });
        } catch (err) {
          console.error(`Failed to process topic ${topic.name}:`, err.message);
        }

        return {
          _id: topic._id,
          name: topic.name,
          description: topic.description,
          badgeColor: topic.badgeColor,
          threadCount,
          lastUpdated: latestThread?.updatedAt || null,
        };
      })
    );

    res.json(topicData);
  } catch (err) {
    console.error("TOPIC API ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.createTopic = async (req, res) => {
  try {
    const topic = new Topic(req.body);
    await topic.save();
    res.status(201).json(topic);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};