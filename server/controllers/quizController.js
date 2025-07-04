// server/controllers/quizController.js

const Application = require('../models/Application');
const Quiz = require('../models/Quiz');

/**
 * GET /api/quiz/:applicationId
 * Fetches quiz questions for a specific application.
 * Ensures the candidate is authorized and the quiz is pending.
 */

const QUIZ_PASSING_SCORE = 70;
exports.startQuiz = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const application = await Application.findById(applicationId);

        // --- Security and Validation Checks ---
        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }
        // Ensure the logged-in user owns this application
        if (application.candidate.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to take this quiz.' });
        }
        // Ensure the quiz is actually pending
        if (application.screeningStage !== 'quiz_pending') {
            return res.status(400).json({ message: 'This quiz is not available or has already been completed.' });
        }

        // Fetch the associated quiz
        const quiz = await Quiz.findOne({ job: application.job })
            // IMPORTANT: Exclude correct answers and explanations from the payload sent to the client
            .select('questions.question questions.options timeLimit');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found for this job.' });
        }

        // Mark the quiz as started in the application
        application.screeningStage = 'quiz_in_progress';
        application.quizStartedAt = new Date();
        application.quizAttempts += 1;
        await application.save();

        res.status(200).json({
            applicationId: application._id,
            timeLimit: quiz.timeLimit,
            questions: quiz.questions // Safe to send, as answers are excluded
        });

    } catch (error) {
        console.error('Error starting quiz:', error);
        res.status(500).json({ message: 'Error starting quiz.' });
    }
};

/**
 * POST /api/quiz/:applicationId/submit
 * Submits quiz answers, calculates the score, and updates the application status.
 */
exports.submitQuiz = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { answers } = req.body; // Expecting an array like [{ questionId: '...', answer: 1 }]

        const application = await Application.findById(applicationId).populate('job');
        
        // --- Security and Validation ---
        if (!application || application.candidate.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }
        if (application.screeningStage !== 'quiz_in_progress') {
            return res.status(400).json({ message: 'Quiz not active or already submitted.' });
        }

        const quiz = await Quiz.findOne({ job: application.job._id });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz data not found.' });
        }

        // --- Scoring Logic ---
        let correctAnswersCount = 0;
        const quizResults = [];
        
        quiz.questions.forEach(question => {
            const userAnswer = answers.find(a => a.questionId === question._id.toString());
            const isCorrect = userAnswer && userAnswer.answer === question.correctAnswer;

            if (isCorrect) {
                correctAnswersCount++;
            }
            
            quizResults.push({
                questionId: question._id,
                userAnswer: userAnswer ? userAnswer.answer : null,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect,
            });
        });

        const score = Math.round((correctAnswersCount / quiz.questions.length) * 100);

        // --- Update Application State ---
        application.quizScore = score;
        application.quizResults = quizResults;
        application.quizCompletedAt = new Date();

        if (score >= QUIZ_PASSING_SCORE) {
            application.screeningStage = 'video_pending'; // Next stage!
            application.stageHistory.push({
                stage: 'quiz_completed', status: 'passed', score: score, notes: 'Qualified for video interview.'
            });
        } else {
            application.screeningStage = 'quiz_failed';
            application.status = 'rejected';
            application.stageHistory.push({
                stage: 'quiz_completed', status: 'failed', score: score, notes: 'Did not meet passing score.'
            });
        }
        
        await application.save();

        res.status(200).json({
            message: 'Quiz submitted successfully!',
            score: application.quizScore,
            status: application.screeningStage,
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Error submitting quiz.' });
    }
};