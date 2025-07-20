// src/components/VideoInterviewPage.jsx (Modern Professional Design)

import React, { useState, useEffect, useRef, Component } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { 
    Video, 
    Mic, 
    MicOff, 
    VideoOff, 
    Play, 
    Square, 
    AlertCircle, 
    CheckCircle, 
    Clock, 
    Loader2,
    Brain,
    Sparkles,
    Eye,
    Zap,
    MessageSquare,
    Settings,
    Volume2,
    VolumeX
} from 'lucide-react';
import AIBotAvatar from '@/components/AIBotAvatar';

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
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl mx-auto p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 text-center">
                        <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-100 to-red-100 rounded-2xl mx-auto mb-6">
                            <AlertCircle className="h-10 w-10 text-rose-600" />
                        </div>
                        <h1 className="text-3xl font-bold mb-4 text-slate-900">Interview System Error</h1>
                        <p className="text-slate-600 mb-8 text-lg leading-relaxed">There was an error in the interview interface. Please try refreshing the page.</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            Reload Interview
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

// --- UI Components ---
const Lobby = ({ onStartInterview, localStream, isCameraReady, isSocketReady }) => (
    <div className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-50 to-white p-8 border-b border-slate-100">
            <div className="text-center">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 shadow-lg">
                    <Video className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Interview Preparation
                </h1>
                <p className="text-slate-600 text-xl leading-relaxed max-w-2xl mx-auto">
                    Please check your camera and microphone setup before beginning the AI-powered interview session.
                </p>
            </div>
        </div>

        <div className="p-8">
            {/* Camera Preview */}
            <div className="bg-gradient-to-br from-slate-900 to-black rounded-2xl overflow-hidden mb-8 aspect-video shadow-2xl border border-slate-200">
                {isCameraReady ? (
                    <VideoPlayer stream={localStream} muted={true} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="relative mb-4">
                                <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-400" />
                                <div className="absolute inset-0 h-12 w-12 border-4 border-purple-500/30 border-t-purple-400 rounded-full mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                            </div>
                            <p className="text-lg font-medium">Waiting for camera permissions...</p>
                            <p className="text-sm text-slate-400 mt-2">Please allow access to continue</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                    isCameraReady 
                        ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg shadow-emerald-100' 
                        : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-lg shadow-amber-100'
                }`}>
                    <div className="flex items-center justify-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                            isCameraReady ? 'bg-emerald-100' : 'bg-amber-100'
                        }`}>
                            {isCameraReady ? (
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            ) : (
                                <Clock className="h-6 w-6 text-amber-600" />
                            )}
                        </div>
                        <div>
                            <span className={`font-bold text-lg ${isCameraReady ? 'text-emerald-800' : 'text-amber-800'}`}>
                                Camera {isCameraReady ? 'Ready' : 'Connecting...'}
                            </span>
                            <p className={`text-sm ${isCameraReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {isCameraReady ? 'Video feed active' : 'Requesting permissions...'}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                    isSocketReady 
                        ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg shadow-emerald-100' 
                        : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-lg shadow-amber-100'
                }`}>
                    <div className="flex items-center justify-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                            isSocketReady ? 'bg-emerald-100' : 'bg-amber-100'
                        }`}>
                            {isSocketReady ? (
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            ) : (
                                <Clock className="h-6 w-6 text-amber-600" />
                            )}
                        </div>
                        <div>
                            <span className={`font-bold text-lg ${isSocketReady ? 'text-emerald-800' : 'text-amber-800'}`}>
                                Connection {isSocketReady ? 'Ready' : 'Connecting...'}
                            </span>
                            <p className={`text-sm ${isSocketReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {isSocketReady ? 'Server connected' : 'Establishing connection...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
                <button 
                    onClick={onStartInterview} 
                    disabled={!isCameraReady || !isSocketReady} 
                    className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 flex items-center gap-3 mx-auto"
                >
                    {isSocketReady ? (
                        <>
                            <Play className="h-6 w-6" />
                            Begin AI Interview
                        </>
                    ) : (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Connecting...
                        </>
                    )}
                </button>
                
                {isCameraReady && isSocketReady && (
                    <p className="text-slate-500 text-sm mt-4">
                        Click to start your AI-powered interview session
                    </p>
                )}
            </div>
        </div>
    </div>
);

const InterviewScreen = ({ localStream, currentQuestion, questionNumber, liveTranscript, onToggleAnswer, onSkipBotVoice, isRecording, isBotSpeaking }) => (
    <div className="w-full max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-50 to-white p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                        <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Question {questionNumber}</h2>
                        <p className="text-slate-600 font-medium">AI-Powered Interview Session</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-full ${
                        isRecording 
                            ? 'bg-gradient-to-r from-rose-100 to-red-100 border border-rose-200' 
                            : 'bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300'
                    }`}>
                        <div className={`w-3 h-3 rounded-full animate-pulse ${isRecording ? 'bg-rose-500' : 'bg-slate-400'}`}></div>
                        <span className={`text-sm font-bold ${isRecording ? 'text-rose-700' : 'text-slate-600'}`}>
                            {isRecording ? 'Recording' : 'Not Recording'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-8">
            <div className="grid grid-cols-12 gap-8">
                {/* Video Feed */}
                <div className="col-span-4 space-y-6">
                    <div>
                        <h3 className="font-bold text-xl mb-4 text-slate-900 flex items-center gap-2">
                            <Eye className="h-5 w-5 text-blue-600" />
                            Your Video
                        </h3>
                        <div className="bg-gradient-to-br from-slate-900 to-black rounded-2xl overflow-hidden aspect-square shadow-2xl border border-slate-200">
                            <VideoPlayer stream={localStream} muted={true} />
                        </div>
                        <div className="mt-4 text-center">
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                                isRecording 
                                    ? 'bg-gradient-to-r from-rose-100 to-red-100 text-rose-800 border border-rose-200' 
                                    : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 border border-slate-300'
                            }`}> 
                                <div className={`w-2 h-2 rounded-full mr-3 animate-pulse ${isRecording ? 'bg-rose-500' : 'bg-slate-400'}`}></div>
                                {isRecording ? 'Recording Active' : 'Recording Inactive'}
                            </div>
                        </div>
                    </div>

                    {/* Session Info */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200">
                        <h4 className="font-bold mb-3 text-sm text-slate-700 flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Session Info
                        </h4>
                        <div className="text-xs text-slate-600 space-y-2">
                            <div className="bg-white rounded-lg p-3">
                                <p><span className="font-semibold">Transcript:</span> "{liveTranscript || 'None'}"</p>
                                <p><span className="font-semibold">Length:</span> {liveTranscript ? liveTranscript.length : 0} characters</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interview Content */}
                <div className="col-span-8 space-y-8">
                    {/* Bot Avatar */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <AIBotAvatar isSpeaking={isBotSpeaking} question={currentQuestion} className="w-32 h-32" />
                            {isBotSpeaking && (
                                <div className="absolute -bottom-2 -right-2 flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg">
                                    <Volume2 className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Question Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 shadow-lg shadow-blue-100">
                        <h3 className="font-bold text-xl mb-4 text-blue-900 flex items-center gap-2">
                            <MessageSquare className="h-6 w-6" />
                            Current Question
                        </h3>
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
                            <p className="text-xl text-blue-800 leading-relaxed font-medium">
                                {currentQuestion || "Waiting for the first question..."}
                            </p>
                        </div>
                    </div>

                    {/* Live Transcript Section */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-8 shadow-lg shadow-emerald-100">
                        <h3 className="font-bold text-xl mb-4 text-emerald-900 flex items-center gap-2">
                            <Mic className="h-6 w-6" />
                            Live Transcript
                        </h3>
                        <div className="bg-white/60 backdrop-blur-sm border border-emerald-200 rounded-xl p-6 min-h-[120px]">
                            {liveTranscript ? (
                                <p className="text-lg text-slate-800 leading-relaxed">
                                    "{liveTranscript}"
                                </p>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-xl mx-auto mb-4">
                                            <Mic className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <p className="font-medium">Listening for your response...</p>
                                        <p className="text-sm text-slate-400 mt-1">Please speak clearly into your microphone</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between gap-4">
                        <button 
                            onClick={onSkipBotVoice}
                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl transition-all duration-300 font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <VolumeX className="h-5 w-5" />
                            Skip Bot Voice
                        </button>
                        
                        <button 
                            onClick={onToggleAnswer}
                            className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                                isRecording 
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' 
                                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                            }`}
                        >
                            {isRecording ? (
                                <>
                                    <Square className="h-6 w-6" />
                                    End Answer
                                </>
                            ) : (
                                <>
                                    <Play className="h-6 w-6" />
                                    Start Answer
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ThankYouScreen = () => (
    <div className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 text-center border-b border-emerald-100">
            <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mx-auto mb-8 shadow-xl">
                <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                Interview Complete!
            </h1>
            <p className="text-slate-600 text-xl leading-relaxed max-w-2xl mx-auto">
                Thank you for completing the AI-powered interview. We appreciate your time and will review your responses shortly.
            </p>
        </div>
        
        <div className="p-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-6">
                    <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4">What's Next?</h3>
                <p className="text-blue-800 font-medium leading-relaxed">
                    You will receive updates on your application status via email within the next few business days. 
                    Our AI will analyze your responses and provide detailed feedback to the hiring team.
                </p>
            </div>
        </div>
    </div>
);

const VideoPlayer = ({ stream, muted }) => {
    const videoRef = useRef(null);
    useEffect(() => { 
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
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
    const [isSocketReady, setIsSocketReady] = useState(false);
    
    // Debug effect to track liveTranscript changes
    useEffect(() => {
        console.log('[Debug] liveTranscript state changed:', liveTranscript);
    }, [liveTranscript]);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    // In VideoInterviewPage, add state to track if TTS is speaking
    const [isBotSpeaking, setIsBotSpeaking] = useState(false);

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

        socket.on('session-ready', () => {
            console.log('[Socket] <== Session is ready.');
            setIsSocketReady(true);
        });

        socket.on('new-question', (data) => {
            const { question, questionNumber } = data;
            console.log(`[Socket] <== Received question #${questionNumber}: "${question}"`);
            setCurrentQuestion(question);
            setQuestionNumber(questionNumber);
            setLiveTranscript('');
            transcriptBufferRef.current = '';
            // --- TTS: Speak the question aloud ---
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel(); // Stop any ongoing speech
                const utter = new window.SpeechSynthesisUtterance(question);
                utter.lang = 'en-US';
                utter.rate = 1;
                utter.pitch = 1;
                utter.onstart = () => setIsBotSpeaking(true);
                utter.onend = () => setIsBotSpeaking(false);
                window.speechSynthesis.speak(utter);
            } else {
                setIsBotSpeaking(false);
            }
            console.log("question" + question);
            console.log("[Flow] New question received. Waiting for user to start recording...");
            // Removed automatic startRecording here
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

        socket.on('error', (errorData) => {
            console.error('[Socket] <== Server error:', errorData);
            alert(`An error occurred: ${errorData.message}`);
        });

        socket.on('disconnect', () => console.log('[Socket] ==> Disconnected from server.'));

        return () => {
            console.log('[Cleanup] Component unmounting. Disconnecting socket and stopping media.');
            if (socket) socket.disconnect();
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
            stopRecording();
            // --- TTS: Stop any ongoing speech on unmount ---
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
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

    const handleToggleAnswer = () => {
        if (!isRecording) {
            setIsRecording(true);
            startRecording();
        } else {
            setIsRecording(false);
        stopRecording();
        // Submit the full transcript for this question
        if (socketRef.current.connected) {
            socketRef.current.emit('end-answer', { transcript: transcriptBufferRef.current.trim() });
        }
        }
    };

    const handleSkipBotVoice = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsBotSpeaking(false);
    };

    const renderContent = () => {
        switch (interviewState) {
            case 'Interviewing': 
                return <InterviewScreen 
                    localStream={localStreamRef.current} 
                    currentQuestion={currentQuestion} 
                    questionNumber={questionNumber} 
                    liveTranscript={liveTranscript} 
                    onToggleAnswer={handleToggleAnswer}
                    onSkipBotVoice={handleSkipBotVoice}
                    isRecording={isRecording}
                    isBotSpeaking={isBotSpeaking}
                />;
            case 'Finished': 
                return <ThankYouScreen />;
            default: 
                return <Lobby 
                    onStartInterview={handleStartInterview} 
                    localStream={localStreamRef.current} 
                    isCameraReady={isCameraReady} 
                    isSocketReady={isSocketReady} 
                />;
        }
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                
                <div className="relative flex items-center justify-center p-6 md:p-10 min-h-screen">
                    {renderContent()}
                </div>
            </div>
            
            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </ErrorBoundary>
    );
};

export default VideoInterviewPage;