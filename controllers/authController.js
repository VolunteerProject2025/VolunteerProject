const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'postmessage'
);
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Google OAuth Login
exports.googleAuth = async (req, res) => {
    try {
        const { tokens } = await oAuth2Client.getToken(req.body.code);

        const ticket = await oAuth2Client.verifyIdToken({
            idToken: tokens.access_token,
            audience: process.env.CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const googleId = payload.sub;

        let user = await User.findOne({ googleId });

        if (!user) {
            user = new User({
                googleId,
                fullName: payload.name,
                email: payload.email,
                role: "Volunteer",
                password: await bcrypt.hash('123', 10),
                is_verfied: true
            });
            await user.save();
        }

      
        res.json({ user });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

// Normal Email/Password Login
exports.normalLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        console.log(user);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email' });
        }
        if (!user.is_verified) {
            return res.status(403).json({ message: "Please verify your email before logging in." });
          }
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

     
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid  password' });
        }

     
        res.json({ user });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }


};
const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.BACK_END_URL}/auth/verify_email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Click <a href="${verificationLink}">here</a> to verify your email and sign in.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
// User Registration
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user but set "verified" to false
        user = new User({
            email,
            password: hashedPassword,
            role: "Volunteer",
            is_verfied: false, // Add this field in your User model
        });

        await user.save();

        // Generate a verification token
        const verificationToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({ message: "User registered. Check your email for verification." });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Email Verification Endpoint
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ error: "Invalid token" });
        }

        if (user.is_verified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        user.is_verified = true;
        await user.save();

        res.redirect(`${process.env.FRONT_END_URL}`)
    } catch (error) {
        console.error("Email Verification Error:", error);
        res.status(500).json({ error: "Invalid or expired token" });
    }
};

