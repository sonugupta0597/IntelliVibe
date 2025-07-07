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
const { createClient } = require('@deepgram/sdk');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
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

const PORT = process.env.PORT || 5001;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

console.log(`[Server] Starting with PORT: ${PORT}`);
console.log(`[Server] Deepgram API Key: ${DEEPGRAM_API_KEY ? 'Present (length: ' + DEEPGRAM_API_KEY.length + ')' : 'MISSING'}`);

if (!DEEPGRAM_API_KEY) {
  console.error("FATAL ERROR: DEEPGRAM_API_KEY is not set in the environment.");
  process.exit(1);
}

const deepgram = createClient(DEEPGRAM_API_KEY);

// Test Deepgram API key
const testDeepgramConnection = async () => {
    try {
        console.log(`[Deepgram] Testing API key...`);
        // Try to create a simple connection to test the API key
        const testConnection = deepgram.listen.live({
            punctuate: true,
            smart_format: true,
            model: 'nova-2',
            interim_results: false
        });
        
        testConnection.on('open', () => {
            console.log(`[Deepgram] ✅ API key is valid - test connection opened`);
            testConnection.finish();
        });
        
        testConnection.on('error', (error) => {
            console.error(`[Deepgram] ❌ API key test failed:`, error);
        });
        
        // Close test connection after 3 seconds
        setTimeout(() => {
            try {
                testConnection.finish();
            } catch (e) {
                // Ignore errors when closing test connection
            }
        }, 3000);
        
    } catch (error) {
        console.error(`[Deepgram] ❌ Error testing API key:`, error);
    }
};

// Run the test when server starts
testDeepgramConnection();

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
  let deepgramConnection;
  let fullTranscript = '';

  const getInterviewState = () => interviewSessions.get(socket.id);
  const setInterviewState = (newState) => interviewSessions.set(socket.id, { ...getInterviewState(), ...newState });

  const setupDeepgram = () => {
    console.log(`[Deepgram] Setting up connection for ${socket.id} with API key: ${DEEPGRAM_API_KEY ? 'Present' : 'Missing'}`);
    
    try {
        const newDeepgramConnection = deepgram.listen.live({
            punctuate: true,
            smart_format: true,
            interim_results: true,
            endpointing: true,
            utterance_end_ms: 1000
        });

        console.log(`[Deepgram] Connection object created for ${socket.id}, readyState: ${newDeepgramConnection.getReadyState()}`);

        // Add a timeout to check connection status
        const connectionTimeout = setTimeout(() => {
            const readyState = newDeepgramConnection.getReadyState();
            console.log(`[Deepgram] Connection status after 5s for ${socket.id}: ${readyState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`);
            if (readyState === 0) {
                console.log(`[Deepgram] Connection still connecting for ${socket.id}, this might indicate an API key issue`);
                // Force close the connection if it's stuck
                try {
                    newDeepgramConnection.finish();
                } catch (e) {
                    console.error(`[Deepgram] Error closing stuck connection:`, e);
                }
            }
        }, 5000);

        newDeepgramConnection.on('open', () => {
            console.log(`[Deepgram] Connection opened for ${socket.id}`);
            clearTimeout(connectionTimeout);
            
            // Add a small delay before sending pending chunks to ensure connection is stable
            setTimeout(() => {
                // Send any pending chunks that were queued while connecting
                if (newDeepgramConnection.pendingChunks && newDeepgramConnection.pendingChunks.length > 0) {
                    console.log(`[Deepgram] Sending ${newDeepgramConnection.pendingChunks.length} pending chunks for ${socket.id}`);
                    newDeepgramConnection.pendingChunks.forEach((chunk, index) => {
                        if (chunk instanceof ArrayBuffer) {
                            console.log(`[Deepgram] Sending pending chunk ${index + 1}/${newDeepgramConnection.pendingChunks.length}, size: ${chunk.byteLength}`);
                            newDeepgramConnection.send(chunk);
                        } else {
                            console.error(`[Deepgram] Invalid chunk type in pending chunks: ${typeof chunk}`);
                        }
                    });
                    newDeepgramConnection.pendingChunks = [];
                }
            }, 100);
        });

        newDeepgramConnection.on('close', (e) => {
            console.log(`[Deepgram] Connection closed for ${socket.id}.`, e);
            clearTimeout(connectionTimeout);
            deepgramConnection = null; // Important: nullify the dead socket
        });

        newDeepgramConnection.on('error', (error) => {
            console.error(`[Deepgram] Error for ${socket.id}:`, error);
            clearTimeout(connectionTimeout);
        });

        // Robust transcript event logging
        newDeepgramConnection.on('transcript', (data) => {
            console.log(`[Deepgram] Raw transcript data for ${socket.id}:`, data);
            if (data.channel && data.channel.alternatives && data.channel.alternatives[0]) {
                const transcript = data.channel.alternatives[0].transcript;
                if (transcript && transcript.trim()) {
                    console.log(`[Deepgram] Transcript for ${socket.id}: "${transcript}" (final: ${data.is_final})`);
                    socket.emit('live-transcript', transcript);
                } else {
                    console.log(`[Deepgram] Empty transcript received for ${socket.id}`);
                }
            } else {
                console.log(`[Deepgram] No transcript data in response for ${socket.id}:`, data);
            }
        });

        // Add a timeout to check if we're getting any response from Deepgram
        setTimeout(() => {
            console.log(`[Deepgram] No transcript events received for ${socket.id} after 10 seconds. Checking connection...`);
            const readyState = newDeepgramConnection.getReadyState();
            console.log(`[Deepgram] Connection state for ${socket.id}: ${readyState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`);
        }, 10000);
        
        return newDeepgramConnection;
    } catch (error) {
        console.error(`[Deepgram] Error creating connection for ${socket.id}:`, error);
        return null;
    }
  };

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

  socket.on('audio-stream', (audioChunk) => {
    // ** LAZY CONNECTION TO DEEPGRAM **
    // This is the solution to the timeout problem. We only connect to Deepgram
    // when we have audio to send, preventing idle connection timeouts.
    if (!deepgramConnection) {
      console.log(`[Audio] First audio chunk received. Creating Deepgram connection for ${socket.id}.`);
      deepgramConnection = setupDeepgram();
    }

    // Convert Blob to ArrayBuffer for Deepgram
    const processAudioChunk = async (chunk) => {
      try {
        console.log(`[Audio] Processing chunk type: ${typeof chunk}, size: ${chunk.size || chunk.byteLength || 'unknown'}`);
        
        // If it's already an ArrayBuffer, use it directly
        if (chunk instanceof ArrayBuffer) {
          console.log(`[Audio] Using ArrayBuffer directly, size: ${chunk.byteLength}`);
          return chunk;
        }
        
        // Handle Uint8Array (common when Socket.IO serializes binary data)
        if (chunk instanceof Uint8Array) {
          console.log(`[Audio] Using Uint8Array directly, size: ${chunk.byteLength}`);
          return chunk.buffer;
        }
        
        // Handle Socket.IO serialized objects (fallback)
        if (typeof chunk === 'object' && chunk.type && chunk.data) {
          console.log(`[Audio] Converting serialized Blob to ArrayBuffer, type: ${chunk.type}`);
          // Convert base64 data to ArrayBuffer
          const binaryString = atob(chunk.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          console.log(`[Audio] Converted serialized Blob to ArrayBuffer, size: ${bytes.byteLength}`);
          return bytes.buffer;
        }
        
        console.error(`[Audio] Unknown audio chunk type: ${typeof chunk}`, chunk);
        return null;
      } catch (error) {
        console.error(`[Audio] Error processing audio chunk:`, error);
        return null;
      }
    };

    // Process the audio chunk
    processAudioChunk(audioChunk).then(processedChunk => {
      if (!processedChunk) return;

      // Wait for connection to be ready before sending audio
      if (deepgramConnection) {
        const readyState = deepgramConnection.getReadyState();
        if (readyState === 1) { // 1 = OPEN
          console.log(`[Deepgram] Sending real-time audio chunk, size: ${processedChunk.byteLength}`);
          // Send the raw audio data directly
          deepgramConnection.send(processedChunk);
        } else if (readyState === 0) { // 0 = CONNECTING
          // Queue the audio chunk for when connection is ready
          console.log(`[Audio] Connection not ready yet (state: ${readyState}), queuing chunk for ${socket.id}`);
          // Store the chunk temporarily and send it when connection opens
          if (!deepgramConnection.pendingChunks) {
            deepgramConnection.pendingChunks = [];
          }
          deepgramConnection.pendingChunks.push(processedChunk);
        } else {
          console.log(`[Audio] Dropping chunk - connection for ${socket.id} not ready (state: ${readyState}).`);
        }
      } else {
          console.log(`[Audio] Dropping chunk - connection for ${socket.id} not ready (state: ${deepgramConnection?.getReadyState()}).`);
      }
    });
  });


  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
    if (deepgramConnection) {
      deepgramConnection.finish();
      deepgramConnection = null;
    }
    interviewSessions.delete(socket.id); // Clean up the session
  });
});

server.listen(PORT, () => {
  console.log(`IntelliVibe server listening on port ${PORT}`);
});