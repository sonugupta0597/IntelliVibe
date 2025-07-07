const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, employer } = require('../middleware/authMiddleware');
//const upload = require('../middleware/uploadMiddleware');

// Import all controller functions
// Add these to your applicationRoutes.js

// Import the quiz-related controller functions
const { 
    applyForJob, 
    getApplicantsForJob,
    getMyCandidateApplications,
    getQuizForApplication,
    submitQuizAnswers,
    updateApplicationStatus,
    getApplicationQuiz,
    submitApplicationQuiz,
    completeVideoInterview,
    scheduleEmployerInterview,
    completeEmployerInterview
} = require('../controllers/applicationController');


router.get('/:id/quiz', protect, getApplicationQuiz);
// GET quiz for a specific application
router.get('/:applicationId/quiz', protect, getQuizForApplication);

// POST submit quiz answers
router.post('/:applicationId/quiz/submit', protect, submitQuizAnswers);

// Setup multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate a unique filename without relying on req.user
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${uniqueSuffix}-${name}${ext}`);
    }
});

// File filter to only accept PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// === ROUTES ===

// POST route for a candidate to apply - protect middleware MUST come before upload
router.post('/', protect, upload.single('resume'), applyForJob);

// GET route for an employer to see applicants
router.get('/job/:jobId', protect, employer, getApplicantsForJob);

// GET route for application statistics (if you have this controller function)
// router.get('/job/:jobId/stats', protect, employer, getApplicationStats);

// PUT route to update application status (if you have this controller function)
router.put('/:applicationId/status', protect, employer, updateApplicationStatus);

// PUT route for bulk updates (if you have this controller function)
// router.put('/bulk-update', protect, employer, bulkUpdateApplications);

// Add this route to your applicationRoutes.js file

// Import the new controller function

// Add this route for candidates to view their applications
router.get('/my-applications', protect, getMyCandidateApplications);


// @route   POST /api/applications/:id/quiz/submit
// @desc    Submit quiz answers and get results
// @access  Private (Candidate)
router.post('/:id/quiz/submit', protect, submitApplicationQuiz);

// @route   POST /api/applications/:id/video-complete
// @desc    Complete video interview and process results
// @access  Private (Candidate)
router.post('/:id/video-complete', protect, completeVideoInterview);

// @route   POST /api/applications/:id/schedule-employer-interview
// @desc    Schedule employer interview
// @access  Private (Employer)
router.post('/:id/schedule-employer-interview', protect, employer, scheduleEmployerInterview);

// @route   POST /api/applications/:id/complete-employer-interview
// @desc    Complete employer interview and update status
// @access  Private (Employer)
router.post('/:id/complete-employer-interview', protect, employer, completeEmployerInterview);

module.exports = router;