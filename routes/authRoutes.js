const express = require('express');
const { googleAuth, normalLogin, register,verifyEmail, logout, chooseRole } = require('../controllers/authController');
const {verifyToken} = require("../middleware/verifyToken");

const router = express.Router();

router.post('/google', googleAuth);
router.post('/login', normalLogin);
router.post('/register', register);
router.get('/verify_email', verifyEmail);
router.post('/logout',logout);
router.post('/role', chooseRole);


module.exports = router;
