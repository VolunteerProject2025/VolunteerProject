const express = require('express');
const router = express.Router();
const topicController = require('../controllers/TopicController');

router.post('/', topicController.createTopic);

router.get('/', topicController.getTopics);

router.put('/:id', topicController.updateTopic);

router.delete('/:id', topicController.deleteTopic);

module.exports = router;
