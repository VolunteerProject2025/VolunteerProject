<<<<<<< HEAD
require('dotenv').config();

const connectDB = require('./config/db');
const app = require('./config/app');



// Connect to MongoDB
connectDB();
console.log();


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}` );
});
=======
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const connectDB = require('./config/db');

const app = express();
const PORT = 3000;

// Kết nối MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/', routes);

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
>>>>>>> origin/tri
