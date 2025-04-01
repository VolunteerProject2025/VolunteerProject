const express = require("express");
const router = express.Router();
const topicController = require("../controllers/TopicController");

router.get("/", topicController.getAllTopics);
router.post("/", topicController.createTopic);

module.exports = router;