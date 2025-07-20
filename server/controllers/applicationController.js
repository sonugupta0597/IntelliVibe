const Application = require('../models/Application');
const Job = require('../models/Job');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');
const { processApplicationScore, analyzeSkillsGap } = require('../services/autoQualificationService');
const Quiz = require('../models/Quiz');
const { sendApplicationEmail, sendEmployerNotification } = require('../services/emailService');

const { analyzeResume, generateQuizQuestions } = require('../services/aiService'); // Correctly imported
// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private/Candidate
exports.applyForJob = async (req, res) => {
    const { jobId } = req.body;

    // Check for missing jobId
    if (!jobId) {
        return res.status(400).json({ message: 'jobId is required' });
    }

    // Validate jobId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: 'Invalid jobId format' });
    }

    // Check for resume file
    if (!req.file) {
        return res.status(400).json({ message: 'Resume file is required' });
    }

    // Check for PDF file type
    if (!req.file.mimetype || req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ message: 'Only PDF resume files are accepted' });
    }

    try {
        // Check if already applied
        const existingApplication = await Application.findOne({ job: jobId, candidate: req.user._id });
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job', applicationId: existingApplication._id, status: existingApplication.status });
        }

        // Get job details
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Parse PDF
        const pdfPath = path.join(__dirname, '..', req.file.path);
        const dataBuffer = await fs.readFile(pdfPath);
        const pdfData = await pdfParse(dataBuffer);
        const resumeText = pdfData.text;

        // Analyze with AI
        const aiAnalysis = await analyzeResume(resumeText, {
            title: job.title,
            company: job.companyName,
            skills: job.skills,
            description: job.description,
            experienceLevel: job.experienceLevel,
            jobType: job.jobType,
            location: job.location,
        });

        console.log(" aiAnalysis ", aiAnalysis);
        // Only create and save application if AI analysis succeeds
        const application = new Application({
            job: jobId,
            candidate: req.user._id,
            resumeUrl: req.file.path.replace(/\\/g, '/'),
            screeningStage: 'resume_uploaded',
            stageHistory: [{
                stage: 'resume_uploaded',
                timestamp: new Date(),
                status: 'completed'
            }],
            aiMatchScore: aiAnalysis.matchScore,
            aiJustification: aiAnalysis.justification,
            aiAnalysisDate: new Date()
        });
        application.calculateProgressPercentage();

        // Determine next stage based on score
        const RESUME_THRESHOLD_FOR_QUIZ = 60; // Example threshold
        if (aiAnalysis.matchScore >= RESUME_THRESHOLD_FOR_QUIZ) {
            // Qualify for quiz
            application.screeningStage = 'quiz_pending';
            application.status = 'shortlisted';
            application.stageHistory.push({
                stage: 'resume_screening',
                timestamp: new Date(),
                status: 'passed',
                score: aiAnalysis.matchScore,
                notes: 'Qualified for skills assessment'
            });

            // Generate quiz if it doesn't exist for this job
            let quiz = await Quiz.findOne({ job: jobId });
            if (!quiz) {
                   // 1. Create a default quiz config object from your model.
                   const defaultQuizConfig = new Quiz();

                const questions = await generateQuizQuestions({
                    title: job.title,
                    skills: job.skills,
                    description: job.description,
                },  { // Second argument: Quiz Config
                    difficultyDistribution: defaultQuizConfig.difficultyDistribution
                }
            );
                quiz = new Quiz({
                    job: jobId,
                    questions: questions,
                    // passingScore: 70, // Example passing score
                    passingScore: 0, // Example passing score
                    timeLimit: 30 // 30 minutes
                });
                await quiz.save();
            }

            // Send quiz invitation email
            // await sendApplicationEmail(application, 'quiz_invitation', {
            //     quizUrl: `${process.env.FRONTEND_URL}/candidate/quiz/${application._id}`,
            //     timeLimit: quiz.timeLimit,
            //     numberOfQuestions: quiz.questions.length
            // });
 
            await application.save();

            return res.status(201).json({
                success: true,
                message: 'Congratulations! Your application has been submitted and you qualify for the next stage.',
                application: {
                    _id: application._id,
                    status: application.status,
                    aiMatchScore: application.aiMatchScore,
                    screeningStage: application.screeningStage,
                    nextStep: {
                        stage: 'quiz',
                        message: 'Please check your email for the skills assessment quiz invitation.',
                        quizAvailable: true
                    }
                }
            });
        } else {
            // Not qualified - reject with feedback
            application.screeningStage = 'resume_rejected';
            application.status = 'rejected';
            application.stageHistory.push({
                stage: 'resume_screening',
                timestamp: new Date(),
                status: 'failed',
                score: aiAnalysis.matchScore,
                notes: 'Did not meet minimum requirements'
            });
            
            // Calculate progress percentage
            application.calculateProgressPercentage();
            
            await application.save();

            // Send rejection email with feedback
            // await sendApplicationEmail(application, 'resume_rejected', {
            //     score: aiAnalysis.matchScore,
            //     feedback: aiAnalysis.justification,
            //     threshold: RESUME_THRESHOLD_FOR_QUIZ
            // });

            return res.status(201).json({
                success: false,
                message: 'Thank you for your application. Unfortunately, your profile does not match the current requirements for this position.',
                application: {
                    _id: application._id,
                    status: application.status,
                    aiMatchScore: application.aiMatchScore,
                    feedback: aiAnalysis.justification,
                    suggestions: 'Consider gaining more experience in the required skills and reapplying in the future.'
                }
            });
        }
    } catch (aiError) {
        console.error('AI analysis error:', aiError);
        // Do NOT save the application if AI fails
        return res.status(503).json({
            success: false,
            message: 'AI analysis failed. Please try again later.',
            error: aiError.message || aiError.toString()
        });
    }
};

// Helper function to extract skills from resume
function extractSkillsFromResume(resumeText, jobSkills) {
    // Common technical skills to look for
    const commonSkills = [
        'javascript', 'python', 'java', 'c++', 'react', 'angular', 'vue',
        'node.js', 'express', 'mongodb', 'sql', 'aws', 'docker', 'kubernetes',
        'git', 'agile', 'scrum', 'typescript', 'html', 'css', 'redux',
        'graphql', 'rest api', 'microservices', 'ci/cd', 'jenkins',
        'machine learning', 'data science', 'tensorflow', 'pytorch'
    ];
    
    const allSkills = [...commonSkills, ...jobSkills];
    const resumeLower = resumeText.toLowerCase();
    
    const foundSkills = allSkills.filter(skill => 
        resumeLower.includes(skill.toLowerCase())
    );
    
    return [...new Set(foundSkills)]; // Remove duplicates
}

// @desc    Get all applications for a specific job with enhanced data
// @route   GET /api/applications/job/:jobId
// @access  Private/Employer
exports.getApplicantsForJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to view these applicants' });
        }
        
        const applications = await Application.find({ job: jobId })
            .select('+employerInterview')
            .populate('candidate', 'firstName lastName email')
            .sort({ aiMatchScore: -1, createdAt: -1 });

        // Add statistics
        const stats = {
            total: applications.length,
            autoShortlisted: applications.filter(a => a.status === 'shortlisted' && a.autoProcessed).length,
            autoRejected: applications.filter(a => a.status === 'rejected' && a.autoProcessed).length,
            pendingReview: applications.filter(a => a.status === 'pending' || a.status === 'reviewed').length,
            averageScore: applications.filter(a => a.aiMatchScore !== null).length > 0
                ? Math.round(
                    applications
                        .filter(a => a.aiMatchScore !== null)
                        .reduce((acc, a) => acc + a.aiMatchScore, 0) /
                    applications.filter(a => a.aiMatchScore !== null).length
                )
                : 0,
        };

        res.json({
            job: {
                title: job.title,
                companyName: job.companyName,
                skills: job.skills,
            },
            applications,
            stats,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Bulk update application statuses
// @route   PUT /api/applications/bulk-update
// @access  Private/Employer
exports.bulkUpdateApplications = async (req, res) => {
    try {
        const { applicationIds, status, jobId } = req.body;

        // Verify job ownership
        const job = await Job.findById(jobId);
        if (!job || job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update all applications
        const result = await Application.updateMany(
            { 
                _id: { $in: applicationIds },
                job: jobId,
            },
            { 
                status: status,
                $set: { 'updatedAt': new Date() }
            }
        );

        // Send status update email to each candidate
        const updatedApplications = await Application.find({ _id: { $in: applicationIds }, job: jobId });
        for (const app of updatedApplications) {
            await sendApplicationEmail(app, 'status_updated', { status });
        }

        res.json({
            message: `${result.modifiedCount} applications updated successfully`,
            modifiedCount: result.modifiedCount,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get application statistics for a job
// @route   GET /api/applications/job/:jobId/stats
// @access  Private/Employer
exports.getApplicationStats = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Verify job ownership
        const job = await Job.findById(jobId);
        if (!job || job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const applications = await Application.find({ job: jobId });

        // Calculate detailed statistics
        const scoreRanges = {
            '0-20': 0,
            '21-40': 0,
            '41-60': 0,
            '61-80': 0,
            '81-100': 0,
        };

        applications.forEach(app => {
            if (app.aiMatchScore !== null) {
                if (app.aiMatchScore <= 20) scoreRanges['0-20']++;
                else if (app.aiMatchScore <= 40) scoreRanges['21-40']++;
                else if (app.aiMatchScore <= 60) scoreRanges['41-60']++;
                else if (app.aiMatchScore <= 80) scoreRanges['61-80']++;
                else scoreRanges['81-100']++;
            }
        });

        const stats = {
            totalApplications: applications.length,
            statusBreakdown: {
                pending: applications.filter(a => a.status === 'pending').length,
                reviewed: applications.filter(a => a.status === 'reviewed').length,
                shortlisted: applications.filter(a => a.status === 'shortlisted').length,
                rejected: applications.filter(a => a.status === 'rejected').length,
            },
            scoreDistribution: scoreRanges,
            autoProcessed: {
                total: applications.filter(a => a.autoProcessed).length,
                shortlisted: applications.filter(a => a.autoProcessed && a.status === 'shortlisted').length,
                rejected: applications.filter(a => a.autoProcessed && a.status === 'rejected').length,
            },
            timeline: {
                today: applications.filter(a => 
                    new Date(a.createdAt).toDateString() === new Date().toDateString()
                ).length,
                thisWeek: applications.filter(a => {
                    const appDate = new Date(a.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return appDate >= weekAgo;
                }).length,
            },
        };

        res.json(stats);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.getApplicationQuiz = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        // Security checks
        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }
        if (application.candidate.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to view this quiz.' });
        }
        if (application.screeningStage !== 'quiz_pending' && application.screeningStage !== 'quiz_in_progress') {
            return res.status(400).json({ message: 'Quiz is not available for this application.' });
        }

        // Fetch the quiz, but exclude correct answers from the payload
        const quiz = await Quiz.findOne({ job: application.job })
            .populate('job', 'title companyName')
            .select('questions.question questions.options questions._id timeLimit');
        
        if (!quiz) {
            return res.status(500).json({ message: 'Could not find the quiz for this job.' });
        }

        // Mark quiz as started if it's the first time
        if (application.screeningStage === 'quiz_pending') {
            application.screeningStage = 'quiz_in_progress';
            application.quizStartedAt = new Date();
            application.quizAttempts = (application.quizAttempts || 0) + 1;
            await application.save();
        }

        res.json({
            applicationId: application._id,
            jobTitle: quiz.job.title,
            companyName: quiz.job.companyName,
            timeLimit: quiz.timeLimit,
            questions: quiz.questions
        });

    } catch (error) {
        console.error("Error fetching quiz data:", error);
        res.status(500).json({ message: "Server error while fetching quiz." });
    }
};






//-----------------------------------------

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        // Validate status - UPDATED to include all statuses used in frontend
        const validStatuses = [
            'pending', 
            'reviewed', 
            'shortlisted', 
            'rejected',
            'AI Interview Passed',
            'AI Interview Failed'
        ];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Find the application
        const application = await Application.findById(applicationId).populate('job');
        
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if the employer owns this job
        if (application.job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this application' });
        }

        // Update the status
        application.status = status;
        await application.save();

        // Send status update email
        await sendApplicationEmail(application, 'status_updated', { status });

        res.json({
            message: 'Application status updated successfully',
            application: application,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.getMyCandidateApplications = async (req, res) => {
    try {
        const applications = await Application.find({ candidate: req.user._id })
            .select('+employerInterview')
            .populate('job', 'title companyName location skills')
            .select('aiMatchScore aiJustification aiAnalysisDate skillsGapAnalysis status screeningStage createdAt updatedAt')
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

//////////////////////////////////////////////////////////////////////
// Enhanced applyForJob function in applicationController.js


// Configuration - these could be environment variables
const RESUME_THRESHOLD_FOR_QUIZ = 60; // Minimum score to proceed to quiz
const QUIZ_PASSING_SCORE = 70; // Minimum quiz score to proceed to video

// @desc    Get quiz for an application
// @route   GET /api/applications/:applicationId/quiz
// @access  Private/Candidate
exports.getQuizForApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        
        const application = await Application.findOne({
            _id: applicationId,
            candidate: req.user._id
        }).populate('job');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.screeningStage !== 'quiz_pending' && application.screeningStage !== 'quiz_in_progress') {
            return res.status(400).json({ 
                message: 'Quiz not available for this application',
                currentStage: application.screeningStage 
            });
        }

        const quiz = await Quiz.findOne({ job: application.job._id });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Don't send correct answers to frontend
        const questionsWithoutAnswers = quiz.questions.map(q => ({
            _id: q._id,
            question: q.question,
            options: q.options
        }));

        res.json({
            applicationId: application._id,
            jobTitle: application.job.title,
            companyName: application.job.companyName,
            timeLimit: quiz.timeLimit,
            numberOfQuestions: quiz.questions.length,
            passingScore: quiz.passingScore,
            questions: questionsWithoutAnswers,
            startedAt: application.quizStartedAt || null
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Submit quiz answers
// @route   POST /api/applications/:applicationId/quiz/submit
// @access  Private/Candidate
exports.submitQuizAnswers = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { answers } = req.body; // Array of { questionId, selectedAnswer }

        const application = await Application.findOne({
            _id: applicationId,
            candidate: req.user._id
        }).populate('job');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.screeningStage !== 'quiz_pending' && application.screeningStage !== 'quiz_in_progress') {
            return res.status(400).json({ message: 'Quiz already submitted or not available' });
        }

        const quiz = await Quiz.findOne({ job: application.job._id });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Calculate score
        let correctAnswers = 0;
        const detailedResults = [];

        quiz.questions.forEach((question, index) => {
            const userAnswer = answers.find(a => a.questionId === question._id.toString());
            const isCorrect = userAnswer && userAnswer.selectedAnswer === question.correctAnswer;
            
            if (isCorrect) correctAnswers++;
            
            detailedResults.push({
                questionId: question._id,
                userAnswer: userAnswer ? userAnswer.selectedAnswer : null,
                correctAnswer: question.correctAnswer,
                isCorrect
            });
        });

        const score = Math.round((correctAnswers / quiz.questions.length) * 100);

        // Update application
        application.quizScore = score;
        application.quizCompletedAt = new Date();
        application.quizResults = detailedResults;

        // Always proceed to video_pending if quiz is completed
        application.screeningStage = 'video_pending';
        application.stageHistory.push({
            stage: 'quiz',
            timestamp: new Date(),
            status: 'completed',
            score: score,
            notes: 'Quiz completed, proceeding to video interview'
        });

        // Calculate progress percentage
        application.calculateProgressPercentage();

        await application.save();

        res.json({
            success: true,
            message: 'Quiz completed successfully. Proceeding to video interview stage.',
            score: score,
            progressPercentage: application.progressPercentage
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


/**
 * POST /api/applications/:id/quiz/submit
 * Submits quiz answers, calculates score, and updates application status.
 */
exports.submitApplicationQuiz = async (req, res) => {
    try {
        const { id: applicationId } = req.params;
        const { answers } = req.body; // Expecting an array: [{ questionId: '...', selectedAnswer: 1 }]

        // 1. Find the Application and perform security checks
        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }
        if (application.candidate.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to submit this quiz.' });
        }
        if (application.screeningStage !== 'quiz_in_progress') {
            return res.status(400).json({ message: 'Quiz is not active or has already been submitted.' });
        }

        // 2. Find the corresponding Quiz to get the correct answers
        const quiz = await Quiz.findOne({ job: application.job });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz data not found for this job application.' });
        }

        // 3. Score the submission
        let correctAnswersCount = 0;
        const quizResultsForDB = []; // To store detailed results in the Application document

        // Loop over the questions from the database (the source of truth)
        quiz.questions.forEach(dbQuestion => {
            // Find the user's answer for the current question
            const userAnswer = answers.find(a => a.questionId === dbQuestion._id.toString());
            const isCorrect = userAnswer && userAnswer.selectedAnswer === dbQuestion.correctAnswer;

            if (isCorrect) {
                correctAnswersCount++;
            }

            // Store detailed result for this question
            quizResultsForDB.push({
                questionId: dbQuestion._id,
                userAnswer: userAnswer ? userAnswer.selectedAnswer : null, // Store what the user selected
                correctAnswer: dbQuestion.correctAnswer,
                isCorrect: isCorrect,
            });
        });

        const finalScore = Math.round((correctAnswersCount / quiz.questions.length) * 100);

        // 4. Update the Application document with results
        application.quizScore = finalScore;
        application.quizResults = quizResultsForDB;
        application.quizCompletedAt = new Date();

        const passed = finalScore >= quiz.passingScore;
        let resultMessage;
        let nextStepMessage = null;

        // 5. Update the application's stage based on pass/fail
        if (passed) {
            application.screeningStage = 'video_pending'; // Or 'final_review' if no video step
            application.stageHistory.push({
                stage: 'quiz_completed',
                status: 'passed',
                score: finalScore,
                notes: `Qualified for the next stage with a score of ${finalScore}%.`
            });
            resultMessage = "You've successfully passed the skills assessment!";
            nextStepMessage = "The hiring team has been notified. They will be in touch regarding the next steps in the process.";
        } else {
            application.screeningStage = 'quiz_failed';
            application.status = 'rejected'; // The application journey ends here
            application.stageHistory.push({
                stage: 'quiz_completed',
                status: 'failed',
                score: finalScore,
                notes: `Did not meet the passing score of ${quiz.passingScore}%.`
            });
            resultMessage = "Thank you for completing the assessment. Unfortunately, your score did not meet the threshold for this position.";
        }

        // Calculate progress percentage
        application.calculateProgressPercentage();

        await application.save();

        // 6. Send a detailed response back to the frontend
        res.status(200).json({
            message: 'Quiz submitted successfully!',
            score: finalScore,
            passingScore: quiz.passingScore,
            passed: passed,
            nextStep: nextStepMessage ? { message: nextStepMessage } : null,
            progressPercentage: application.progressPercentage
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'An error occurred while submitting your quiz.' });
    }
};

/**
 * POST /api/applications/:id/video-complete
 * Marks video interview as completed and processes results
 */
exports.completeVideoInterview = async (req, res) => {
    try {
        const { id: applicationId } = req.params;
        const { videoAnalysisReport } = req.body;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }
        if (application.candidate.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to complete this interview.' });
        }
        if (application.screeningStage !== 'video_in_progress') {
            return res.status(400).json({ message: 'Video interview is not active or has already been completed.' });
        }

        // Update application with video analysis results
        application.videoAnalysisReport = videoAnalysisReport;
        application.videoInterviewCompletedAt = new Date();
        application.screeningStage = 'video_completed';
        
        // Calculate overall score
        application.calculateOverallScore();
        
        // Always set to video_completed, regardless of score
        application.stageHistory.push({
            stage: 'video_interview',
            timestamp: new Date(),
            status: 'completed',
            score: videoAnalysisReport.overallScore,
            notes: 'Video interview completed and analyzed'
        });

        // Calculate progress percentage
        application.calculateProgressPercentage();

        await application.save();

        res.json({
            success: true,
            message: 'Video interview completed successfully',
            videoScore: videoAnalysisReport.overallScore,
            overallScore: application.overallScore,
            progressPercentage: application.progressPercentage
        });

    } catch (error) {
        console.error('Error completing video interview:', error);
        res.status(500).json({ message: 'An error occurred while completing the video interview.' });
    }
};

/**
 * POST /api/applications/:id/schedule-employer-interview
 * Schedules employer interview and sends notifications
 */
exports.scheduleEmployerInterview = async (req, res) => {
    try {
        const { id: applicationId } = req.params;
        const { scheduledDate, scheduledTime, interviewType, employerContact, meetingLink, location, notes } = req.body;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }
        if (application.screeningStage !== 'selected_for_employer') {
            return res.status(400).json({ message: 'Application is not ready for employer scheduling.' });
        }

        // Update application with employer interview details
        application.employerInterview = {
            scheduledDate: new Date(scheduledDate),
            scheduledTime,
            interviewType,
            employerContact,
            meetingLink,
            location,
            notes,
            status: 'pending'
        };
        
        application.screeningStage = 'employer_scheduled';
        application.stageHistory.push({
            stage: 'employer_scheduling',
            timestamp: new Date(),
            status: 'scheduled',
            scheduledDate: new Date(scheduledDate),
            employerContact,
            notes: `Interview scheduled for ${scheduledDate} at ${scheduledTime}`
        });

        // Calculate progress percentage
        application.calculateProgressPercentage();

        await application.save();

        // Send confirmation emails
        // await sendApplicationEmail(application, 'employer_interview_scheduled', {
        //     scheduledDate,
        //     scheduledTime,
        //     interviewType,
        //     employerContact,
        //     meetingLink,
        //     location
        // });

        await sendEmployerNotification(application, 'interview_scheduled', {
            scheduledDate,
            scheduledTime,
            interviewType,
            meetingLink,
            location
        });

        res.json({
            success: true,
            message: 'Employer interview scheduled successfully',
            interviewDetails: application.employerInterview,
            progressPercentage: application.progressPercentage
        });

    } catch (error) {
        console.error('Error scheduling employer interview:', error);
        res.status(500).json({ message: 'An error occurred while scheduling the employer interview.' });
    }
};

/**
 * POST /api/applications/:id/complete-employer-interview
 * Marks employer interview as completed and updates status
 */
exports.completeEmployerInterview = async (req, res) => {
    try {
        const { id: applicationId } = req.params;
        const { feedback, decision } = req.body;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }
        if (application.screeningStage !== 'employer_scheduled') {
            return res.status(400).json({ message: 'Employer interview is not scheduled.' });
        }

        // Update employer interview status
        application.employerInterview.status = 'completed';
        application.employerInterview.feedback = feedback;
        application.employerInterview.decision = decision;
        
        application.screeningStage = 'employer_interview_completed';
        application.stageHistory.push({
            stage: 'employer_interview',
            timestamp: new Date(),
            status: 'completed',
            notes: `Interview completed with decision: ${decision}`
        });

        if (decision === 'hired') {
            application.status = 'hired';
            application.screeningStage = 'hired';
            application.stageHistory.push({
                stage: 'hiring',
                timestamp: new Date(),
                status: 'completed',
                notes: 'Candidate has been hired'
            });
            
            // Send hiring confirmation
            // await sendApplicationEmail(application, 'hired');
        }

        // Calculate progress percentage
        application.calculateProgressPercentage();

        await application.save();

        res.json({
            success: true,
            message: 'Employer interview completed successfully',
            decision,
            progressPercentage: application.progressPercentage
        });

    } catch (error) {
        console.error('Error completing employer interview:', error);
        res.status(500).json({ message: 'An error occurred while completing the employer interview.' });
    }
};