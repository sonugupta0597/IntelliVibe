const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    options: [{
        type: String,
        required: true,
    }],
    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        max: 3,
    },
    explanation: {
        type: String,
        default: null,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
    skill: {
        type: String,
        default: 'General',
    }
});

const quizSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        unique: true, // One quiz per job
    },
    questions: {
        type: [questionSchema],
        validate: [
            {
                validator: function(questions) {
                    return questions.length === 10;
                },
                message: 'Quiz must have exactly 10 questions'
            }
        ]
    },
    passingScore: {
        type: Number,
        default: 70, // 70% to pass
        min: 0,
        max: 100,
    },
    timeLimit: {
        type: Number,
        default: 30, // 30 minutes
    },
    generatedBy: {
        type: String,
        default: 'AI',
        enum: ['AI', 'Manual'],
    },
    attemptsAllowed: {
        type: Number,
        default: 1,
    },
    difficultyDistribution: {
        easy: { type: Number, default: 3 },
        medium: { type: Number, default: 5 },
        hard: { type: Number, default: 2 },
    }
}, {
    timestamps: true,
});

// Index for faster queries
quizSchema.index({ job: 1 });

// Method to shuffle questions
quizSchema.methods.getShuffledQuestions = function() {
    const questions = [...this.questions];
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    return questions;
};

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;