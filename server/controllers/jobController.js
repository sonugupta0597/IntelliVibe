const Job = require('../models/Job');

/**
 * @desc    Create a new job
 * @route   POST /api/jobs
 * @access  Private/Employer
 * @description Handles creating a new job posting with all the new fields.
 */


// Add this function to your server/controllers/jobController.js

/**
 * @desc    Get a single job by ID
 * @route   GET /api/jobs/:id
 * @access  Private
 * @description Fetches a single job by its ID
 */
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        res.json(job);
    } catch (error) {
        console.error("Error fetching job:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid job ID format' });
        }
        
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.createJob = async (req, res) => {
    // ------------------- DEBUGGING STEP -------------------
    // Log the entire request body as soon as it arrives.
    // This will show you exactly what the server is receiving.
    console.log("Received request to create job with body:", req.body);
    // ----------------------------------------------------

    const { 
        title, companyName, location, skills, salary, 
        jobType, description, expiryDate, isActive, interviewDuration 
    } = req.body;

    // A quick check to ensure skills is an array, as expected by the model
    if (!skills || !Array.isArray(skills)) {
        return res.status(400).json({ message: "The 'skills' field must be a non-empty array." });
    }

    try {
        const job = new Job({
            title, companyName, location, skills, salary, 
            jobType, description, expiryDate, isActive, interviewDuration,
            postedBy: req.user._id,
        });

        const createdJob = await job.save();
        res.status(201).json(createdJob);
    } catch (error) {
        // ------------------- IMPROVED ERROR HANDLING -------------------
        // Log the full error to the server console for your records
        console.error("Error creating job:", error);

        // If it's a Mongoose validation error, send a specific, helpful message
        if (error.name === 'ValidationError') {
            // Extracts all validation messages into a single string
            const messages = Object.values(error.errors).map(val => val.message).join('. ');
            return res.status(400).json({ message: messages });
        }
        
        // For any other type of error, send a generic server error message
        res.status(500).json({ message: 'A critical server error occurred.' });
        // ---------------------------------------------------------------
    }
};

/**
 * @desc    Get jobs for the logged-in employer
 * @route   GET /api/jobs/myjobs
 * @access  Private/Employer
 * @description Fetches all jobs posted by the currently authenticated employer.
 */
exports.getMyJobs = async (req, res) => {
    try {
        // Sort by 'createdAt: -1' to show the newest jobs first
        const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get all jobs (for candidates)
 * @route   GET /api/jobs
 * @access  Public
 * @description Fetches all ACTIVE jobs for the public job board.
 */
exports.getAllJobs = async (req, res) => {
    try {
        // Only find jobs where 'isActive' is true
        // Sort by 'createdAt: -1' to show the newest jobs first
        const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};