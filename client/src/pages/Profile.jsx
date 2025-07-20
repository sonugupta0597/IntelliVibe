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
    Mic, MicOff, Play, Loader2, Brain, 
    AlertTriangle, Send, CheckCircle, Video, Bot, User
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
        const updatedConversation = [...conversationRef.current, { speaker: 'Candidate', text: "(Response completed)", isFinal: true, timestamp: new Date() }];
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
        };
    }, [applicationId, navigate]);

    const handleStartInterview = useCallback(() => {
        if (!mediaReady) return;
        setUiState('interview');
        setFlowState('AI_THINKING');
        socket.emit('start-interview', applicationId);
    }, [applicationId, mediaReady]);

    const getFlowStateDisplay = () => {
        switch (flowState) {
            case 'AI_THINKING': return { icon: Brain, text: 'Processing...', color: 'text-blue-600' };
            case 'CANDIDATE_SPEAKING': return { icon: Mic, text: 'Your Turn', color: 'text-green-600' };
            default: return { icon: null, text: '', color: '' };
        }
    };
    const flowStateDisplay = getFlowStateDisplay();

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <video ref={hiddenVideoRef} autoPlay playsInline muted style={{ display: 'none' }} />
            <AnimatePresence mode="wait">
                {/* LOBBY VIEW */}
                {uiState === 'lobby' && (
                    <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen flex items-center justify-center">
                        <Card className="w-full bg-white shadow-lg border-gray-200">
                            <CardHeader className="text-center pb-6">
                                <div className="flex justify-center mb-4">
                                    <div className="bg-blue-100 p-4 rounded-full">
                                        <Bot className="h-8 w-8 text-blue-600" />
                                    </div>
                                </div>
                                <CardTitle className="text-3xl font-bold text-gray-900">AI Interview Session</CardTitle>
                                <CardDescription className="text-gray-600 text-lg">
                                    Prepare for your AI-powered interview experience
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 max-h-[400px] overflow-y-auto">
                                {interviewError && (
                                    <Alert className="border-red-200 bg-red-50">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                        <AlertDescription className="text-red-700">{interviewError}</AlertDescription>
                                    </Alert>
                                )}
                                
                                {/* Preview Section */}
                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                    <h2 className="text-xl font-bold text-center mb-6 text-gray-900">Interview Setup</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* AI Bot Preview */}
                                        <div className="text-center space-y-4 bg-white rounded-lg p-6 shadow-sm border border-blue-200">
                                            <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center">
                                                <Bot className="h-8 w-8 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-blue-900">AI Interviewer</h3>
                                            <div className="w-40 h-40 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                                                <AIBotAvatar
                                                    isSpeaking={false}
                                                    isThinking={false}
                                                    className="w-full h-full"
                                                />
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Your AI interviewer will guide you through personalized questions with real-time feedback and analysis.
                                            </p>
                                        </div>
                                        
                                        {/* Camera Preview */}
                                        <div className="text-center space-y-4 bg-white rounded-lg p-6 shadow-sm border border-green-200">
                                            <div className="w-16 h-16 mx-auto mb-2 bg-green-600 rounded-full flex items-center justify-center">
                                                <User className="h-8 w-8 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-green-900">Your Camera</h3>
                                            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative border-2 border-green-200">
                                                {mediaReady ? (
                                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        {streamError ? (
                                                            <div className="text-center p-4">
                                                                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                                                <p className="text-red-500 font-medium mb-2">Camera Error</p>
                                                                <p className="text-sm text-gray-300">{streamError}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                                                                <p className="text-sm text-gray-300">Initializing camera...</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Ensure your camera and microphone are working properly for optimal interview quality.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Indicators */}
                                <div className="bg-white rounded-lg p-6 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">System Status</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={`flex items-center gap-3 p-4 rounded-lg border ${mediaReady ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                            <div className={`w-4 h-4 rounded-full ${mediaReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                            <span className={`font-medium ${mediaReady ? 'text-green-800' : 'text-yellow-800'}`}>
                                                Camera {mediaReady ? 'Ready' : 'Initializing...'}
                                            </span>
                                        </div>
                                        <div className={`flex items-center gap-3 p-4 rounded-lg border ${mediaReady ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                            <div className={`w-4 h-4 rounded-full ${mediaReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                            <span className={`font-medium ${mediaReady ? 'text-green-800' : 'text-yellow-800'}`}>
                                                Microphone {mediaReady ? 'Ready' : 'Initializing...'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Interview Guidelines */}
                                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">i</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-blue-900">Interview Guidelines</h3>
                                    </div>
                                    <ul className="space-y-3 text-sm text-blue-800">
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <span>The AI interviewer will ask personalized technical and behavioral questions</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <span>Click "Complete Answer" when you've finished responding to proceed</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <span>Take your time to provide thoughtful, detailed responses</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <span>Speak clearly and maintain good eye contact with the camera</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex justify-center">
                                    <Button 
                                        size="lg" 
                                        onClick={handleStartInterview} 
                                        disabled={!mediaReady} 
                                        className={`min-w-[250px] h-12 text-lg font-semibold ${
                                            mediaReady 
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {mediaReady ? (
                                            <>
                                                <Play className="mr-2 h-5 w-5" /> 
                                                Begin AI Interview
                                            </>
                                        ) : (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                                                Preparing...
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* INTERVIEW VIEW */}
                {uiState === 'interview' && (
                    <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen flex flex-col gap-6">
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 mx-auto w-full">
                            {/* AI Interviewer Section */}
                            <Card className="flex flex-col bg-white shadow-lg border-gray-200">
                                <CardHeader className="pb-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                                                <Bot className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg text-gray-900">AI Interviewer</CardTitle>
                                                <CardDescription className="text-gray-600">Powered by Advanced AI</CardDescription>
                                            </div>
                                        </div>
                                        {flowStateDisplay.icon && (
                                            <Badge className={`${flowState === 'AI_THINKING' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                <flowStateDisplay.icon className="mr-1 h-3 w-3" />
                                                {flowStateDisplay.text}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
                                    {/* AI Bot Avatar */}
                                    <div className="w-48 h-48 mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <AIBotAvatar
                                            isSpeaking={flowState === 'CANDIDATE_SPEAKING' && currentAIQuestion}
                                            isThinking={flowState === 'AI_THINKING'}
                                            question={currentAIQuestion}
                                            className="w-full h-full"
                                        />
                                    </div>
                                    
                                    {/* Question Display */}
                                    <div className="w-full max-w-lg text-center space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 min-h-[120px] flex items-center justify-center">
                                            <p className="text-lg leading-relaxed text-blue-900">
                                                {currentAIQuestion || 'Preparing your personalized interview questions...'}
                                            </p>
                                        </div>
                                        {flowState === 'AI_THINKING' && (
                                            <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                                                <Brain className="h-4 w-4 animate-pulse" />
                                                Analyzing your previous response...
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Candidate Video Section */}
                            <Card className="flex flex-col bg-white shadow-lg border-gray-200">
                                <CardHeader className="pb-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                                                <User className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg text-gray-900">Your Video</CardTitle>
                                                <CardDescription className="text-gray-600">Candidate Response</CardDescription>
                                            </div>
                                        </div>
                                        {flowStateDisplay.icon && (
                                            <Badge className={`${flowState === 'CANDIDATE_SPEAKING' ? 'bg-green-100 text-green-800 animate-pulse' : 'bg-blue-100 text-blue-800'}`}>
                                                <flowStateDisplay.icon className="mr-1 h-3 w-3" />
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
                                            className="w-full h-full object-cover" 
                                            style={{ transform: 'scaleX(-1)' }} 
                                        />
                                        
                                        {/* Recording indicator */}
                                        {flowState === 'CANDIDATE_SPEAKING' && (
                                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                Recording
                                            </div>
                                        )}
                                        
                                        {/* Answer completion button */}
                                        {flowState === 'CANDIDATE_SPEAKING' && (
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                                <Button 
                                                    size="lg" 
                                                    onClick={handleDoneSpeaking}
                                                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg font-medium"
                                                >
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Complete Answer
                                                </Button>
                                            </div>
                                        )}
                                        
                                        {/* Status overlay */}
                                        {!mediaReady && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <div className="text-center text-white">
                                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                                    <p>Initializing camera...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Live Transcript Section */}
                        <Card className="max-w-7xl mx-auto w-full h-64 bg-white shadow-lg border-gray-200">
                            <CardHeader className="py-3 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <CardTitle className="text-base text-gray-900">Interview Conversation</CardTitle>
                                    <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">Real-time</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="h-[calc(100%-3.5rem)] overflow-y-auto p-4">
                                <div className="space-y-4">
                                    {conversation.map((entry, index) => (
                                        <motion.div 
                                            key={index} 
                                            initial={{ opacity: 0, y: 10 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-3 ${entry.speaker === 'AI' ? '' : 'flex-row-reverse'}`}
                                        >
                                            <div className="h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {entry.speaker === 'AI' ? (
                                                    <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center">
                                                        <Bot className="h-4 w-4" />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full bg-green-600 rounded-full flex items-center justify-center">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`flex-1 ${entry.speaker === 'AI' ? 'text-left' : 'text-right'}`}>
                                                <div className={`inline-block px-4 py-3 rounded-lg max-w-[80%] shadow-sm ${
                                                    entry.speaker === 'AI' 
                                                        ? 'bg-blue-50 border border-blue-200 text-blue-900' 
                                                        : 'bg-green-600 text-white'
                                                }`}>
                                                    {entry.speaker === 'AI' && entry.questionNumber && (
                                                        <p className="text-xs opacity-70 mb-1 font-medium">
                                                            Question {entry.questionNumber}
                                                        </p>
                                                    )}
                                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                                        {entry.text}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 px-2">
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
                    <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen flex items-center justify-center">
                        <Card className="w-full max-w-md text-center bg-white shadow-lg border-gray-200">
                            <CardContent className="pt-8 pb-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <CardTitle className="text-2xl mb-4 text-gray-900">Interview Complete!</CardTitle>
                                <CardDescription className="text-base text-gray-600">
                                    Thank you for completing the AI interview. Your responses have been recorded and will be analyzed shortly.
                                </CardDescription>
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        You will receive feedback and next steps via email within 24 hours.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VideoInterviewPage;