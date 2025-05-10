const express = require('express');
const {createChat,findUserChat,findChat} = require('../controllers/ChatController')
const {authenticateToken} = require("../middleware/auth");
const router = express.Router();

router.post('/',authenticateToken,createChat)
router.get('/',authenticateToken,findUserChat)
router.get('/find/:firstId/:secondId',authenticateToken,findChat)
module.exports = router;
