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
    Mic, 
    MicOff, 
    Power, 
    Loader2, 
    BrainCircuit, 
    AlertTriangle, 
    Send,
    Video,
    Eye,
    MessageSquare,
    Sparkles,
    Bot,
    User,
    Clock,
    CheckCircle,
    Zap,
    Brain
} from 'lucide-react';
import AIBotAvatar from '@/components/AIBotAvatar';

const VideoInterviewPage = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    
    // UI and Flow State
    const [uiState, setUiState] = useState('lobby'); // lobby, interview, completed
    const [flowState, setFlowState] = useState('AI_IDLE'); // AI_IDLE, AI_THINKING, CANDIDATE_SPEAKING
    const [conversation, setConversation] = useState([]);
    const [mediaReady, setMediaReady] = useState(false);
    const [currentAIQuestion, setCurrentAIQuestion] = useState('');
    const [streamError, setStreamError] = useState(null);
    const [interviewError, setInterviewError] = useState(null);
    
    // Refs
    const videoRef = useRef(null);
    const hiddenVideoRef = useRef(null);
    const transcriptEndRef = useRef(null);
    const mediaStreamRef = useRef(null);
    
    const conversationRef = useRef(conversation);
    useEffect(() => { conversationRef.current = conversation }, [conversation]);

    const initializeMediaStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                audio: true // Still need audio permission for later
            });
            mediaStreamRef.current = stream;
            if (hiddenVideoRef.current) hiddenVideoRef.current.srcObject = stream;
            setMediaReady(true);
        } catch (error) {
            console.error('[Media] Failed to initialize stream:', error);
            setStreamError(error.message);
            if (error.name === 'NotAllowedError') setInterviewError('Camera/Mic permissions were denied. Please allow access and refresh.');
            else if (error.name === 'NotFoundError') setInterviewError('No camera/mic found. Please connect a device and refresh.');
            else setInterviewError(`Media device error: ${error.message}`);
        }
    }, []);

    useEffect(() => {
        initializeMediaStream();
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [initializeMediaStream]);

    useEffect(() => {
        if (mediaReady && videoRef.current) {
            if (videoRef.current.srcObject !== mediaStreamRef.current) {
                videoRef.current.srcObject = mediaStreamRef.current;
            }
        }
    }, [mediaReady, uiState]); // This ensures video attaches on UI change
    
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);
    
    const handleDoneSpeaking = () => {
        console.log("[Test] Manually finishing answer.");
        setFlowState('AI_THINKING');
        const updatedConversation = [...conversationRef.current, { speaker: 'Candidate', text: "(User has finished speaking)", isFinal: true, timestamp: new Date() }];
        setConversation(updatedConversation);
        socket.emit('candidate-answer-finished', { applicationId, conversationHistory: updatedConversation });
    };

    useEffect(() => {
        const handleNewQuestion = (data) => {
            const questionText = typeof data === 'string' ? data : data.questionText;
            const questionNumber = conversationRef.current.filter(c => c.speaker === 'AI').length + 1;
            setCurrentAIQuestion(questionText);
            setConversation(prev => [...prev, { speaker: 'AI', text: questionText, questionNumber, timestamp: new Date(), isFinal: true }]);
            setFlowState('CANDIDATE_SPEAKING');
            // --- TTS: Speak the question aloud ---
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel(); // Stop any ongoing speech
                const utter = new window.SpeechSynthesisUtterance(questionText);
                utter.lang = 'en-US';
                utter.rate = 1;
                utter.pitch = 1;
                window.speechSynthesis.speak(utter);
            }
        };
        const handleInterviewError = (error) => { setInterviewError(error.message || 'An error occurred.'); };
        const handleInterviewComplete = () => { setUiState('completed'); setTimeout(() => navigate(`/application/${applicationId}/complete`, { replace: true }), 3000); };
        const onConnect = () => socket.emit('join-interview-room', applicationId);
        
        socket.connect();
        socket.on('connect', onConnect);
        socket.on('ai-question', handleNewQuestion);
        socket.on('follow-up-question', handleNewQuestion);
        socket.on('interview-error', handleInterviewError);
        socket.on('interview-complete', handleInterviewComplete);

        return () => {
            socket.off('connect', onConnect);
            socket.off('ai-question', handleNewQuestion);
            socket.off('follow-up-question', handleNewQuestion);
            socket.off('interview-error', handleInterviewError);
            socket.off('interview-complete', handleInterviewComplete);
            socket.disconnect();
            // --- TTS: Stop any ongoing speech on unmount ---
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [applicationId, navigate]);

    useEffect(() => {
        if (uiState === 'completed' && mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
    }, [uiState]);

    const handleStartInterview = useCallback(() => {
        if (!mediaReady) return;
        setUiState('interview');
        setFlowState('AI_THINKING');
        socket.emit('start-interview', applicationId);
    }, [applicationId, mediaReady]);

    const getFlowStateDisplay = () => {
        switch (flowState) {
            case 'AI_THINKING': return { icon: BrainCircuit, text: 'AI Thinking...', color: 'text-amber-500' };
            case 'CANDIDATE_SPEAKING': return { icon: Mic, text: 'Your Turn', color: 'text-green-600' };
            default: return { icon: null, text: '', color: '' };
        }
    };
    const flowStateDisplay = getFlowStateDisplay();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            
            <div className="relative p-6 md:p-10">
                <video ref={hiddenVideoRef} autoPlay playsInline muted style={{ display: 'none' }} />
                <AnimatePresence mode="wait">
                    {/* LOBBY VIEW */}
                    {uiState === 'lobby' && (
                        <motion.div 
                            key="lobby" 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="min-h-screen flex items-center justify-center"
                        >
                            <Card className="w-full max-w-6xl bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                                <CardHeader className="text-center bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 py-12">
                                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 shadow-lg">
                                        <Video className="h-10 w-10 text-white" />
                                    </div>
                                    <CardTitle className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
                                        Video Interview Lobby
                                    </CardTitle>
                                    <CardDescription className="text-xl text-slate-600 max-w-2xl mx-auto">
                                        Please ensure your camera and microphone are working properly before starting your AI-powered interview.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-12 space-y-8">
                                    {interviewError && (
                                        <Alert className="border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl">
                                            <AlertTriangle className="h-5 w-5 text-rose-600" />
                                            <AlertDescription className="text-rose-700 font-medium">{interviewError}</AlertDescription>
                                        </Alert>
                                    )}
                                    
                                    {/* Preview Section */}
                                    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border border-purple-200 shadow-lg">
                                        <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">Interview Preview</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* AI Bot Preview */}
                                            <div className="text-center space-y-6 bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-purple-200">
                                                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                                                    <Bot className="h-8 w-8 text-white" />
                                                </div>
                                                <h3 className="text-xl font-bold text-purple-700">Your AI Interviewer</h3>
                                                <div className="w-40 h-40 mx-auto">
                                                    <AIBotAvatar
                                                        isSpeaking={false}
                                                        isThinking={false}
                                                        className="w-full h-full"
                                                    />
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                    Meet your AI interviewer powered by advanced technology who will guide you through questions with animated expressions and real-time feedback.
                                                </p>
                                            </div>
                                            
                                            {/* Camera Preview */}
                                            <div className="text-center space-y-6 bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-emerald-200">
                                                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl shadow-lg">
                                                    <User className="h-8 w-8 text-white" />
                                                </div>
                                                <h3 className="text-xl font-bold text-emerald-700">Your Camera</h3>
                                                <div className="aspect-video bg-gradient-to-br from-slate-900 to-black rounded-2xl overflow-hidden relative border-2 border-emerald-200 shadow-lg">
                                                    {mediaReady ? (
                                                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            {streamError ? (
                                                                <div className="text-center p-6">
                                                                    <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                                                                    <p className="text-rose-500 font-semibold mb-2">Media Error</p>
                                                                    <p className="text-sm text-slate-400">{streamError}</p>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center">
                                                                    <div className="relative mb-4">
                                                                        <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto" />
                                                                        <div className="absolute inset-0 h-12 w-12 border-4 border-purple-500/30 border-t-purple-400 rounded-full mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                                                    </div>
                                                                    <p className="text-sm text-slate-300 font-medium">Initializing camera...</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                    Ensure your camera and microphone are working properly for the best interview experience.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Status Indicators */}
                                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
                                            <h3 className="text-lg font-bold text-slate-800 mb-6 text-center flex items-center justify-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                System Status
                                            </h3>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className={`p-4 rounded-xl border transition-all duration-300 ${
                                                    mediaReady 
                                                        ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' 
                                                        : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                                                }`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${mediaReady ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                                                        <span className={`font-bold ${mediaReady ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                            Camera {mediaReady ? 'Ready' : 'Initializing...'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`p-4 rounded-xl border transition-all duration-300 ${
                                                    mediaReady 
                                                        ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' 
                                                        : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                                                }`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${mediaReady ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                                                        <span className={`font-bold ${mediaReady ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                            Microphone {mediaReady ? 'Ready' : 'Initializing...'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Guidelines */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-xl">
                                                    <Sparkles className="h-4 w-4 text-white" />
                                                </div>
                                                <h3 className="text-xl font-bold text-blue-800">Interview Guidelines</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                    <span className="text-blue-700 font-medium">The AI interviewer will ask you technical and behavioral questions</span>
                                                </div>
                                                <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                    <span className="text-blue-700 font-medium">When it's your turn to answer, a green "I'm Done Answering" button will appear</span>
                                                </div>
                                                <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                    <span className="text-blue-700 font-medium">Click the button when you've finished your response to proceed</span>
                                                </div>
                                                <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                    <span className="text-blue-700 font-medium">Speak clearly and take your time to provide thoughtful answers</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Start Button */}
                                        <div className="text-center">
                                            <Button 
                                                size="lg" 
                                                onClick={handleStartInterview} 
                                                disabled={!mediaReady} 
                                                className={`px-12 py-4 text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl ${
                                                    mediaReady 
                                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                                                        : 'bg-slate-300 text-slate-500 cursor-not-allowed transform-none hover:scale-100'
                                                }`}
                                            >
                                                {mediaReady ? (
                                                    <>
                                                        <Power className="mr-3 h-6 w-6" /> 
                                                        Start AI Interview
                                                    </>
                                                ) : (
                                                    <>
                                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" /> 
                                                        Preparing...
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* INTERVIEW VIEW */}
                    {uiState === 'interview' && (
                        <motion.div 
                            key="interview" 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="min-h-screen flex flex-col gap-6"
                        >
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto w-full">
                                {/* AI Interviewer Card */}
                                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl flex flex-col">
                                    <CardHeader className="border-b border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
                                                    <Brain className="h-7 w-7 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl font-bold text-slate-900">AI Interviewer</CardTitle>
                                                    <CardDescription className="text-slate-600 font-medium">Powered by Google Gemini</CardDescription>
                                                </div>
                                            </div>
                                            {flowStateDisplay.icon && (
                                                <Badge className={`px-4 py-2 rounded-full font-semibold ${
                                                    flowState === 'AI_THINKING' 
                                                        ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200' 
                                                        : 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200'
                                                }`}>
                                                    <flowStateDisplay.icon className="mr-2 h-4 w-4" />
                                                    {flowStateDisplay.text}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
                                        {/* AI Bot Avatar */}
                                        <div className="w-52 h-52 mb-8">
                                            <AIBotAvatar
                                                isSpeaking={flowState === 'CANDIDATE_SPEAKING' && currentAIQuestion}
                                                isThinking={flowState === 'AI_THINKING'}
                                                question={currentAIQuestion}
                                                className="w-full h-full"
                                            />
                                        </div>
                                        
                                        {/* Question Display */}
                                        <div className="w-full max-w-lg text-center space-y-6">
                                            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 backdrop-blur-sm rounded-2xl p-8 min-h-[150px] flex items-center justify-center border border-purple-200 shadow-lg">
                                                <p className="text-lg leading-relaxed text-slate-800 font-medium">
                                                    {currentAIQuestion || 'Preparing your interview...'}
                                                </p>
                                            </div>
                                            {flowState === 'AI_THINKING' && (
                                                <div className="flex items-center justify-center gap-3 text-amber-600">
                                                    <BrainCircuit className="h-5 w-5 animate-spin" />
                                                    <span className="font-semibold">Analyzing your response...</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Candidate Video Card */}
                                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl flex flex-col">
                                    <CardHeader className="border-b border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
                                                    <Eye className="h-7 w-7 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl font-bold text-slate-900">Your Camera</CardTitle>
                                                    <CardDescription className="text-slate-600 font-medium">Candidate View</CardDescription>
                                                </div>
                                            </div>
                                            {flowStateDisplay.icon && (
                                                <Badge className={`px-4 py-2 rounded-full font-semibold ${
                                                    flowState === 'CANDIDATE_SPEAKING' 
                                                        ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200 animate-pulse' 
                                                        : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 border-slate-300'
                                                }`}>
                                                    <flowStateDisplay.icon className="mr-2 h-4 w-4" />
                                                    {flowStateDisplay.text}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0 flex-1 relative">
                                        <div className="relative w-full h-full">
                                            <video 
                                                ref={videoRef} 
                                                autoPlay 
                                                playsInline 
                                                muted 
                                                className="w-full h-full object-cover rounded-b-2xl" 
                                                style={{ transform: 'scaleX(-1)' }} 
                                            />
                                            
                                            {/* Recording indicator */}
                                            {flowState === 'CANDIDATE_SPEAKING' && (
                                                <div className="absolute top-6 right-6 flex items-center gap-3 bg-gradient-to-r from-rose-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                    Recording
                                                </div>
                                            )}
                                            
                                            {/* Answer button */}
                                            {flowState === 'CANDIDATE_SPEAKING' && (
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                                                    <Button 
                                                        size="lg" 
                                                        onClick={handleDoneSpeaking}
                                                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                                                    >
                                                        <Send className="mr-3 h-5 w-5" />
                                                        I'm Done Answering
                                                    </Button>
                                                </div>
                                            )}
                                            
                                            {/* Status overlay */}
                                            {!mediaReady && (
                                                <div className="absolute inset-0 bg-black/50 rounded-b-2xl flex items-center justify-center">
                                                    <div className="text-center text-white">
                                                        <div className="relative mb-4">
                                                            <Loader2 className="h-12 w-12 animate-spin mx-auto" />
                                                            <div className="absolute inset-0 h-12 w-12 border-4 border-purple-500/30 border-t-purple-400 rounded-full mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                                        </div>
                                                        <p className="font-semibold">Initializing camera...</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Live Transcript Card */}
                            <Card className="max-w-7xl mx-auto w-full h-80 bg-white/80 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
                                <CardHeader className="py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded-lg">
                                            <MessageSquare className="h-4 w-4 text-white" />
                                        </div>
                                        <CardTitle className="text-lg font-bold text-slate-900">Live Transcript</CardTitle>
                                        <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200 font-semibold">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                                            Real-time
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="h-[calc(100%-4rem)] overflow-y-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100">
                                    <div className="space-y-4">
                                        {conversation.map((entry, index) => (
                                            <motion.div 
                                                key={index} 
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex gap-4 ${entry.speaker === 'AI' ? '' : 'flex-row-reverse'}`}
                                            >
                                                <div className="h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                                    {entry.speaker === 'AI' ? (
                                                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                                                            AI
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                                                            You
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`flex-1 ${entry.speaker === 'AI' ? 'text-left' : 'text-right'}`}>
                                                    <div className={`inline-block px-6 py-4 rounded-2xl max-w-[80%] shadow-lg ${
                                                        entry.speaker === 'AI' 
                                                            ? 'bg-white/80 backdrop-blur-sm border border-purple-200 text-slate-700' 
                                                            : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                                                    }`}>
                                                        {entry.speaker === 'AI' && entry.questionNumber && (
                                                            <p className="text-xs font-bold mb-2 text-purple-600">
                                                                Question {entry.questionNumber}
                                                            </p>
                                                        )}
                                                        <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                                                            {entry.text}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2 px-2">
                                                        <Clock className="h-3 w-3 text-slate-400" />
                                                        <p className="text-xs text-slate-500 font-medium">
                                                            {entry.timestamp.toLocaleTimeString()}
                                                        </p>
                                                    </div>
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
                            className="min-h-screen flex items-center justify-center"
                        >
                            <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl text-center overflow-hidden">
                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8">
                                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mx-auto mb-6 shadow-xl">
                                        <CheckCircle className="h-10 w-10 text-white" />
                                    </div>
                                    <CardTitle className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                                        Interview Completed!
                                    </CardTitle>
                                    <CardDescription className="text-lg text-slate-600 leading-relaxed">
                                        Thank you for completing your AI interview. Your responses have been recorded and will be analyzed.
                                    </CardDescription>
                                </div>
                                <div className="p-8">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                        <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                                        <p className="text-blue-800 font-medium">
                                            You will receive feedback and next steps via email within 24 hours.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
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
        </div>
    );
};

export default VideoInterviewPage;