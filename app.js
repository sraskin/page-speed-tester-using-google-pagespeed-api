require('dotenv').config();
const port = process.env.PORT;
const mongoUrl = process.env.MONGO_URL;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { join } = require('path');
const MONGO_URL = process.env.MONGO_URL;
// Initialize Express app
const app = express();
// Middleware for parsing JSON and urlencoded form data
app.use(bodyParser.json());
app.use(morgan('combined'));
// Serve static files from the "public" directory
app.use(express.static(join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(MONGO_URL, { useNewUrlParser: true });
// Log when MongoDB connection is opened
mongoose.connection.once('open', () => {
    console.log('MongoDB connection open');
});
// Log any MongoDB connection errors
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

const pageSpeedRoute = require('./routes/pageSpeedRoute');
const reporterRoute = require('./routes/reporterRoute');
// Routes
app.use('/api/v1/automation', pageSpeedRoute);
app.use('/api/v1/reporter', reporterRoute);

// Start the server
app.listen(port, () => console.log(`Server listening on port ${port}`));

// Export the app for testing
module.exports = app;
