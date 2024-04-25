const express = require('express');
const reporterController = require('../controllers/reporterController');
const router = express.Router();

router.get('/test', reporterController.test);
router.get('/getReport', reporterController.getReport);

module.exports = router;