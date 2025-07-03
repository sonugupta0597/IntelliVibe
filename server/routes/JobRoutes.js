// server/routes/JobRoutes.js
const express = require('express');
const router = express.Router();
const { protect, employer } = require('../middleware/authMiddleware');
const { createJob, getMyJobs, getAllJobs, getJobById } = require('../controllers/jobController');

// Public route - get all active jobs for candidates
router.route('/').get(getAllJobs);

// Employer routes
router.route('/').post(protect, employer, createJob);
router.route('/myjobs').get(protect, employer, getMyJobs);

// Get single job - needs to be after /myjobs to avoid route conflicts
router.route('/:id').get(protect, getJobById);

module.exports = router;