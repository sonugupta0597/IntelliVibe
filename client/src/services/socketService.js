// client/src/services/socketService.js
import { io } from 'socket.io-client';


const SOCKET_URL = 'http://localhost:5001';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.pendingEmits = [];
    }

    connect() {
        if (!this.socket || !this.socket.connected) {
            this.socket = io(SOCKET_URL, {
                autoConnect: false,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                transports: ['websocket', 'polling']
            });

            // Global socket event handlers
            this.socket.on('connect', () => {
                console.log('[Socket] Connected to server');
                this.isConnected = true;
                // Process any pending emits
                this.processPendingEmits();
            });

            this.socket.on('disconnect', (reason) => {
                console.log('[Socket] Disconnected:', reason);
                this.isConnected = false;
            });

            this.socket.on('connect_error', (error) => {
                console.error('[Socket] Connection error:', error.message);
                this.isConnected = false;
            });

            this.socket.on('reconnect', (attemptNumber) => {
                console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
                this.isConnected = true;
                this.processPendingEmits();
            });

            this.socket.on('reconnect_failed', () => {
                console.error('[Socket] Failed to reconnect');
                this.isConnected = false;
            });
        }

        this.socket.connect();
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.pendingEmits = [];
        }
    }

    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.log(`[Socket] Queuing emit for ${event} - not connected yet`);
            this.pendingEmits.push({ event, data });
        }
    }

    processPendingEmits() {
        while (this.pendingEmits.length > 0) {
            const { event, data } = this.pendingEmits.shift();
            console.log(`[Socket] Processing pending emit: ${event}`);
            this.socket.emit(event, data);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    // Interview-specific methods
    joinInterviewRoom(applicationId, callback) {
        this.emit('join-interview-room', applicationId, callback);
    }

    startInterview(applicationId) {
        this.emit('start-interview', applicationId);
    }

    sendAudioStream(audioData) {
        this.emit('audio-stream', audioData);
    }

    sendCandidateAnswer(data) {
        this.emit('candidate-answer-finished', data);
    }

    reportProctoringViolation(violation) {
        this.emit('proctoring-violation', violation);
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;