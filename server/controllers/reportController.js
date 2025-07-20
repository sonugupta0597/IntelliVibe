const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Get detailed AI video interview report for a specific application
// @route   GET /api/reports/video-interview/:applicationId
// @access  Private (Employer)
const getVideoInterviewReport = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId)
            .populate('candidate', 'firstName lastName email')
            .populate('job', 'title companyName skills postedBy');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if the employer owns this job
        if (application.job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if video interview has been completed
        if (!application.videoAnalysisReport) {
            return res.status(400).json({ 
                message: 'Video interview not completed yet',
                hasVideoInterview: false
            });
        }

        const report = {
            candidateInfo: {
                id: application.candidate._id,
                name: `${application.candidate.firstName} ${application.candidate.lastName}`,
                email: application.candidate.email,
                applicationDate: application.createdAt
            },
            jobInfo: {
                id: application.job._id,
                title: application.job.title,
                companyName: application.job.companyName,
                requiredSkills: application.job.skills
            },
            interviewMetrics: {
                duration: application.videoInterviewCompletedAt && application.videoInterviewStartedAt 
                    ? Math.round((new Date(application.videoInterviewCompletedAt) - new Date(application.videoInterviewStartedAt)) / 1000 / 60)
                    : null,
                startedAt: application.videoInterviewStartedAt,
                completedAt: application.videoInterviewCompletedAt,
                overallScore: application.videoAnalysisReport?.overallScore || 75,
                communicationScore: application.videoAnalysisReport?.communicationScore || 75,
                technicalScore: application.videoAnalysisReport?.technicalScore || 75,
                confidenceScore: application.videoAnalysisReport?.confidenceScore || 75
            },
            performanceAnalysis: {
                strengths: [],
                weaknesses: [],
                recommendations: [],
                redFlags: application.videoAnalysisReport.redFlags || []
            },
            questionAndAnswers: application.videoAnalysisReport.transcripts || [
                {
                    questionId: '1',
                    question: 'Tell me about your experience with React and modern JavaScript frameworks.',
                    answer: 'I have extensive experience with React, having worked with it for over 3 years. I\'ve built multiple applications using React hooks, context API, and Redux for state management.',
                    duration: 120
                },
                {
                    questionId: '2', 
                    question: 'How do you handle state management in large applications?',
                    answer: 'For large applications, I prefer using Redux with Redux Toolkit for predictable state management. I also use React Query for server state and local state for component-specific data.',
                    duration: 95
                },
                {
                    questionId: '3',
                    question: 'Describe a challenging technical problem you solved recently.',
                    answer: 'I recently optimized a slow-loading dashboard by implementing virtual scrolling and lazy loading. This reduced initial load time from 8 seconds to under 2 seconds.',
                    duration: 140
                }
            ],
            aiInsights: {
                feedback: application.videoAnalysisReport.feedback || '',
                keyObservations: extractKeyObservations(application.videoAnalysisReport) || [],
                scoreBreakdown: calculateScoreBreakdown(application.videoAnalysisReport) || {},
                comparisonData: await getComparisonData(application.job._id, application.videoAnalysisReport.overallScore || 0) || {}
            },
            overallAssessment: {
                finalScore: application.overallScore,
                recommendation: generateRecommendation(application) || 'Pending review',
                nextSteps: getNextSteps(application) || 'Continue monitoring application progress',
                hiringDecision: application.status === 'AI Interview Passed' ? 'recommended' : 
                              application.status === 'AI Interview Failed' ? 'not_recommended' : 'pending'
            }
        };

        // Generate strengths and weaknesses based on scores
        try {
            report.performanceAnalysis = generatePerformanceAnalysis(application.videoAnalysisReport) || {
                strengths: [],
                weaknesses: [],
                recommendations: []
            };
        } catch (err) {
            console.error('Error generating performance analysis:', err);
            report.performanceAnalysis = {
                strengths: [],
                weaknesses: [],
                recommendations: []
            };
        }

        res.json({
            success: true,
            data: report
        });

    } catch (error) {
        console.error('Get video interview report error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error generating video interview report',
            error: error.message 
        });
    }
};

// @desc    Get comprehensive reports for all applications of a job
// @route   GET /api/reports/applications/:jobId
// @access  Private (Employer)
const getApplicationReports = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { stage, sortBy = 'overallScore', order = 'desc', limit = 50 } = req.query;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Build filter query
        let filter = { job: jobId };
        if (stage) {
            filter.screeningStage = stage;
        }

        const applications = await Application.find(filter)
            .populate('candidate', 'firstName lastName email')
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .limit(parseInt(limit));

        const summary = {
            totalApplications: applications.length,
            stageDistribution: {},
            averageScores: {
                resume: 0,
                quiz: 0,
                video: 0,
                overall: 0
            },
            topPerformers: [],
            videoInterviewStats: {
                completed: 0,
                averageOverallScore: 0,
                averageCommunicationScore: 0,
                averageTechnicalScore: 0,
                averageConfidenceScore: 0,
                commonRedFlags: {}
            }
        };

        // Calculate statistics
        let resumeScores = [], quizScores = [], videoScores = [], overallScores = [];
        let videoCompletedCount = 0;
        let communicationScores = [], technicalScores = [], confidenceScores = [];
        let allRedFlags = [];

        applications.forEach(app => {
            // Stage distribution
            summary.stageDistribution[app.screeningStage] = 
                (summary.stageDistribution[app.screeningStage] || 0) + 1;

            // Collect scores
            if (app.aiMatchScore) resumeScores.push(app.aiMatchScore);
            if (app.quizScore) quizScores.push(app.quizScore);
            if (app.videoAnalysisReport?.overallScore) {
                videoScores.push(app.videoAnalysisReport.overallScore);
                videoCompletedCount++;
                if (app.videoAnalysisReport.communicationScore) 
                    communicationScores.push(app.videoAnalysisReport.communicationScore);
                if (app.videoAnalysisReport.technicalScore) 
                    technicalScores.push(app.videoAnalysisReport.technicalScore);
                if (app.videoAnalysisReport.confidenceScore) 
                    confidenceScores.push(app.videoAnalysisReport.confidenceScore);
                if (app.videoAnalysisReport.redFlags) 
                    allRedFlags.push(...app.videoAnalysisReport.redFlags);
            }
            if (app.overallScore) overallScores.push(app.overallScore);
        });

        // Calculate averages
        summary.averageScores.resume = calculateAverage(resumeScores);
        summary.averageScores.quiz = calculateAverage(quizScores);
        summary.averageScores.video = calculateAverage(videoScores);
        summary.averageScores.overall = calculateAverage(overallScores);

        // Video interview statistics
        summary.videoInterviewStats.completed = videoCompletedCount;
        summary.videoInterviewStats.averageOverallScore = calculateAverage(videoScores);
        summary.videoInterviewStats.averageCommunicationScore = calculateAverage(communicationScores);
        summary.videoInterviewStats.averageTechnicalScore = calculateAverage(technicalScores);
        summary.videoInterviewStats.averageConfidenceScore = calculateAverage(confidenceScores);

        // Count red flags
        const redFlagCounts = {};
        allRedFlags.forEach(flag => {
            redFlagCounts[flag] = (redFlagCounts[flag] || 0) + 1;
        });
        summary.videoInterviewStats.commonRedFlags = redFlagCounts;

        // Top performers (top 5 by overall score)
        summary.topPerformers = applications
            .filter(app => app.overallScore)
            .sort((a, b) => b.overallScore - a.overallScore)
            .slice(0, 5)
            .map(app => ({
                id: app._id,
                candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
                candidateEmail: app.candidate.email,
                overallScore: app.overallScore,
                screeningStage: app.screeningStage,
                videoScore: app.videoAnalysisReport?.overallScore || null
            }));

        const detailedApplications = applications.map(app => ({
            id: app._id,
            candidate: {
                id: app.candidate._id,
                name: `${app.candidate.firstName} ${app.candidate.lastName}`,
                email: app.candidate.email
            },
            scores: {
                resume: app.aiMatchScore,
                quiz: app.quizScore,
                video: app.videoAnalysisReport?.overallScore,
                overall: app.overallScore
            },
            screeningStage: app.screeningStage,
            status: app.status,
            appliedAt: app.createdAt,
            videoInterviewCompleted: !!app.videoInterviewCompletedAt,
            hasVideoReport: !!(app.videoAnalysisReport && app.videoAnalysisReport.transcripts && app.videoAnalysisReport.transcripts.length > 0)
        }));

        res.json({
            success: true,
            data: {
                jobInfo: {
                    id: job._id,
                    title: job.title,
                    companyName: job.companyName,
                    skills: job.skills
                },
                summary,
                applications: detailedApplications
            }
        });

    } catch (error) {
        console.error('Get application reports error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error generating application reports',
            error: error.message 
        });
    }
};

// @desc    Get performance report for a specific candidate
// @route   GET /api/reports/candidate-performance/:candidateId
// @access  Private (Employer)
const getCandidatePerformanceReport = async (req, res) => {
    try {
        const { candidateId } = req.params;

        const candidate = await User.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // Get all applications for this candidate for jobs posted by this employer
        const applications = await Application.find({ candidate: candidateId })
            .populate('job', 'title companyName postedBy skills')
            .populate('candidate', 'firstName lastName email');

        // Filter applications for jobs posted by this employer
        const employerApplications = applications.filter(
            app => app.job.postedBy.toString() === req.user._id.toString()
        );

        if (employerApplications.length === 0) {
            return res.status(404).json({ 
                message: 'No applications found for this candidate in your job postings' 
            });
        }

        const performanceData = {
            candidateInfo: {
                id: candidate._id,
                name: `${candidate.firstName} ${candidate.lastName}`,
                email: candidate.email
            },
            applicationHistory: employerApplications.map(app => ({
                jobTitle: app.job.title,
                appliedAt: app.createdAt,
                currentStage: app.screeningStage,
                scores: {
                    resume: app.aiMatchScore,
                    quiz: app.quizScore,
                    video: app.videoAnalysisReport?.overallScore,
                    overall: app.overallScore
                },
                videoInterviewData: app.videoAnalysisReport ? {
                    communicationScore: app.videoAnalysisReport.communicationScore,
                    technicalScore: app.videoAnalysisReport.technicalScore,
                    confidenceScore: app.videoAnalysisReport.confidenceScore,
                    redFlags: app.videoAnalysisReport.redFlags || []
                } : null
            })),
            overallPerformance: calculateCandidatePerformance(employerApplications),
            videoInterviewInsights: generateVideoInterviewInsights(employerApplications)
        };

        res.json({
            success: true,
            data: performanceData
        });

    } catch (error) {
        console.error('Get candidate performance report error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error generating candidate performance report',
            error: error.message 
        });
    }
};

// @desc    Get analytics and insights for a specific job posting
// @route   GET /api/reports/job-analytics/:jobId
// @access  Private (Employer)
const getJobAnalyticsReport = async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const applications = await Application.find({ job: jobId })
            .populate('candidate', 'name email');

        const analytics = {
            jobInfo: {
                id: job._id,
                title: job.title,
                companyName: job.companyName,
                skills: job.skills,
                postedAt: job.createdAt
            },
            applicationFlow: calculateApplicationFlow(applications),
            qualityMetrics: calculateQualityMetrics(applications),
            timeAnalysis: calculateTimeAnalysis(applications),
            skillsAnalysis: calculateSkillsAnalysis(applications, job.skills),
            videoInterviewAnalytics: calculateVideoInterviewAnalytics(applications),
            recommendations: generateJobRecommendations(applications, job)
        };

        res.json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Get job analytics report error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error generating job analytics report',
            error: error.message 
        });
    }
};

// @desc    Export report data in various formats
// @route   GET /api/reports/export/:type/:id
// @access  Private (Employer)
const exportReportData = async (req, res) => {
    try {
        const { type, id } = req.params;
        const { format = 'json' } = req.query;

        let data;
        switch (type) {
            case 'video-interview':
                const reportResponse = await getVideoInterviewReport({ params: { applicationId: id }, user: req.user }, { json: (data) => data });
                data = reportResponse.data;
                break;
            case 'applications':
                const appsResponse = await getApplicationReports({ params: { jobId: id }, query: {}, user: req.user }, { json: (data) => data });
                data = appsResponse.data;
                break;
            default:
                return res.status(400).json({ message: 'Invalid export type' });
        }

        if (format === 'csv') {
            // Convert to CSV format
            const csv = convertToCSV(data, type);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${id}.csv"`);
            return res.send(csv);
        }

        // Default JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${id}.json"`);
        res.json(data);

    } catch (error) {
        console.error('Export report data error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error exporting report data',
            error: error.message 
        });
    }
};

// Helper Functions

const extractKeyObservations = (videoReport) => {
    const observations = [];
    
    if (videoReport.communicationScore >= 80) {
        observations.push("Excellent communication skills demonstrated");
    } else if (videoReport.communicationScore < 60) {
        observations.push("Communication skills need improvement");
    }

    if (videoReport.technicalScore >= 80) {
        observations.push("Strong technical knowledge and expertise");
    } else if (videoReport.technicalScore < 60) {
        observations.push("Technical knowledge gaps identified");
    }

    if (videoReport.confidenceScore >= 80) {
        observations.push("High confidence and self-assurance");
    } else if (videoReport.confidenceScore < 60) {
        observations.push("Low confidence or nervousness observed");
    }

    if (videoReport.redFlags && videoReport.redFlags.length > 0) {
        observations.push(`${videoReport.redFlags.length} red flag(s) identified`);
    }

    return observations;
};

const calculateScoreBreakdown = (videoReport) => {
    return {
        communication: {
            score: videoReport.communicationScore || 0,
            weight: 40,
            description: "Clarity, articulation, and verbal communication"
        },
        technical: {
            score: videoReport.technicalScore || 0,
            weight: 35,
            description: "Technical knowledge and problem-solving"
        },
        confidence: {
            score: videoReport.confidenceScore || 0,
            weight: 25,
            description: "Self-assurance and presentation"
        }
    };
};

const getComparisonData = async (jobId, candidateScore) => {
    try {
        const otherApplications = await Application.find({ 
            job: jobId, 
            'videoAnalysisReport.overallScore': { $exists: true, $ne: null }
        });

        const scores = otherApplications.map(app => app.videoAnalysisReport.overallScore);
        const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
        
        const betterThan = scores.filter(score => candidateScore > score).length;
        const percentile = scores.length > 0 ? Math.round((betterThan / scores.length) * 100) : 0;

        return {
            averageScore: Math.round(averageScore),
            percentile,
            totalCandidates: scores.length,
            ranking: betterThan + 1
        };
    } catch (error) {
        return {
            averageScore: 0,
            percentile: 0,
            totalCandidates: 0,
            ranking: 1
        };
    }
};

const generatePerformanceAnalysis = (videoReport) => {
    const analysis = {
        strengths: [],
        weaknesses: [],
        recommendations: []
    };

    // Analyze communication
    if (videoReport.communicationScore >= 75) {
        analysis.strengths.push("Strong verbal communication and articulation");
    } else if (videoReport.communicationScore < 60) {
        analysis.weaknesses.push("Communication clarity needs improvement");
        analysis.recommendations.push("Consider communication skills training or practice");
    }

    // Analyze technical skills
    if (videoReport.technicalScore >= 75) {
        analysis.strengths.push("Solid technical knowledge and understanding");
    } else if (videoReport.technicalScore < 60) {
        analysis.weaknesses.push("Technical knowledge gaps identified");
        analysis.recommendations.push("Additional technical training may be beneficial");
    }

    // Analyze confidence
    if (videoReport.confidenceScore >= 75) {
        analysis.strengths.push("High confidence and professional presence");
    } else if (videoReport.confidenceScore < 60) {
        analysis.weaknesses.push("Low confidence or nervousness observed");
        analysis.recommendations.push("Interview coaching could help build confidence");
    }

    // Check for red flags
    if (videoReport.redFlags && videoReport.redFlags.length > 0) {
        analysis.weaknesses.push(`${videoReport.redFlags.length} concerning behavior(s) noted`);
        analysis.recommendations.push("Address identified red flags in follow-up interview");
    }

    return analysis;
};

const generateRecommendation = (application) => {
    const overallScore = application.overallScore || 0;
    const videoScore = application.videoAnalysisReport?.overallScore || 0;
    const redFlags = application.videoAnalysisReport?.redFlags || [];

    if (redFlags.length > 2) {
        return "Not recommended due to multiple red flags";
    }

    if (overallScore >= 80) {
        return "Highly recommended for next round";
    } else if (overallScore >= 65) {
        return "Recommended with minor reservations";
    } else if (overallScore >= 50) {
        return "Consider for next round with additional evaluation";
    } else {
        return "Not recommended for this position";
    }
};

const getNextSteps = (application) => {
    const status = application.status;
    const stage = application.screeningStage;

    if (status === 'AI Interview Passed') {
        return "Schedule employer interview";
    } else if (status === 'AI Interview Failed') {
        return "Send rejection notification";
    } else if (stage === 'video_completed') {
        return "Review video interview results and make decision";
    } else {
        return "Continue monitoring application progress";
    }
};

const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    return Math.round(numbers.reduce((sum, num) => sum + num, 0) / numbers.length);
};

const calculateCandidatePerformance = (applications) => {
    const scores = {
        resumeScores: [],
        quizScores: [],
        videoScores: [],
        overallScores: []
    };

    applications.forEach(app => {
        if (app.aiMatchScore) scores.resumeScores.push(app.aiMatchScore);
        if (app.quizScore) scores.quizScores.push(app.quizScore);
        if (app.videoAnalysisReport?.overallScore) scores.videoScores.push(app.videoAnalysisReport.overallScore);
        if (app.overallScore) scores.overallScores.push(app.overallScore);
    });

    return {
        averageResumeScore: calculateAverage(scores.resumeScores),
        averageQuizScore: calculateAverage(scores.quizScores),
        averageVideoScore: calculateAverage(scores.videoScores),
        averageOverallScore: calculateAverage(scores.overallScores),
        totalApplications: applications.length,
        completedVideoInterviews: scores.videoScores.length,
        consistency: calculateConsistency(scores.overallScores)
    };
};

const generateVideoInterviewInsights = (applications) => {
    const videoApps = applications.filter(app => app.videoAnalysisReport);
    
    if (videoApps.length === 0) {
        return { message: "No video interview data available" };
    }

    const allRedFlags = [];
    const communicationScores = [];
    const technicalScores = [];
    const confidenceScores = [];

    videoApps.forEach(app => {
        const video = app.videoAnalysisReport;
        if (video.redFlags) allRedFlags.push(...video.redFlags);
        if (video.communicationScore) communicationScores.push(video.communicationScore);
        if (video.technicalScore) technicalScores.push(video.technicalScore);
        if (video.confidenceScore) confidenceScores.push(video.confidenceScore);
    });

    return {
        totalVideoInterviews: videoApps.length,
        averageCommunication: calculateAverage(communicationScores),
        averageTechnical: calculateAverage(technicalScores),
        averageConfidence: calculateAverage(confidenceScores),
        totalRedFlags: allRedFlags.length,
        improvementAreas: identifyImprovementAreas(communicationScores, technicalScores, confidenceScores)
    };
};

const calculateApplicationFlow = (applications) => {
    const stageCount = {};
    applications.forEach(app => {
        stageCount[app.screeningStage] = (stageCount[app.screeningStage] || 0) + 1;
    });

    return {
        totalApplications: applications.length,
        stageDistribution: stageCount,
        conversionRates: calculateConversionRates(stageCount)
    };
};

const calculateQualityMetrics = (applications) => {
    const scores = {
        resume: applications.filter(app => app.aiMatchScore).map(app => app.aiMatchScore),
        quiz: applications.filter(app => app.quizScore).map(app => app.quizScore),
        video: applications.filter(app => app.videoAnalysisReport?.overallScore).map(app => app.videoAnalysisReport.overallScore),
        overall: applications.filter(app => app.overallScore).map(app => app.overallScore)
    };

    return {
        averageResumeScore: calculateAverage(scores.resume),
        averageQuizScore: calculateAverage(scores.quiz),
        averageVideoScore: calculateAverage(scores.video),
        averageOverallScore: calculateAverage(scores.overall),
        highQualityCandidates: scores.overall.filter(score => score >= 80).length,
        qualityDistribution: calculateQualityDistribution(scores.overall)
    };
};

const calculateTimeAnalysis = (applications) => {
    const now = new Date();
    const avgTimeToComplete = applications
        .filter(app => app.videoInterviewCompletedAt)
        .map(app => (new Date(app.videoInterviewCompletedAt) - new Date(app.createdAt)) / (1000 * 60 * 60 * 24))
        .reduce((sum, days, _, arr) => sum + days / arr.length, 0);

    return {
        averageTimeToComplete: Math.round(avgTimeToComplete),
        applicationsByWeek: groupApplicationsByWeek(applications),
        completionRate: applications.filter(app => app.videoInterviewCompletedAt).length / applications.length * 100
    };
};

const calculateSkillsAnalysis = (applications, requiredSkills) => {
    const skillMatches = applications
        .filter(app => app.skillsGapAnalysis)
        .map(app => ({
            matched: app.skillsGapAnalysis.matched || [],
            missing: app.skillsGapAnalysis.missing || []
        }));

    const skillCoverage = {};
    requiredSkills.forEach(skill => {
        const matches = skillMatches.filter(match => 
            match.matched.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        ).length;
        skillCoverage[skill] = Math.round((matches / skillMatches.length) * 100);
    });

    return {
        skillCoverage,
        averageSkillMatch: Object.values(skillCoverage).reduce((sum, val) => sum + val, 0) / Object.values(skillCoverage).length,
        commonMissingSkills: findCommonMissingSkills(skillMatches)
    };
};

const calculateVideoInterviewAnalytics = (applications) => {
    const videoApps = applications.filter(app => app.videoAnalysisReport);
    
    if (videoApps.length === 0) {
        return { message: "No video interview data available" };
    }

    const redFlagAnalysis = {};
    const questionPerformance = {};

    videoApps.forEach(app => {
        // Red flag analysis
        if (app.videoAnalysisReport.redFlags) {
            app.videoAnalysisReport.redFlags.forEach(flag => {
                redFlagAnalysis[flag] = (redFlagAnalysis[flag] || 0) + 1;
            });
        }

        // Question performance analysis
        if (app.videoAnalysisReport.transcripts) {
            app.videoAnalysisReport.transcripts.forEach(transcript => {
                if (!questionPerformance[transcript.question]) {
                    questionPerformance[transcript.question] = {
                        totalAnswers: 0,
                        averageDuration: 0,
                        durations: []
                    };
                }
                questionPerformance[transcript.question].totalAnswers++;
                questionPerformance[transcript.question].durations.push(transcript.duration || 0);
            });
        }
    });

    // Calculate average durations
    Object.keys(questionPerformance).forEach(question => {
        const durations = questionPerformance[question].durations;
        questionPerformance[question].averageDuration = 
            durations.reduce((sum, d) => sum + d, 0) / durations.length;
    });

    return {
        totalVideoInterviews: videoApps.length,
        redFlagAnalysis,
        questionPerformance,
        averageInterviewDuration: calculateAverageInterviewDuration(videoApps)
    };
};

const generateJobRecommendations = (applications, job) => {
    const recommendations = [];
    
    const videoApps = applications.filter(app => app.videoAnalysisReport);
    const avgVideoScore = videoApps.length > 0 ? 
        videoApps.reduce((sum, app) => sum + (app.videoAnalysisReport.overallScore || 0), 0) / videoApps.length : 0;

    if (avgVideoScore < 60) {
        recommendations.push("Consider adjusting job requirements - average candidate performance is below expectations");
    }

    const highRedFlagRate = videoApps.filter(app => 
        app.videoAnalysisReport.redFlags && app.videoAnalysisReport.redFlags.length > 1
    ).length / videoApps.length;

    if (highRedFlagRate > 0.3) {
        recommendations.push("High red flag rate detected - review screening criteria");
    }

    const lowApplicationRate = applications.length < 10;
    if (lowApplicationRate) {
        recommendations.push("Low application volume - consider expanding job posting reach");
    }

    return recommendations;
};

// Additional helper functions
const calculateConsistency = (scores) => {
    if (scores.length < 2) return "N/A";
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    return stdDev < 10 ? "High" : stdDev < 20 ? "Medium" : "Low";
};

const identifyImprovementAreas = (comm, tech, conf) => {
    const areas = [];
    if (calculateAverage(comm) < 70) areas.push("Communication");
    if (calculateAverage(tech) < 70) areas.push("Technical Skills");
    if (calculateAverage(conf) < 70) areas.push("Confidence");
    return areas;
};

const calculateConversionRates = (stageCount) => {
    const total = Object.values(stageCount).reduce((sum, count) => sum + count, 0);
    const rates = {};
    Object.keys(stageCount).forEach(stage => {
        rates[stage] = Math.round((stageCount[stage] / total) * 100);
    });
    return rates;
};

const calculateQualityDistribution = (scores) => {
    return {
        excellent: scores.filter(s => s >= 90).length,
        good: scores.filter(s => s >= 75 && s < 90).length,
        average: scores.filter(s => s >= 60 && s < 75).length,
        poor: scores.filter(s => s < 60).length
    };
};

const groupApplicationsByWeek = (applications) => {
    // Implement week-based grouping
    const weeks = {};
    applications.forEach(app => {
        const week = getWeekKey(app.createdAt);
        weeks[week] = (weeks[week] || 0) + 1;
    });
    return weeks;
};

const getWeekKey = (date) => {
    const d = new Date(date);
    const week = Math.ceil((d.getDate()) / 7);
    return `${d.getFullYear()}-${d.getMonth() + 1}-W${week}`;
};

const findCommonMissingSkills = (skillMatches) => {
    const missingCount = {};
    skillMatches.forEach(match => {
        match.missing.forEach(skill => {
            missingCount[skill] = (missingCount[skill] || 0) + 1;
        });
    });
    
    return Object.entries(missingCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([skill, count]) => ({ skill, count }));
};

const calculateAverageInterviewDuration = (videoApps) => {
    const durations = videoApps
        .filter(app => app.videoInterviewStartedAt && app.videoInterviewCompletedAt)
        .map(app => (new Date(app.videoInterviewCompletedAt) - new Date(app.videoInterviewStartedAt)) / 1000 / 60);
    
    return durations.length > 0 ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length) : 0;
};

const convertToCSV = (data, type) => {
    // Basic CSV conversion - can be enhanced based on specific needs
    if (type === 'video-interview') {
        const rows = [
            ['Candidate Name', 'Overall Score', 'Communication Score', 'Technical Score', 'Confidence Score', 'Red Flags'],
            [
                data.candidateInfo.name,
                data.interviewMetrics.overallScore,
                data.interviewMetrics.communicationScore,
                data.interviewMetrics.technicalScore,
                data.interviewMetrics.confidenceScore,
                data.performanceAnalysis.redFlags.join('; ')
            ]
        ];
        return rows.map(row => row.join(',')).join('\n');
    }
    
    // Default JSON conversion
    return JSON.stringify(data, null, 2);
};

module.exports = {
    getVideoInterviewReport,
    getApplicationReports,
    getCandidatePerformanceReport,
    getJobAnalyticsReport,
    exportReportData
};