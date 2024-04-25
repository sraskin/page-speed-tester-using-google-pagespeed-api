const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    performanceScore: String,
    accessibilityScore: String,
    bestPracticesScore: String,
    seoScore: String,
    pwaScore: String,
    loadingExperience: Object,
    testDetails: Object,
    createdAt: Date,
});

// Export the Request model
module.exports = mongoose.model('Report', reportSchema);
