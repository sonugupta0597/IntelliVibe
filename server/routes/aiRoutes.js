const express = require('express');
const router = express.Router();
const { generateJobDescriptionHandler, speechToText } = require('../controllers/aiController');
const { protect, employer } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer();

router.post('/generate-job-description', protect, employer, generateJobDescriptionHandler);
router.post('/speech-to-text', upload.single('audio'), speechToText);

module.exports = router; 