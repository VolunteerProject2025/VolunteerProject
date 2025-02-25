const express = require('express');
const { googleAuth, normalLogin, register,verifyEmail, logout, chooseRole,authenStatus, getCurrentUser } = require('../controllers/authController');
const {authenticateToken} = require("../middleware/auth");

const router = express.Router();

router.post('/google', googleAuth);
router.post('/login', normalLogin);
router.post('/register', register);
router.get('/verify_email', verifyEmail);
router.post('/logout',logout);
router.post('/role',authenticateToken, chooseRole);
router.get('/status', authenStatus);
router.get('/me',authenticateToken, getCurrentUser);


module.exports = router;
