const express = require('express');
const pageSpeedAutomationController = require('../controllers/pageSpeedController');
const router = express.Router();

router.get('/test', pageSpeedAutomationController.test);
router.get('/checkPerformance', pageSpeedAutomationController.checkPerformance);


// Export the router
module.exports = router;