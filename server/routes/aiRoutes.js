const express = require('express');
const router = express.Router();
const { generateJobDescriptionHandler } = require('../controllers/aiController');
const { protect, employer } = require('../middleware/authMiddleware');

router.post('/generate-job-description', protect, employer, generateJobDescriptionHandler);

module.exports = router; 