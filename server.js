require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./config/app');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require("cors");


// Connect to MongoDB
connectDB();
console.log();



// Middleware
app.use(bodyParser.json());
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use(cors({ 
    origin: "http://localhost:5173", 
    credentials: true 
  }));

// Routes
app.use('/', routes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}` );
});

