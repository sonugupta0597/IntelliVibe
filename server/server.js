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
// Real-time speech-to-text is now handled via AssemblyAI REST API endpoints.
// If you want to support real-time streaming, implement a similar socket-to-REST relay using AssemblyAI.
const aiRoutes = require('./routes/aiRoutes');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const { startStreamingRecognize } = require('./services/googleSpeechService');
// Initialize Express App





// -- C O N F I G U R A T I O N --
const app = express();
// --- Core Middleware ---
app.use(cors());
app.use(express.json());

connectDB();

// --- API Route Handlers ---
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/auth', authRoutes);


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your frontend's URL: "http://localhost:5173"
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
const generateInitialQuestion = async (applicationId) => {
  console.log(`[AI] Generating initial question for application: ${applicationId}`);
  // AI Logic: Fetch candidate's resume using applicationId, send to Gemini, get question.
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async call
  return "Tell me about a challenging project you've worked on and what made it so."
};

/**
 * Mocks a Gemini API call to generate a follow-up question.
 * @param {string} lastAnswer - The candidate's full transcribed answer.
 * @returns {Promise<string>} A relevant follow-up question.
 */
const generateFollowUpQuestion = async (lastAnswer) => {
  console.log(`[AI] Generating follow-up for answer: "${lastAnswer.substring(0, 50)}..."`);
  // AI Logic: Send the transcript to Gemini, get a contextual follow-up.
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async call
  if (lastAnswer.toLowerCase().includes("teamwork")) {
    return "That's interesting. Can you elaborate on how you handled disagreements within the team during that project?";
  }
  return "Thank you for sharing. What was the most important lesson you learned from that experience?";
};


// -- S O C K E T. I O  L O G I C --
io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);
  let fullTranscript = '';
  let recognizeStream = null;

  const getInterviewState = () => interviewSessions.get(socket.id);
  const setInterviewState = (newState) => interviewSessions.set(socket.id, { ...getInterviewState(), ...newState });

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

  const handleNextQuestion = async () => {
    const state = getInterviewState();
    if (state.questionCount >= 5) { // End interview after 5 questions
        console.log(`[Interview] Ending interview for ${socket.id}`);
        socket.emit('interview-finished');
        interviewSessions.delete(socket.id);
        return;
    }

    const nextQuestion = await generateFollowUpQuestion(state.fullTranscript);
    setInterviewState({
        questionCount: state.questionCount + 1,
        fullTranscript: '', // Reset transcript for the new answer
    });
    
    console.log(`[Interview] Sending question ${getInterviewState().questionCount} to ${socket.id}`);
    socket.emit('new-question', { question: nextQuestion, questionNumber: getInterviewState().questionCount });
  };


  socket.on('join-room', (applicationId) => {
    console.log(`[Socket] User ${socket.id} joined room for application: ${applicationId}`);
    // Initialize the state for this new interview session
    interviewSessions.set(socket.id, {
      applicationId,
      questionCount: 0,
      fullTranscript: '',
    });
  });

  socket.on('start-interview', async () => {
    console.log(`[Interview] Starting interview for ${socket.id}`);
    const state = getInterviewState();
    if (!state) {
        console.error(`[Error] "start-interview" received but no session found for ${socket.id}`);
        return;
    }
    
    const firstQuestion = await generateInitialQuestion(state.applicationId);
    setInterviewState({ questionCount: 1 });

    console.log(`[Interview] Sending question 1 to ${socket.id}`);
    socket.emit('new-question', { question: firstQuestion, questionNumber: 1 });
  });

  socket.on('end-answer', (data) => {
    // Accept transcript from client and store it for follow-up questions
    if (data && data.transcript) {
      setInterviewState({ fullTranscript: data.transcript.trim() });
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