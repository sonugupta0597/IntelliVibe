// File: client/src/services/socketService.js

import { io } from 'socket.io-client';

const URL = "http://localhost:5001"; // Your backend server URL
const socket = io(URL, {
  autoConnect: false // We will connect manually when a component needs it
});

// Log all events for debugging purposes during development
socket.onAny((event, ...args) => {
  console.log(`[Socket.IO Event] ${event}`, args);
});

export default socket;