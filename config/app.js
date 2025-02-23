const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('../routes/authRoutes');
app.use('/auth', authRoutes);

module.exports = app;
