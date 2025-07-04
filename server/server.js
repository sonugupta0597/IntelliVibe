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

const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
// Initialize Express App
const app = express();

// --- Core Middleware ---
app.use(cors());
app.use(express.json());

connectDB();

// --- API Route Handlers ---
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/auth', authRoutes);

const { generateInitialQuestion } = require('./services/videoAiService');


const server = http.createServer(app);

// 2. Attach Socket.IO to that HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});


io.on('connection', (socket) => {
  console.log(`✅ [Socket.IO] A user has connected! Socket ID: ${socket.id}`);

socket.on('join-interview-room', (applicationId, callback) => {
    try {
      console.log(`[Socket.IO] User ${socket.id} is joining room for application ${applicationId}`);
      socket.join(applicationId); // This action is synchronous
  
      // Immediately call the callback to acknowledge success
      if (callback) {
        callback({
          success: true,
          message: `Successfully joined room ${applicationId}`
        });
      }
    } catch (error) {
      console.error(`[Socket.IO] Error joining room for ${socket.id}:`, error);
      if (callback) {
        callback({
          success: false,
          message: 'Failed to join interview room.'
        });
      }
    }
  });
  
  // 2. Add the new event handler for starting the interview
  socket.on('start-interview', async (applicationId) => {
    try {
        console.log(`[Interview] Received start request for application: ${applicationId}`);
        // Find the application and populate job details
        const application = await Application.findById(applicationId).populate('job');
        if (!application) {
            socket.emit('interview-error', 'Application not found.');
            return;
        }

        // Parse the resume to get the text
        const resumePath = path.join(__dirname, application.resumeUrl); 
        console.log(`[Interview] Attempting to read resume from path: ${resumePath}`); // Add this log for debugging

        const dataBuffer = await fs.readFile(resumePath);
        const pdfData = await pdfParse(dataBuffer);
        const resumeText = pdfData.text;

        // Generate the first question using our new service
        const firstQuestion = await generateInitialQuestion(application.job, resumeText);
        
        console.log(`[Interview] First question generated: "${firstQuestion}"`);

        // Send the question back to the client in the specific room
        io.to(applicationId).emit('ai-question', {
            questionText: firstQuestion,
            questionNumber: 1
        });

    } catch (error) {
        console.error(`[Interview] Error starting interview for ${applicationId}:`, error);
        socket.emit('interview-error', 'There was an error starting your interview. Please try again later.');
    }
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`❌ [Socket.IO] User disconnected: ${socket.id}. Reason: ${reason}`);
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log('--- SERVER IS RUNNING ---');
  console.log(`🚀 REST API & WebSocket Server listening on http://localhost:${PORT}`);
  console.log('-------------------------');
});