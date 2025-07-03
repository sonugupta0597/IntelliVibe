const Application = require('../models/Application');
const Job = require('../models/Job');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');
const { analyzeResume } = require('../services/aiService');
const { processApplicationScore, analyzeSkillsGap } = require('../services/autoQualificationService');

const Quiz = require('../models/Quiz');
const { generateQuizQuestions } = require('../services/aiService');
const { sendApplicationEmail } = require('../services/emailService');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private/Candidate
// exports.applyForJob = async (req, res) => {
//     const { jobId } = req.body;
    
//     if (!req.file) {
//         return res.status(400).json({ message: 'Resume file is required' });
//     }

//     try {
//         const existingApplication = await Application.findOne({ job: jobId, candidate: req.user._id });
//         if (existingApplication) {
//             return res.status(400).json({ message: 'You have already applied for this job' });
//         }

//         const application = new Application({
//             job: jobId,
//             candidate: req.user._id,
//             resumeUrl: req.file.path.replace(/\\/g, '/'), // Normalize path for cross-platform
//         });

//         const createdApplication = await application.save();

//         // Perform AI analysis asynchronously
//         (async () => {
//             try {
//                 // Get the job details for AI analysis
//                 const job = await Job.findById(jobId);
//                 if (!job) return;

//                 // Read and parse the PDF
//                 const pdfPath = path.join(__dirname, '..', req.file.path);
//                 const dataBuffer = await fs.readFile(pdfPath);
//                 const pdfData = await pdfParse(dataBuffer);
//                 const resumeText = pdfData.text;

//                 // Analyze with AI
//                 const aiAnalysis = await analyzeResume(resumeText, {
//                     title: job.title,
//                     companyName: job.companyName,
//                     skills: job.skills,
//                     description: job.description,
//                     experienceLevel: job.experienceLevel,
//                     jobType: job.jobType,
//                     location: job.location,
//                 });

//                 // Extract skills from resume (basic extraction - can be improved)
//                 const resumeSkills = extractSkillsFromResume(resumeText, job.skills);
                
//                 // Analyze skills gap
//                 const skillsGap = analyzeSkillsGap(resumeSkills, job.skills);

//                 // Update the application with AI results
//                 const updatedApplication = await Application.findByIdAndUpdate(
//                     createdApplication._id, 
//                     {
//                         aiMatchScore: aiAnalysis.matchScore,
//                         aiJustification: aiAnalysis.justification,
//                         aiAnalysisDate: new Date(),
//                         skillsGapAnalysis: skillsGap,
//                     },
//                     { new: true }
//                 );

//                 // Process auto-qualification
//                 await processApplicationScore(updatedApplication);

//             } catch (aiError) {
//                 console.error('AI analysis error for application:', createdApplication._id, aiError);
//             }
//         })();

//         res.status(201).json({
//             message: 'Application submitted successfully! You will receive an email notification about your application status.',
//             application: createdApplication,
//         });

//     } catch (error) {
//         res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };

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

// ... keep existing updateApplicationStatus and downloadResume functions ...








//-----------------------------------------

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected'];
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
            .populate('job', 'title companyName location skills')
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

// @desc    Apply for a job with enhanced AI screening
// @route   POST /api/applications
// @access  Private/Candidate
exports.applyForJob = async (req, res) => {
    const { jobId } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ message: 'Resume file is required' });
    }

    try {
        // Check if already applied
        const existingApplication = await Application.findOne({ 
            job: jobId, 
            candidate: req.user._id 
        });
        
        if (existingApplication) {
            return res.status(400).json({ 
                message: 'You have already applied for this job',
                applicationId: existingApplication._id,
                status: existingApplication.status
            });
        }

        // Get job details
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Create application
        const application = new Application({
            job: jobId,
            candidate: req.user._id,
            resumeUrl: req.file.path.replace(/\\/g, '/'),
            screeningStage: 'resume_uploaded',
            stageHistory: [{
                stage: 'resume_uploaded',
                timestamp: new Date(),
                status: 'completed'
            }]
        });

        await application.save();

        // Perform AI analysis asynchronously but wait for result
        try {
            // Parse PDF
            const pdfPath = path.join(__dirname, '..', req.file.path);
            const dataBuffer = await fs.readFile(pdfPath);
            const pdfData = await pdfParse(dataBuffer);
            const resumeText = pdfData.text;

            console.log("resumeText", resumeText);
            
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

            // Update application with AI results
            application.aiMatchScore = aiAnalysis.matchScore;
            application.aiJustification = aiAnalysis.justification;
            application.aiAnalysisDate = new Date();

            // Determine next stage based on score
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
                    const questions = await generateQuizQuestions({
                        title: job.title,
                        skills: job.skills,
                        description: job.description,
                    });

                    quiz = new Quiz({
                        job: jobId,
                        questions: questions,
                        passingScore: QUIZ_PASSING_SCORE,
                        timeLimit: 30 // 30 minutes
                    });
                    await quiz.save();
                }

                // Send quiz invitation email
                await sendApplicationEmail(application, 'quiz_invitation', {
                    quizUrl: `${process.env.FRONTEND_URL}/candidate/quiz/${application._id}`,
                    timeLimit: quiz.timeLimit,
                    numberOfQuestions: quiz.questions.length
                });

                await application.save();

                res.status(201).json({
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

                await application.save();

                // Send rejection email with feedback
                await sendApplicationEmail(application, 'resume_rejected', {
                    score: aiAnalysis.matchScore,
                    feedback: aiAnalysis.justification,
                    threshold: RESUME_THRESHOLD_FOR_QUIZ
                });

                res.status(201).json({
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
            
            // If AI fails, still save the application but mark for manual review
            application.screeningStage = 'manual_review_needed';
            application.status = 'pending';
            await application.save();

            res.status(201).json({
                success: true,
                message: 'Application submitted. It will be reviewed by our team.',
                application: {
                    _id: application._id,
                    status: application.status,
                }
            });
        }

    } catch (error) {
        console.error('Error in job application:', error);
        res.status(500).json({ 
            message: 'Error submitting application', 
            error: error.message 
        });
    }
};

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

        if (score >= quiz.passingScore) {
            // Passed quiz - proceed to video interview
            application.screeningStage = 'video_pending';
            application.stageHistory.push({
                stage: 'quiz',
                timestamp: new Date(),
                status: 'passed',
                score: score,
                notes: 'Qualified for video interview'
            });

            // Send video interview invitation
            await sendApplicationEmail(application, 'video_invitation');

            await application.save();

            res.json({
                success: true,
                passed: true,
                score: score,
                passingScore: quiz.passingScore,
                message: 'Congratulations! You passed the skills assessment.',
                nextStep: {
                    stage: 'video_interview',
                    message: 'You will receive an email invitation for the video interview stage.'
                }
            });

        } else {
            // Failed quiz
            application.screeningStage = 'quiz_failed';
            application.status = 'rejected';
            application.stageHistory.push({
                stage: 'quiz',
                timestamp: new Date(),
                status: 'failed',
                score: score,
                notes: 'Did not meet passing score'
            });

            await application.save();

            // Send rejection email
            await sendApplicationEmail(application, 'quiz_failed', {
                score: score,
                passingScore: quiz.passingScore
            });

            res.json({
                success: false,
                passed: false,
                score: score,
                passingScore: quiz.passingScore,
                message: 'Unfortunately, you did not pass the skills assessment.',
                feedback: 'Consider improving your skills in the tested areas and apply for other positions.'
            });
        }

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};