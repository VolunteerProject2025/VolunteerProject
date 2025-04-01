const Thread = require("../models/Thread");
const { toggleLikeDislike } = require("../utils/likeDislikeHelper");
const User = require("../models/User");
const CommentF = require("../models/CommentF"); 

// GET ALL THREADS (optionally filtered by topicId)
exports.getThreads = async (req, res) => {
  try {
    const { topic } = req.query;
    const filter = topic ? { topicId: topic } : {};
    const threads = await Thread.find(filter)
      .sort({ createdAt: -1 })
      .populate("tagIds", "name")
      .populate("topicId", "name");
    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET THREAD BY ID
exports.getThreadById = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate("topicId", "name")
      .populate("tagIds", "name")
      .lean();

    if (!thread) return res.status(404).json({ error: "Thread not found" });

    // Get author data
    const author = await User.findOne({ fullName: thread.author });

    if (author) {
      thread.memberSince = new Date(author.createdAt).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
      thread.postCount = await Thread.countDocuments({ author: thread.author });
      thread.authorId = author._id;
      thread.authorAvatar = author.img_profile || null;
    }

    // Get total replies
    thread.replies = await CommentF.countDocuments({ threadId: req.params.id });

    res.status(200).json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE THREAD
exports.createThread = async (req, res) => {
  try {
    const { title, content, topicId, tagIds } = req.body;
    const user = req.user; 

    const thread = new Thread({
      title,
      content,
      topicId,
      tagIds,
      author: user.fullName,
      authorId: user.id
    });

    await thread.save();
    res.status(201).json(thread);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// LIKE THREAD
exports.likeThread = async (req, res) => {  
  try {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: "Unauthorized - No user ID" });
    }
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    const userId = req.user.userId;
    await toggleLikeDislike(thread, userId.toString(), "like");
    const updatedThread = await Thread.findById(req.params.id);
    res.json(updatedThread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DISLIKE THREAD
exports.dislikeThread = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: "Unauthorized - No user ID" });
    }
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    
    const userId = req.user.userId;
    await toggleLikeDislike(thread, userId.toString(), "dislike");
    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
