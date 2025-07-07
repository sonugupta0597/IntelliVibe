// server.js (Corrected for Deepgram SDK v3)

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const { createClient } = require('@deepgram/sdk'); // <-- V3 IMPORT
const connectDB = require('./config/db');
// -- C O N F I G U R A T I O N --


dotenv.config();


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your frontend's URL
  },
});

connectDB();
const PORT = process.env.PORT || 5001;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

if (!DEEPGRAM_API_KEY) {
  console.error("FATAL ERROR: DEEPGRAM_API_KEY is not set in the environment.");
  process.exit(1);
}

// V3 INITIALIZATION: Use createClient instead of new Deepgram()
const deepgramClient = createClient(DEEPGRAM_API_KEY);

const interviewSessions = new Map();

// -- M O C K  A I  S E R V I C E S -- (No changes needed here)
const generateInitialQuestion = async (applicationId) => {
  console.log(`[AI] Generating initial question for application: ${applicationId}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return "Tell me about a challenging project you've worked on and what made it so."
};

const generateFollowUpQuestion = async (lastAnswer) => {
  console.log(`[AI] Generating follow-up for answer: "${lastAnswer.substring(0, 50)}..."`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (lastAnswer.toLowerCase().includes("teamwork")) {
    return "That's interesting. Can you elaborate on how you handled disagreements within the team during that project?";
  }
  return "Thank you for sharing. What was the most important lesson you learned from that experience?";
};


// -- S O C K E T. I O  L O G I C --
io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);
  let deepgramConnection;
  let currentTranscript = '';

  const getInterviewState = () => interviewSessions.get(socket.id);
  const setInterviewState = (newState) => interviewSessions.set(socket.id, { ...getInterviewState(), ...newState });

  const setupDeepgram = () => {
    // V3 LIVE CONNECTION: Use client.listen.live
    const newDeepgramConnection = deepgramClient.listen.live({
        punctuate: true,
        smart_format: true,
        model: 'nova-2',
        interim_results: true,
        utterance_end_ms: 1000,
    });

    newDeepgramConnection.on('open', () => console.log(`[Deepgram] Connection opened for ${socket.id}`));
    newDeepgramConnection.on('close', () => console.log(`[Deepgram] Connection closed for ${socket.id}.`));
    newDeepgramConnection.on('error', (error) => console.error(`[Deepgram] Error for ${socket.id}:`, error));
    
    // V3 EVENT: Use 'results' instead of 'transcript'
    newDeepgramConnection.on('results', (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (transcript) {
            socket.emit('live-transcript', transcript);
            if (data.is_final) {
                currentTranscript += transcript + ' ';
            }
        }
    });
    
    // V3 EVENT: Use 'utteranceEnd' for end-of-speech detection
    newDeepgramConnection.on('utteranceEnd', () => {
        console.log(`[Deepgram] Utterance ended for ${socket.id}.`);
        
        if (deepgramConnection) {
            deepgramConnection.finish();
            deepgramConnection = null;
        }
        
        handleAnswerFinished();
    });
    
    return newDeepgramConnection;
  };

  const handleAnswerFinished = async () => {
    const state = getInterviewState();
    // Use the transcript accumulated during the utterance
    const finalAnswer = currentTranscript.trim();
    currentTranscript = ''; // Reset for next answer

    if (state.questionCount >= 5) {
        console.log(`[Interview] Ending interview for ${socket.id}`);
        socket.emit('interview-finished');
        interviewSessions.delete(socket.id);
        return;
    }

    const nextQuestion = await generateFollowUpQuestion(finalAnswer);
    setInterviewState({
        questionCount: state.questionCount + 1,
    });
    
    console.log(`[Interview] Sending question ${getInterviewState().questionCount} to ${socket.id}`);
    // Sending an object to be more flexible in the future
    socket.emit('new-question', { 
        question: nextQuestion, 
        questionNumber: getInterviewState().questionCount 
    });
  };

  // --- Socket Event Handlers ---
  socket.on('join-room', (applicationId) => {
    console.log(`[Socket] User ${socket.id} joined room for application: ${applicationId}`);
    interviewSessions.set(socket.id, { applicationId, questionCount: 0 });
  });

  socket.on('start-interview', async () => {
    console.log(`[Interview] Starting interview for ${socket.id}`);
    const state = getInterviewState();
    if (!state) return;
    
    const firstQuestion = await generateInitialQuestion(state.applicationId);
    setInterviewState({ questionCount: 1 });

    console.log(`[Interview] Sending question 1 to ${socket.id}`);
    socket.emit('new-question', { question: firstQuestion, questionNumber: 1 });
  });

  socket.on('audio-stream', (audioChunk) => {
    if (!deepgramConnection) {
      console.log(`[Audio] First audio chunk received. Creating Deepgram connection for ${socket.id}.`);
      deepgramConnection = setupDeepgram();
    }

    if (deepgramConnection && deepgramConnection.getReadyState() === 1) { // 1 = OPEN
      deepgramConnection.send(audioChunk);
    } else {
        console.log(`[Audio] Dropping chunk - connection for ${socket.id} not ready.`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
    if (deepgramConnection) {
      deepgramConnection.finish();
      deepgramConnection = null;
    }
    interviewSessions.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`IntelliVibe server listening on port ${PORT}`);
});