require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: `${process.env.FRONT_END_URL}`, // Change this to your frontend URL
        credentials: true, // Allows cookies to be sent from frontend
    })
);
app.use(session({
    secret: process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to `true` if using HTTPS
}));
// Routes
// const authRoutes = require('../routes/authRoutes');
// const orgRoutes = require('../routes/orgRoutes');

// app.use('/auth', authRoutes);
// app.use('/org', orgRoutes);


module.exports = app;
