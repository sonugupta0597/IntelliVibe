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
    Mic, MicOff, Power, Loader2, BrainCircuit, 
    AlertTriangle, Send
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
            case 'AI_THINKING': return { icon: BrainCircuit, text: 'Thinking...', color: 'text-amber-500' };
            case 'CANDIDATE_SPEAKING': return { icon: Mic, text: 'Your Turn', color: 'text-green-600' };
            default: return { icon: null, text: '', color: '' };
        }
    };
    const flowStateDisplay = getFlowStateDisplay();

    return (
        <div className="min-h-screen bg-background">
            <video ref={hiddenVideoRef} autoPlay playsInline muted style={{ display: 'none' }} />
            <AnimatePresence mode="wait">
                {/* LOBBY VIEW */}
                {uiState === 'lobby' && (
                    <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen flex items-center justify-center p-4">
                        <Card className="w-full max-w-4xl">
                            <CardHeader className="text-center">
                                <CardTitle className="text-3xl">Video Interview Lobby</CardTitle>
                                <CardDescription>Please ensure your camera and microphone are working properly.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {interviewError && (<Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{interviewError}</AlertDescription></Alert>)}
                                
                                {/* Preview Section */}
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                                    <h2 className="text-xl font-bold text-center mb-6 text-white">Interview Preview</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* AI Bot Preview */}
                                        <div className="text-center space-y-4 bg-white rounded-lg p-6 shadow-sm border border-purple-200">
                                            <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">AI</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-purple-700">Your AI Interviewer</h3>
                                            <div className="w-40 h-40 mx-auto">
                                                <AIBotAvatar
                                                    isSpeaking={false}
                                                    isThinking={false}
                                                    className="w-full h-full"
                                                />
                                            </div>
                                            <p className="text-sm text-white">
                                                Meet your AI interviewer who will guide you through the questions with animated expressions and real-time feedback.
                                            </p>
                                        </div>
                                        
                                        {/* Camera Preview */}
                                        <div className="text-center space-y-4 bg-white rounded-lg p-6 shadow-sm border border-green-200">
                                            <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">You</span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-green-700">Your Camera</h3>
                                            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative border-2 border-green-200">
                                    {mediaReady ? (
                                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {streamError ? (
                                                            <div className="text-center p-4">
                                                                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                                                                <p className="text-destructive font-medium mb-2">Media Error</p>
                                                                <p className="text-sm text-white">{streamError}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <Loader2 className="h-8 w-8 animate-spin text-pink-100 mx-auto mb-2" />
                                                                <p className="text-sm text-white">Initializing camera...</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-white">
                                                Ensure your camera and microphone are working properly for the best interview experience.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {/* Status Indicators */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <h3 className="text-sm font-semibold text-white mb-3 text-center">System Status</h3>
                                        <div className="flex items-center justify-center gap-8 text-sm">
                                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${mediaReady ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700'}`}>
                                                <div className={`w-3 h-3 rounded-full ${mediaReady ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                Camera {mediaReady ? 'Ready' : 'Initializing...'}
                                            </div>
                                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${mediaReady ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700'}`}>
                                                <div className={`w-3 h-3 rounded-full ${mediaReady ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                Microphone {mediaReady ? 'Ready' : 'Initializing...'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">i</span>
                                            </div>
                                            <p className="font-semibold text-blue-800">Interview Guidelines</p>
                                        </div>
                                        <ul className="space-y-2 text-sm text-blue-700">
                                            <li className="flex items-start gap-2">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                                <span>The AI interviewer will ask you technical and behavioral questions</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                                <span>When it's your turn to answer, a green "I'm Done Answering" button will appear</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                                <span>Click the button when you've finished your response to proceed to the next question</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                                <span>Speak clearly and take your time to provide thoughtful answers</span>
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
                                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg' 
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            {mediaReady ? (
                                                <>
                                                    <Power className="mr-2 h-5 w-5" /> 
                                                    Start AI Interview
                                                </>
                                            ) : (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
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
                    <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen flex flex-col p-4 gap-4">
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl mx-auto w-full">
                            <Card className="flex flex-col">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">AI</span>
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">AI Interviewer</CardTitle>
                                                <CardDescription>Powered by Google Gemini</CardDescription>
                                            </div>
                                        </div>
                                        {flowStateDisplay.icon && (
                                            <Badge variant="secondary">
                                                <flowStateDisplay.icon className="mr-1 h-3 w-3" />
                                                {flowStateDisplay.text}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
                                    {/* AI Bot Avatar */}
                                    <div className="w-48 h-48 mb-6">
                                        <AIBotAvatar
                                            isSpeaking={flowState === 'CANDIDATE_SPEAKING' && currentAIQuestion}
                                            isThinking={flowState === 'AI_THINKING'}
                                            question={currentAIQuestion}
                                            className="w-full h-full"
                                        />
                                    </div>
                                    
                                    {/* Question Display */}
                                    <div className="w-full max-w-lg text-center space-y-4">
                                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 backdrop-blur rounded-lg p-6 min-h-[120px] flex items-center justify-center border border-purple-200">
                                            <p className="text-lg leading-relaxed text-white">
                                                {currentAIQuestion || 'Preparing your interview...'}
                                            </p>
                                        </div>
                                        {flowState === 'AI_THINKING' && (
                                            <div className="flex items-center justify-center gap-2 text-sm text-white">
                                                <BrainCircuit className="h-4 w-4 animate-spin" />
                                                Analyzing...
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="flex flex-col">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">You</span>
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Your Camera</CardTitle>
                                                <CardDescription>Candidate View</CardDescription>
                                            </div>
                                        </div>
                                        {flowStateDisplay.icon && (
                                            <Badge 
                                                variant={flowState === 'CANDIDATE_SPEAKING' ? 'secondary' : 'default'} 
                                                className={flowState === 'CANDIDATE_SPEAKING' ? 'border-green-600 text-green-600 animate-pulse' : ''}
                                            >
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
                                            className="w-full h-full object-cover rounded-b-lg" 
                                            style={{ transform: 'scaleX(-1)' }} 
                                        />
                                        
                                        {/* Recording indicator */}
                                        {flowState === 'CANDIDATE_SPEAKING' && (
                                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                Recording
                                            </div>
                                        )}
                                        
                                        {/* Answer button */}
                                    {flowState === 'CANDIDATE_SPEAKING' && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                                <Button 
                                                    size="lg" 
                                                    onClick={handleDoneSpeaking}
                                                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                                                >
                                                <Send className="mr-2 h-4 w-4" />
                                                I'm Done Answering
                                            </Button>
                                        </div>
                                    )}
                                        
                                        {/* Status overlay */}
                                        {!mediaReady && (
                                            <div className="absolute inset-0 bg-black/50 rounded-b-lg flex items-center justify-center">
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
                        <Card className="max-w-7xl mx-auto w-full h-64">
                            <CardHeader className="py-3 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <CardTitle className="text-base">Live Transcript</CardTitle>
                                    <Badge variant="outline" className="text-xs">Real-time</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="h-[calc(100%-3.5rem)] overflow-y-auto p-4 bg-gray-50">
                                <div className="space-y-3">
                                    {conversation.map((entry, index) => (
                                        <motion.div 
                                            key={index} 
                                            initial={{ opacity: 0, y: 10 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-3 ${entry.speaker === 'AI' ? '' : 'flex-row-reverse'}`}
                                        >
                                            <div className="h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {entry.speaker === 'AI' ? (
                                                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                                        AI
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                                        You
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`flex-1 ${entry.speaker === 'AI' ? 'text-left' : 'text-right'}`}>
                                                <div className={`inline-block px-4 py-2 rounded-lg max-w-[80%] shadow-sm ${
                                                    entry.speaker === 'AI' 
                                                        ? 'bg-white border border-purple-200 text-white' 
                                                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
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
                                                <p className="text-xs text-white mt-1 px-2">
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
                    <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen flex items-center justify-center p-4">
                        <Card className="w-full max-w-md text-center"><CardContent className="pt-6"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Power className="h-8 w-8 text-green-600" /></div><CardTitle className="text-2xl mb-2">Interview Completed!</CardTitle><CardDescription className="text-base">Thank you. Your simulated interview is complete.</CardDescription></CardContent></Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VideoInterviewPage;