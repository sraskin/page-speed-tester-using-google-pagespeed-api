const Report = require('../models/Report');

async function saveReport(performanceScore, accessibilityScore, bestPracticesScore, seoScore, pwaScore, loadingExperience, testDetails) {
    const report = new Report({
        performanceScore: performanceScore,
        accessibilityScore: accessibilityScore,
        bestPracticesScore: bestPracticesScore,
        seoScore: seoScore,
        pwaScore: pwaScore,
        loadingExperience: loadingExperience,
        testDetails: testDetails,
        createdAt: new Date()
    });
    await report.save();
    return report;
}

module.exports = saveReport;
