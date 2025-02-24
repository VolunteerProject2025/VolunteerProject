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