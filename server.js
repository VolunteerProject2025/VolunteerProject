const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/', routes);

// Chưa kết nối MongoDB

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});