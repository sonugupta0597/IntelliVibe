const mongoose = require('mongoose');

const stageHistorySchema = new mongoose.Schema({
    stage: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['completed', 'passed', 'failed', 'in_progress'],
        required: true,
    },
    score: Number,
    notes: String,
});

const quizResultSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    userAnswer: Number,
    correctAnswer: Number,
    isCorrect: Boolean,
});

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    resumeUrl: {
        type: String,
        required: true,
    },
    
    // Overall status
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
        default: 'pending',
    },
    
    // Screening stage tracking
    screeningStage: {
        type: String,
        enum: [
            'resume_uploaded',
            'resume_screening',
            'resume_rejected',
            'quiz_pending',
            'quiz_in_progress',
            'quiz_failed',
            'video_pending',
            'video_in_progress',
            'video_completed',
            'final_review',
            'hired',
            'manual_review_needed'
        ],
        default: 'resume_uploaded',
    },
    
    stageHistory: [stageHistorySchema],
    
    // AI Resume Analysis
    aiMatchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
    },
    aiJustification: {
        type: String,
        default: null,
    },
    aiAnalysisDate: {
        type: Date,
        default: null,
    },
    
    // Skills Gap Analysis
    skillsGapAnalysis: {
        matched: [String],
        missing: [String],
        additional: [String],
        matchPercentage: Number,
    },
    
    // Quiz fields
    quizStartedAt: {
        type: Date,
        default: null,
    },
    quizCompletedAt: {
        type: Date,
        default: null,
    },
    quizScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
    },
    quizResults: [quizResultSchema],
    quizAttempts: {
        type: Number,
        default: 0,
    },
    
    // Video interview fields
    videoInterviewUrl: {
        type: String,
        default: null,
    },
    videoInterviewStartedAt: {
        type: Date,
        default: null,
    },
    videoInterviewCompletedAt: {
        type: Date,
        default: null,
    },
    videoAnalysisReport: {
        overallScore: Number,
        communicationScore: Number,
        technicalScore: Number,
        confidenceScore: Number,
        transcripts: [{
            questionId: String,
            question: String,
            answer: String,
            duration: Number,
        }],
        feedback: String,
        redFlags: [String],
    },
    
    // Auto-processing flags
    autoProcessed: {
        type: Boolean,
        default: false,
    },
    autoProcessedAt: {
        type: Date,
        default: null,
    },
    
    // Combined scores
    overallScore: {
        type: Number,
        default: null,
    },
    scoringBreakdown: {
        resumeWeight: { type: Number, default: 40 },
        quizWeight: { type: Number, default: 30 },
        videoWeight: { type: Number, default: 30 },
    },
    
}, {
    timestamps: true,
});

// Indexes
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ job: 1, screeningStage: 1 });
applicationSchema.index({ candidate: 1, status: 1 });

// Methods
applicationSchema.methods.calculateOverallScore = function() {
    const breakdown = this.scoringBreakdown;
    let totalWeight = 0;
    let weightedScore = 0;
    
    if (this.aiMatchScore !== null) {
        weightedScore += this.aiMatchScore * (breakdown.resumeWeight / 100);
        totalWeight += breakdown.resumeWeight;
    }
    
    if (this.quizScore !== null) {
        weightedScore += this.quizScore * (breakdown.quizWeight / 100);
        totalWeight += breakdown.quizWeight;
    }
    
    if (this.videoAnalysisReport?.overallScore !== null) {
        weightedScore += this.videoAnalysisReport.overallScore * (breakdown.videoWeight / 100);
        totalWeight += breakdown.videoWeight;
    }
    
    this.overallScore = totalWeight > 0 ? Math.round(weightedScore * 100 / totalWeight) : null;
    return this.overallScore;
};

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;