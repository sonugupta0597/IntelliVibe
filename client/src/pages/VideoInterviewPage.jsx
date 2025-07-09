// src/components/VideoInterviewPage.jsx (FIXED with MIME Type checker and extensive logging)

import React, { useState, useEffect, useRef, Component } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

// Error Boundary Component
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-xl text-center">
                        <h1 className="text-2xl font-bold mb-4 text-red-600">Something went wrong</h1>
                        <p className="text-gray-600 mb-4">There was an error in the interview interface.</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// --- Helper Functions ---
/**
 * Finds the first supported MIME type from a list of candidates.
 * @returns {string|null} The supported MIME type or null if none are found.
 */
const findSupportedMimeType = () => {
  const mimeTypes = [
    'audio/webm',
    'audio/webm;codecs=opus',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  return null;
};


// --- UI Components (No changes needed, included for completeness) ---
const Lobby = ({ onStartInterview, localStream, isCameraReady }) => (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-xl text-center">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Interview Lobby</h1>
      <p className="text-gray-600 mb-6">Check your audio and video before you begin.</p>
      <div className="w-full aspect-video bg-gray-900 rounded-md mb-6 overflow-hidden">
        {isCameraReady ? <VideoPlayer stream={localStream} muted={true} /> : <div className="w-full h-full flex items-center justify-center"><p className="text-white">Waiting for camera permissions...</p></div>}
      </div>
      <button onClick={onStartInterview} disabled={!isCameraReady} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300">Start Interview</button>
    </div>
);
const InterviewScreen = ({ localStream, currentQuestion, questionNumber, liveTranscript, onEndAnswer }) => (

    
    
    <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-xl">
        {console.log("liveTranscript" + liveTranscript)}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-blue-800">Question {questionNumber}</span>
                    <span className="text-sm text-blue-600">|</span>
                    <span className="text-sm text-blue-800">Live Interview</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-700">Recording Active</span>
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1">
                <h3 className="font-semibold text-lg mb-2 text-gray-700">Your Camera</h3>
                <div className="w-full aspect-square bg-gray-900 rounded-md overflow-hidden">
                    <VideoPlayer stream={localStream} muted={true} />
                </div>
                <div className="mt-2 text-center">
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Recording
                    </div>
                </div>
                {/* Debug Info */}
                <div className="mt-4 p-3 bg-yellow-50 rounded border text-xs">
                    <h4 className="font-semibold text-yellow-800 mb-1">Debug Info:</h4>
                    <p className="text-yellow-700">Transcript: "{liveTranscript || 'None'}"</p>
                    <p className="text-yellow-700">Length: {liveTranscript ? liveTranscript.length : 0}</p>
                </div>
            </div>
            <div className="col-span-2 flex flex-col">
                <div className="flex-grow p-4 bg-gray-50 rounded-md mb-4">
                    <h3 className="font-semibold text-lg mb-2 text-blue-800">Question {questionNumber}:</h3>
                    <p className="text-xl text-gray-800 min-h-[60px]">{currentQuestion || "Waiting for the first question..."}</p>
                </div>
                <div className="flex-grow p-4 bg-gray-50 rounded-md mb-4">
                    <h3 className="font-semibold text-lg mb-2 text-green-800 flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Live Transcript:
                    </h3>
                    <div className="min-h-[60px] p-3 bg-white rounded border-2 border-green-200">
                        {liveTranscript ? (
                            <p className="text-lg text-gray-800 font-medium leading-relaxed">
                                "{liveTranscript}"
                            </p>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex items-center text-gray-400">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></div>
                                    Listening... Speak clearly into your microphone
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-center space-x-4">
                    <button 
                        onClick={onEndAnswer}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                        End Answer
                    </button>
                    <div className="text-sm text-gray-500 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                        Speech recognition active
                    </div>
                </div>
            </div>
        </div>
    </div>
);
const ThankYouScreen = () => (<div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-xl text-center"><h1 className="text-3xl font-bold mb-4 text-gray-800">Thank You!</h1><p className="text-gray-600">Your interview is complete. We appreciate your time and will be in touch with the next steps.</p></div>);
const VideoPlayer = ({ stream, muted }) => {
    const videoRef = useRef(null);
    useEffect(() => { if (stream && videoRef.current) videoRef.current.srcObject = stream; }, [stream]);
    return <video ref={videoRef} autoPlay muted={muted} className="w-full h-full object-cover" />;
};

// --- Main Page Component ---
const VideoInterviewPage = () => {
    const { applicationId } = useParams();
    const [interviewState, setInterviewState] = useState('Lobby');
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [questionNumber, setQuestionNumber] = useState(0);
    const [liveTranscript, setLiveTranscript] = useState('');
    const transcriptBufferRef = useRef('');
    
    // Debug effect to track liveTranscript changes
    useEffect(() => {
        console.log('[Debug] liveTranscript state changed:', liveTranscript);
    }, [liveTranscript]);
    const [isCameraReady, setIsCameraReady] = useState(false);

    const socketRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const localStreamRef = useRef(null);
    const supportedMimeType = useRef(null);

    // ---- EFFECT 1: Initialize Camera and check for MIME type support ----
    useEffect(() => {
        async function setup() {
            console.log("[Setup] Requesting media devices...");
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        sampleRate: 16000,
                        channelCount: 1
                    }
                });
                localStreamRef.current = stream;
                setIsCameraReady(true);
                console.log("[Setup] Media stream acquired.", stream);
                
                supportedMimeType.current = findSupportedMimeType();
                if (!supportedMimeType.current) {
                    alert("Your browser does not support the required audio formats for recording. Please try a different browser like Chrome or Firefox.");
                    return;
                }
                console.log(`[Setup] Found supported MIME type: ${supportedMimeType.current}`);

            } catch (error) {
                console.error("[Setup] Error accessing media devices.", error);
                alert("Camera and microphone access is required. Please refresh and grant permissions.");
            }
        }
        setup();
    }, []);

    // ---- EFFECT 2: Manage Socket.IO Connection ----
    useEffect(() => {
        const serverUrl = 'http://localhost:5001';
        socketRef.current = io(serverUrl);
        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('[Socket] ==> Connected to server with ID:', socket.id);
            socket.emit('join-room', applicationId);
        });

        socket.on('new-question', (data) => {
            const { question, questionNumber } = data;
            console.log(`[Socket] <== Received question #${questionNumber}: "${question}"`);
            setCurrentQuestion(question);
            setQuestionNumber(questionNumber);
            setLiveTranscript('');
            transcriptBufferRef.current = '';
            console.log("question" + question);
            console.log("[Flow] New question received. Attempting to start recording...");
            // Add a small delay to ensure socket connection is ready
            setTimeout(() => {
                startRecording();
            }, 100);
        });

        socket.on('live-transcript', (transcript) => {
            console.log(`[Socket] <== Live transcript received: "${transcript}"`);
            setLiveTranscript(transcript);
            // Accumulate transcript for the current question
            if (transcript && transcript.trim()) {
                transcriptBufferRef.current += transcript + ' ';
            }
        });

        socket.on('final-transcript', (finalTranscript) => {
            // Optionally handle final transcript event
            setLiveTranscript(finalTranscript);
            transcriptBufferRef.current = finalTranscript;
        });

        socket.on('interview-finished', () => {
            console.log('[Socket] <== Interview finished by server.');
            stopRecording();
            setInterviewState('Finished');
        });

        socket.on('error', (errorMessage) => {
            console.error('[Socket] <== Server error:', errorMessage);
            alert(`Error: ${errorMessage}`);
        });

        socket.on('disconnect', () => console.log('[Socket] ==> Disconnected from server.'));

        return () => {
            console.log('[Cleanup] Component unmounting. Disconnecting socket and stopping media.');
            if (socket) socket.disconnect();
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
            stopRecording();
        };
    }, [applicationId]);

    // ---- Media Recorder Logic ----
    const startRecording = () => {
        if (!localStreamRef.current) {
            console.error("[Recorder] Cannot start recording: Media stream is not available.");
            return;
        }

        stopRecording(); // Ensure any previous recorder is stopped

        try {
            // Create a new MediaStream with only audio tracks
            const audioTracks = localStreamRef.current.getAudioTracks();
            if (audioTracks.length === 0) {
                console.error("[Recorder] No audio tracks found in the stream.");
                return;
            }

            const audioStream = new MediaStream(audioTracks);

            // Use the first supported MIME type
            const mimeType = findSupportedMimeType();
            if (!mimeType) {
                alert("Your browser does not support the required audio formats for recording. Please try a different browser like Chrome or Firefox.");
                return;
            }
            mediaRecorderRef.current = new MediaRecorder(audioStream, {
                mimeType,
                audioBitsPerSecond: 16000,
                audioChannels: 1
            });
            console.log(`[Recorder] Using format: ${mimeType}`);

            console.log(`[Recorder] MediaRecorder created with settings:`, {
                audioBitsPerSecond: 16000,
                audioTracks: audioStream.getAudioTracks().length,
                mimeType: mediaRecorderRef.current.mimeType
            });

            // Start streaming to backend
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('start-audio-stream');
            }

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0 && socketRef.current && socketRef.current.connected) {
                    event.data.arrayBuffer().then(buffer => {
                        socketRef.current.emit('audio-chunk', buffer);
                    });
                }
            };

            mediaRecorderRef.current.onerror = (error) => {
                console.error("[Recorder] MediaRecorder error:", error);
            };

            mediaRecorderRef.current.onstart = () => {
                console.log("[Recorder] MediaRecorder started successfully.");
            };

            mediaRecorderRef.current.onstop = () => {
                console.log("[Recorder] MediaRecorder stopped.");
                if (socketRef.current && socketRef.current.connected) {
                    socketRef.current.emit('end-audio-stream');
                }
            };

            mediaRecorderRef.current.start(250); // Send chunks every 250ms

        } catch (error) {
            console.error("[Recorder] CRITICAL: Failed to execute 'start' on 'MediaRecorder'.", error);
            alert("There was a critical error starting the audio recorder. Please check browser permissions or try another browser.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            console.log("[Recorder] Stopping MediaRecorder.");
            mediaRecorderRef.current.stop();
        }
    };

    const handleStartInterview = () => {
        if (socketRef.current.connected) {
            console.log('[Socket] ==> Emitting start-interview.');
            socketRef.current.emit('start-interview');
            setInterviewState('Interviewing');
        } else {
            console.error("Cannot start interview: Socket not connected.");
        }
    };

    const handleEndAnswer = () => {
        console.log('[Interview] User manually ended answer.');
        stopRecording();
        // Submit the full transcript for this question
        if (socketRef.current.connected) {
            socketRef.current.emit('end-answer', { transcript: transcriptBufferRef.current.trim() });
        }
    };

    const renderContent = () => {
        switch (interviewState) {
            case 'Interviewing': return <InterviewScreen localStream={localStreamRef.current} currentQuestion={currentQuestion} questionNumber={questionNumber} liveTranscript={liveTranscript} onEndAnswer={handleEndAnswer} />;
            case 'Finished': return <ThankYouScreen />;
            default: return <Lobby onStartInterview={handleStartInterview} localStream={localStreamRef.current} isCameraReady={isCameraReady} />;
        }
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                {renderContent()}
            </div>
        </ErrorBoundary>
    );
};

export default VideoInterviewPage;