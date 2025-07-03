// server/models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    companyName: { type: String, required: true }, // NEW
    location: { type: String, required: true },
    skills: { type: [String], required: true }, // RENAMED from requirements
    salary: { type: String }, // NEW (Optional)
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
    description: { type: String, required: true },
    expiryDate: { type: Date }, // NEW (Optional)
    isActive: { type: Boolean, default: true }, // NEW
    interviewDuration: { type: Number }, // NEW (in minutes, Optional for now)
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);