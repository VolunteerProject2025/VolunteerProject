const express = require('express');
const {createMessage,getMessages} = require('../controllers/MessController')
const {authenticateToken} = require("../middleware/auth");
const router = express.Router();

router.post('/',authenticateToken,createMessage)
router.get('/:chatId',authenticateToken,getMessages)
module.exports = router;
