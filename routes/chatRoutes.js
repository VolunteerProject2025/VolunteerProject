const express = require('express');
const {createChat,findUserChat,findChat,createGroupChat} = require('../controllers/ChatController')
const {authenticateToken} = require("../middleware/auth");
const router = express.Router();

router.post('/',authenticateToken,createChat)
router.get('/find/:firstId/:secondId',authenticateToken,findChat)
router.get('/:userId',authenticateToken,findUserChat)   

router.post('/group',authenticateToken,createGroupChat)
module.exports = router;
