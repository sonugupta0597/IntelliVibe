// server/routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const { startQuiz, submitQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware'); // Your authentication middleware

// @route   GET /api/quiz/:applicationId
// @desc    Get quiz questions and start the quiz
// @access  Private (Candidate)
router.get('/:applicationId', protect, startQuiz);

// @route   POST /api/quiz/:applicationId/submit
// @desc    Submit quiz answers and get score
// @access  Private (Candidate)
router.post('/:applicationId/submit', protect, submitQuiz);

module.exports = router;