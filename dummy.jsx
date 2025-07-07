import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../services/socketService';

// Shadcn UI & Lucide Icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Mic, MicOff, Power, Loader2, Volume2, BrainCircuit, 
    AlertTriangle, Copy, TabletSmartphone, Users
} from 'lucide-react';

const VideoInterviewPage = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    
    // UI and Flow State
    const [uiState, setUiState] = useState('lobby'); // lobby, interview, completed
    const [flowState, setFlowState] = useState('AI_IDLE'); // AI_IDLE, AI_THINKING, AI_SPEAKING, CANDIDATE_LISTENING, CANDIDATE_SPEAKING
    const [conversation, setConversation] = useState([]);
    const [mediaReady, setMediaReady] = useState(false);
    const [currentAIQuestion, setCurrentAIQuestion] = useState('');
    const [streamError, setStreamError] = useState(null);
    const [interviewError, setInterviewError] = useState(null);
    
    // Media Refs
    const mediaRecorderRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioContextRef = useRef(null);
    const videoRef = useRef(null);
    const hiddenVideoRef = useRef(null);
    const audioChunksRef = useRef([]);
    const transcriptEndRef = useRef(null);
    
    // Proctoring State
    const [proctoringAlerts, setProctoringAlerts] = useState([]);
    
    // Refs for state inside socket listeners (this is a good pattern to avoid stale state)
    const flowStateRef = useRef(flowState);
    useEffect(() => { flowStateRef.current = flowState }, [flowState]);
    
    const conversationRef = useRef(conversation);
    useEffect(() => { conversationRef.current = conversation }, [conversation]);

    // Initialize media stream
    const initializeMediaStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 44100 }
            });
            
            mediaStreamRef.current = stream;
            
            if (hiddenVideoRef.current) hiddenVideoRef.current.srcObject = stream;
            
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            
            setMediaReady(true);
            setStreamError(null);
            console.log('[Media] Stream initialized successfully');
        } catch (error) {
            console.error('[Media] Failed to initialize stream:', error);
            setStreamError(error.message);
            if (error.name === 'NotAllowedError') {
                setInterviewError('Camera and microphone permissions were denied. Please allow access and refresh the page.');
            } else if (error.name === 'NotFoundError') {
                setInterviewError('No camera or microphone found. Please connect a device and refresh the page.');
            } else {
                setInterviewError(`Failed to access media devices: ${error.message}`);
            }
        }
    }, []);

    // Initialize media stream on component mount
    useEffect(() => {
        initializeMediaStream();
        
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => {
                    track.stop();
                    console.log(`[Media] Stopped track: ${track.kind}`);
                });
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [initializeMediaStream]);

    // Update video elements when stream is ready
    useEffect(() => {
        if (mediaStreamRef.current && videoRef.current) {
            videoRef.current.srcObject = mediaStreamRef.current;
        }
    }, [uiState, mediaReady]);
    
    // --- ENHANCEMENT: More reliable transcript scrolling ---
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]); // Scrolls whenever the conversation updates

    // Function to stop recording
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    // Function to start recording
    const startRecording = useCallback(() => {
        if (!mediaStreamRef.current) {
            console.error('[Recorder] No media stream available');
            return;
        }
        try {
            const audioStream = new MediaStream(mediaStreamRef.current.getAudioTracks());
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
            
            const recorder = new MediaRecorder(audioStream, { mimeType, audioBitsPerSecond: 128000 });
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                    socket.emit('audio-stream', event.data);
                }
            };
            recorder.onerror = (error) => console.error('[Recorder] MediaRecorder error:', error);
            recorder.onstart = () => console.log('[Recorder] Recording started');
            recorder.onstop = () => console.log('[Recorder] Recording stopped');

            recorder.start(100);
        } catch (error) {
            console.error('[Recorder] Failed to start recording:', error);
            setInterviewError('Failed to start audio recording. Please check your microphone permissions.');
        }
    }, []);

    // Proctoring Setup
    useEffect(() => {
        if (uiState !== 'interview') return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                const violation = { type: 'tab-unfocused', timestamp: new Date().toISOString(), applicationId };
                socket.emit('proctoring-violation', violation);
                setProctoringAlerts(prev => [...prev, { type: 'tab-unfocused', message: 'Tab switched', timestamp: new Date() }]);
            }
        };
        const handlePaste = () => {
            const violation = { type: 'paste-detected', timestamp: new Date().toISOString(), applicationId };
            socket.emit('proctoring-violation', violation);
            setProctoringAlerts(prev => [...prev, { type: 'paste-detected', message: 'Content pasted', timestamp: new Date() }]);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('paste', handlePaste);
        };
    }, [uiState, applicationId]);

    // Flow state management
    useEffect(() => {
        switch (flowState) {
            case 'CANDIDATE_SPEAKING': startRecording(); break;
            case 'AI_THINKING': stopRecording(); break;
            default: break;
        }
    }, [flowState, startRecording, stopRecording]);

    // --- PRIMARY FIX & RESTRUCTURED SOCKET LOGIC ---
    useEffect(() => {
        // Define all event handlers
        const handleAiQuestion = (data) => {
            const questionText = typeof data === 'string' ? data : data.questionText;
            setConversation(prev => [...prev, { speaker: 'AI', text: questionText, timestamp: new Date(), isFinal: true }]);
            setCurrentAIQuestion(questionText);
            setFlowState('CANDIDATE_LISTENING'); // Transition state after receiving question
        };

        const handleNewTranscript = (data) => {
            setConversation(prev => {
                const last = prev[prev.length - 1];
                if (last?.speaker === 'Candidate' && !last.isFinal) {
                    return [...prev.slice(0, -1), { ...last, text: data.text, isFinal: data.isFinal }];
                }
                return [...prev, { speaker: 'Candidate', text: data.text, isFinal: data.isFinal, timestamp: new Date() }];
            });
        };

        const handleUtteranceEnd = () => {
            console.log('[Socket] Utterance end received');
            if (flowStateRef.current === 'CANDIDATE_SPEAKING') {
                setFlowState('AI_THINKING');
                socket.emit('candidate-answer-finished', { applicationId, conversationHistory: conversationRef.current });
            }
        };

        const handleInterviewError = (error) => {
            console.error('[Socket] Interview error:', error);
            setInterviewError(error.message || 'An unknown error occurred during the interview.');
            setFlowState('AI_IDLE');
        };

        const handleInterviewComplete = (data) => {
            console.log('[Socket] Interview completed:', data);
            stopRecording();
            setUiState('completed');
            setTimeout(() => {
                // ENHANCEMENT: Use { replace: true } to prevent user from navigating back to the interview
                navigate(`/application/${applicationId}/complete`, { replace: true });
            }, 3000);
        };

        // This handler runs ONLY after a successful connection
        const onConnect = () => {
            console.log('[Socket] Connection successful, joining interview room.');
            socket.emit('join-interview-room', applicationId);
        };

        // Attach all event listeners
        socket.on('connect', onConnect);
        socket.on('ai-question', handleAiQuestion);
        socket.on('new-transcript', handleNewTranscript);
        socket.on('utterance-end', handleUtteranceEnd);
        socket.on('interview-error', handleInterviewError);
        socket.on('interview-complete', handleInterviewComplete);
        
        // Initiate the connection
        socket.connect();

        // Cleanup function runs on component unmount
        return () => {
            console.log('[Socket] Cleaning up component, disconnecting socket.');
            socket.off('connect', onConnect);
            socket.off('ai-question', handleAiQuestion);
            socket.off('new-transcript', handleNewTranscript);
            socket.off('utterance-end', handleUtteranceEnd);
            socket.off('interview-error', handleInterviewError);
            socket.off('interview-complete', handleInterviewComplete);
            
            stopRecording();
            socket.disconnect();
        };
    }, [applicationId, stopRecording, navigate]); // Dependencies for the effect

    const handleStartInterview = useCallback(() => {
        if (!mediaReady) return;
        setUiState('interview');
        setFlowState('AI_THINKING');
        // The server will send the first question upon receiving this event
        socket.emit('start-interview', { applicationId });
    }, [applicationId, mediaReady]);

    const getFlowStateDisplay = () => {
        switch (flowState) {
            case 'AI_THINKING': return { icon: BrainCircuit, text: 'Thinking...', color: 'text-amber-500' };
            case 'CANDIDATE_LISTENING': return { icon: MicOff, text: 'Listen', color: 'text-muted-foreground' };
            case 'CANDIDATE_SPEAKING': return { icon: Mic, text: 'Recording', color: 'text-destructive' };
            default: return { icon: null, text: '', color: '' };
        }
    };
    const flowStateDisplay = getFlowStateDisplay();

    // The rest of the JSX remains the same, with one small change for the transcript scrolling ref
    return (
        <div className="min-h-screen bg-background">
            <video ref={hiddenVideoRef} autoPlay playsInline muted style={{ display: 'none' }} />

            <AnimatePresence mode="wait">
                {uiState === 'lobby' && (
                    <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen flex items-center justify-center p-4">
                        <Card className="w-full max-w-2xl">
                            {/* ... Lobby JSX (unchanged) ... */}
                        </Card>
                    </motion.div>
                )}

                {uiState === 'interview' && (
                    <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen flex flex-col p-4 gap-4">
                        {/* ... Interview header and video panels JSX (unchanged) ... */}
                        
                        {/* Transcript Panel */}
                        <Card className="max-w-7xl mx-auto w-full h-64">
                            <CardHeader className="py-3 border-b">
                                <CardTitle className="text-base">Live Transcript</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[calc(100%-3.5rem)] overflow-y-auto p-4">
                            <div className="space-y-3">
                                    {conversation.map((entry, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-3 ${entry.speaker === 'AI' ? '' : 'flex-row-reverse'}`}
                                        >
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                {entry.speaker === 'AI' ? (
                                                    <>
                                                        <AvatarImage src="/ai-avatar.png" />
                                                        <AvatarFallback>AI</AvatarFallback>
                                                    </>
                                                ) : (
                                                    <AvatarFallback>You</AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div className={`flex-1 ${entry.speaker === 'AI' ? 'text-left' : 'text-right'}`}>
                                                <div className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                                                    entry.speaker === 'AI' 
                                                        ? 'bg-muted text-foreground' 
                                                        : 'bg-primary text-primary-foreground'
                                                }`}>
                                                    {entry.speaker === 'AI' && entry.questionNumber && (
                                                        <p className="text-xs opacity-70 mb-1">
                                                            Question {entry.questionNumber}
                                                        </p>
                                                    )}
                                                    <p className="text-sm whitespace-pre-wrap">{entry.text}</p>
                                                    {!entry.isFinal && (
                                                        <span className="inline-flex ml-2">
                                                            <span className="animate-pulse">●</span>
                                                            <span className="animate-pulse animation-delay-200">●</span>
                                                            <span className="animate-pulse animation-delay-400">●</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 px-2">
                                                    {entry.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={transcriptEndRef} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                 {/* COMPLETED VIEW */}
                 {uiState === 'completed' && (
                    <motion.div
                        key="completed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-screen flex items-center justify-center p-4"
                    >
                        <Card className="w-full max-w-md text-center">
                            <CardContent className="pt-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Power className="h-8 w-8 text-green-600" />
                                </div>
                                <CardTitle className="text-2xl mb-2">Interview Completed!</CardTitle>
                                <CardDescription className="text-base">
                                    Thank you for completing the interview. We'll review your responses and get back to you soon.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ... (Lobby, Interview, and Completed JSX sections omitted for brevity as they were correct)
// Just ensure the transcript mapping section ends with the <div ref={transcriptEndRef} /> as shown above.

export default VideoInterviewPage;