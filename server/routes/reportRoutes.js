const express = require('express');
const router = express.Router();
const { protect, employer } = require('../middleware/authMiddleware');
const {
    getVideoInterviewReport,
    getApplicationReports,
    getCandidatePerformanceReport,
    getJobAnalyticsReport,
    exportReportData
} = require('../controllers/reportController');

// @route   GET /api/reports/video-interview/:applicationId
// @desc    Get detailed AI video interview report for a specific application
// @access  Private (Employer)
router.get('/video-interview/:applicationId', protect, employer, getVideoInterviewReport);

// @route   GET /api/reports/applications/:jobId
// @desc    Get comprehensive reports for all applications of a job
// @access  Private (Employer)
router.get('/applications/:jobId', protect, employer, getApplicationReports);

// @route   GET /api/reports/candidate-performance/:candidateId
// @desc    Get performance report for a specific candidate across all applications
// @access  Private (Employer)
router.get('/candidate-performance/:candidateId', protect, employer, getCandidatePerformanceReport);

// @route   GET /api/reports/job-analytics/:jobId
// @desc    Get analytics and insights for a specific job posting
// @access  Private (Employer)
router.get('/job-analytics/:jobId', protect, employer, getJobAnalyticsReport);

// @route   GET /api/reports/export/:type/:id
// @desc    Export report data in various formats (PDF, CSV, JSON)
// @access  Private (Employer)
router.get('/export/:type/:id', protect, employer, exportReportData);

module.exports = router;