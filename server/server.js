// server.js (CommonJS Version)
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const Application = require('./models/Application')
const Job = require('./models/Job');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
// Real-time speech-to-text is now handled via AssemblyAI REST API endpoints.
// If you want to support real-time streaming, implement a similar socket-to-REST relay using AssemblyAI.
const aiRoutes = require('./routes/aiRoutes');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const { startStreamingRecognize } = require('./services/googleSpeechService');
const session = require('express-session');
const passport = require('./config/passport');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
// Initialize Express App





// -- C O N F I G U R A T I O N --
const app = express();
// --- Core Middleware ---
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

connectDB();

// --- API Route Handlers ---
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/reports', reportRoutes);


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your client's origin
    methods: ["GET", "POST"]
  },
});
console.log('server.js loaded');
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes); // Add this
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5001;

console.log(`[Server] Starting with PORT: ${PORT}`);

// In-memory store for interview sessions. In a production app, you might use Redis.
const interviewSessions = new Map();

// -- M O C K  A I  S E R V I C E S --
// Replace these with your actual Gemini API calls

/**
 * Mocks a Gemini API call to generate the first question.
 * @param {string} applicationId - The ID of the application, to fetch resume details etc.
 * @returns {Promise<string>} The first interview question.
 */
const { generateInitialQuestion, generateFollowUpQuestion, analyzeInterviewTranscript } = require('./services/videoAiService');

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);
  let fullTranscript = '';
  let recognizeStream = null;

  const getInterviewState = () => interviewSessions.get(socket.id);
  const setInterviewState = (newState) => interviewSessions.set(socket.id, { ...getInterviewState(), ...newState });

  socket.on('join-room', (applicationId) => {
    console.log(`[Socket] User ${socket.id} joined room for application: ${applicationId}`);
    // Initialize the state for this new interview session
    interviewSessions.set(socket.id, {
      applicationId,
      questionCount: 0,
      fullTranscript: '',
    });
    // Notify the client that the session is ready
    socket.emit('session-ready');
  });
  
  // --- Live Audio Streaming and Transcription ---
  socket.on('start-audio-stream', () => {
    if (recognizeStream) {
      recognizeStream.end();
      recognizeStream = null;
    }
    fullTranscript = '';
    recognizeStream = startStreamingRecognize(
      ({ transcript, isFinal }) => {
        socket.emit('live-transcript', transcript);
        if (isFinal && transcript) {
          fullTranscript += transcript + ' ';
        }
      },
      (err) => {
        console.error('[Google Streaming Error]', err);
        socket.emit('transcription-error', err.message || 'Streaming error');
      }
    );
  });

  socket.on('audio-chunk', (chunk) => {
    if (recognizeStream) {
      recognizeStream.write(chunk);
    }
  });

  socket.on('end-audio-stream', () => {
    if (recognizeStream) {
      recognizeStream.end();
      recognizeStream = null;
    }
    // Save the final transcript to the session for follow-up questions
    setInterviewState({ fullTranscript: fullTranscript.trim() });
    socket.emit('final-transcript', fullTranscript.trim());
  });

  // Real-time speech-to-text is now handled via AssemblyAI REST API endpoints.
  // If you want to support real-time streaming, implement a similar socket-to-REST relay using AssemblyAI.

  const { generateInitialQuestion, generateFollowUpQuestion, analyzeInterviewTranscript } = require('./services/videoAiService');

// ... (rest of the file)

const handleNextQuestion = async () => {
  const state = getInterviewState();
  if (!state) {
    console.error(`[Error] handleNextQuestion called but no session found for ${socket.id}`);
    socket.emit('error', { message: 'Your session has expired. Please refresh the page.' });
    return;
  }
  if (state.questionCount >= 5) { // End interview after 5 questions
      console.log(`[Interview] Ending interview for ${socket.id}`);
      
      // Analyze the full transcript
      const analysis = await analyzeInterviewTranscript(state.fullTranscript, state.jobDetails);

      // Update the application in the database
      try {
          const application = await Application.findById(state.applicationId);
          if (application) {
              application.videoAnalysisReport = {
                  overallScore: analysis.score,
                  summary: analysis.summary,
                  // You can add more fields here if your analysis provides them
              };
              application.status = analysis.status;
              application.screeningStage = analysis.status === 'AI Interview Passed' ? 'video_completed' : 'video_failed';
              await application.save();
              console.log(`[DB] Application ${state.applicationId} updated with interview analysis.`);
          }
      } catch (error) {
          console.error(`[DB] Error updating application ${state.applicationId}:`, error);
      }

      socket.emit('interview-finished', { analysis });
      interviewSessions.delete(socket.id);
      return;
  }

  // FIX: Pass both transcriptHistory AND jobDetails to generateFollowUpQuestion
  const nextQuestion = await generateFollowUpQuestion(state.fullTranscript, state.jobDetails);
  setInterviewState({
      ...state,
      questionCount: state.questionCount + 1,
      fullTranscript: '', // Reset transcript for the new answer
  });
  
  console.log(`[Interview] Sending question ${getInterviewState().questionCount} to ${socket.id}`);
  socket.emit('new-question', { question: nextQuestion, questionNumber: getInterviewState().questionCount });
};

// ... (rest of the file)

  socket.on('start-interview', async () => {
    console.log(`[Interview] Starting interview for ${socket.id}`);
    const state = getInterviewState();
    if (!state) {
        console.error(`[Error] "start-interview" received but no session found for ${socket.id}`);
        return;
    }
    
    // Fetch job details and resume to generate a better initial question
    try {
        const application = await Application.findById(state.applicationId).populate('job');
        if (application) {
            const jobDetails = application.job;
            const resumePath = path.join(__dirname, application.resumeUrl.startsWith('uploads') ? '' : '..', application.resumeUrl);

            const dataBuffer = await fs.readFile(resumePath);
            const data = await pdfParse(dataBuffer);
            const resumeText = data.text;

            const firstQuestion = await generateInitialQuestion(jobDetails, resumeText);
            
            setInterviewState({
                ...state,
                questionCount: 1,
                jobDetails: {
                    title: jobDetails.title,
                    skills: jobDetails.skills,
                },
            });

            console.log(`[Interview] Sending question 1 to ${socket.id}`);
            socket.emit('new-question', { question: firstQuestion, questionNumber: 1 });
        } else {
            console.error(`[Error] Application not found for ID: ${state.applicationId}`);
            socket.emit('error', { message: 'Application not found.' });
        }
    } catch (error) {
        console.error('[Error] CRITICAL: Could not start interview.', {
            socketId: socket.id,
            applicationId: state ? state.applicationId : 'N/A',
            errorMessage: error.message,
            errorStack: error.stack,
        });
        socket.emit('error', { message: 'Failed to start interview. Check server logs for details.' });
    }
  });

  socket.on('end-answer', (data) => {
    const state = getInterviewState();
    // Accept transcript from client and store it for follow-up questions
    if (data && data.transcript) {
      setInterviewState({ ...state, fullTranscript: data.transcript.trim() });
    }
    console.log(`[Interview] User ${socket.id} manually ended their answer.`);
    // Move to next question after a short delay
    setTimeout(() => {
      handleNextQuestion();
    }, 1000);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
    interviewSessions.delete(socket.id); // Clean up the session
  });
});

server.listen(PORT, () => {
  console.log(`IntelliVibe server listening on port ${PORT}`);
});