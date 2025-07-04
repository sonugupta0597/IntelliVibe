import React, { useEffect, useState, useRef } from 'react'; // Added useRef
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../services/socketService';
// Shadcn UI & Lucide Icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertCircle, Mic, Video, Wifi, UserCheck, Power, Loader2, 
    MessageSquareQuote, Volume2, MicOff
} from 'lucide-react'; // Added MicOff

const VideoInterviewPage = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    
    // State Management
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [interviewState, setInterviewState] = useState('lobby'); // lobby, loading, in_progress, finished, error
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [error, setError] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState([]);
    const [isRoomJoined, setIsRoomJoined] = useState(false); 
    
    // useRef for MediaRecorder
    const mediaRecorderRef = useRef(null);

    // --- Audio Setup & Control ---
    const setupMicrophone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0 && socket.connected) {
                    socket.emit('audio-stream', event.data);
                }
            };
            
            mediaRecorderRef.current = recorder;
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Microphone access was denied. Please allow microphone access in your browser settings and refresh the page.");
            setInterviewState('error');
        }
    };
    
    const startListening = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
            mediaRecorderRef.current.start(500); // Start recording, slicing data every 500ms
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    };
    
    // --- Interview Flow Control ---
    const handleStartInterview = () => {
        setInterviewState('loading');
        socket.emit('start-interview', applicationId);
    };

    // --- Main useEffect for Socket Listeners ---
    useEffect(() => {
        setupMicrophone();
        socket.connect();

        const onConnect = () => setIsConnected(true);
        socket.emit('join-interview-room', applicationId, (response) => {
            if (response.success) {
                console.log(`[Socket Client] Successfully joined room. Server says: "${response.message}"`);
                setIsRoomJoined(true); // <--- Enable the start button!
            } else {
                console.error(`[Socket Client] Failed to join room. Server says: "${response.message}"`);
                setError("Could not establish a secure connection for the interview.");
                setInterviewState('error');
            }
        });
      
        const onDisconnect = () => setIsConnected(false);

        console.log(`[Socket Client] Connected! Emitting 'join-interview-room' with ID: ${applicationId}`);
        const onAiQuestion = (data) => {
            setCurrentQuestion(data.questionText);
            setInterviewState('in_progress');
        };
        
        const onInterviewError = (errorMessage) => {
            setError(errorMessage);
            setInterviewState('error');
        };

        const onNewTranscript = (data) => {
            setTranscript(prev => {
                const lastEntry = prev[prev.length - 1];
                if (lastEntry && !lastEntry.isFinal) {
                    return [...prev.slice(0, -1), data];
                }
                return [...prev, data];
            });
        };
        
        const onUtteranceEnd = () => {
            console.log("Utterance end detected. AI can now respond.");
            stopListening(); 
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('ai-question', onAiQuestion);
        socket.on('interview-error', onInterviewError);
        socket.on('new-transcript', onNewTranscript);
        socket.on('utterance-end', onUtteranceEnd);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('ai-question', onAiQuestion);
            socket.off('interview-error', onInterviewError);
            socket.off('new-transcript', onNewTranscript);
            socket.off('utterance-end', onUtteranceEnd);
            if(mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            socket.disconnect();
        };
    }, [applicationId]);


   
    // --- UI Rendering Logic ---
    const renderContent = () => (
        <AnimatePresence mode="wait">
            <motion.div
                key={interviewState}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
            >
                {interviewState === 'error' && (
                    <Card className="text-center">
                        <CardHeader>
                            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                            <CardTitle className="mt-4">An Error Occurred</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{error}</p>
                            <Button className="mt-6" onClick={() => navigate('/candidate/dashboard')}>
                                Return to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {interviewState === 'lobby' && (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">AI Video Interview</CardTitle>
                            <CardDescription>Prepare for your automated skills assessment.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg"><Mic className="h-5 w-5 mt-1 text-primary flex-shrink-0" /><div><h4 className="font-semibold">Microphone & Camera</h4><p className="text-muted-foreground">Ensure they are enabled and working correctly.</p></div></div>
                                <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg"><Wifi className="h-5 w-5 mt-1 text-primary flex-shrink-0" /><div><h4 className="font-semibold">Stable Connection</h4><p className="text-muted-foreground">A strong internet connection is crucial.</p></div></div>
                                <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg"><UserCheck className="h-5 w-5 mt-1 text-primary flex-shrink-0" /><div><h4 className="font-semibold">Quiet Environment</h4><p className="text-muted-foreground">Find a well-lit, quiet space to avoid distractions.</p></div></div>
                                <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg"><Video className="h-5 w-5 mt-1 text-primary flex-shrink-0" /><div><h4 className="font-semibold">Video Preview</h4><p className="text-muted-foreground">You will see yourself, but only the AI is listening.</p></div></div>
                            </div>
                            <div className="text-center pt-4">
                                <Button size="lg" onClick={handleStartInterview} disabled={!isConnected}><Power className="mr-2 h-4 w-4" />{isConnected ? "I'm Ready, Start Interview" : "Connecting..."}</Button>
                                {!isConnected && <Loader2 className="mx-auto mt-2 h-4 w-4 animate-spin" />}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {interviewState === 'loading' && (
                     <div className="text-center py-20">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-lg font-semibold text-muted-foreground">Initializing your interview...</p>
                        <p className="text-sm text-muted-foreground">The AI is preparing your first question.</p>
                    </div>
                )}

                {interviewState === 'in_progress' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Interview in Progress</CardTitle>
                            <CardDescription>Listen to the question, then provide your answer.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-start gap-4">
                                <Avatar><AvatarFallback>AI</AvatarFallback><AvatarImage src="/ai-avatar.png" alt="AI Interviewer" /></Avatar>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2"><p className="font-semibold">AI Interviewer</p><Volume2 className="h-4 w-4 text-blue-500" /></div>
                                    <div className="p-4 bg-secondary rounded-lg relative"><MessageSquareQuote className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50" /><p className="text-lg">"{currentQuestion}"</p></div>
                                </div>
                            </div>
                            
                            <div className="border-t pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-muted-foreground">Your Response</h3>
                                    <div className="flex gap-2">
                                        <Button onClick={startListening} disabled={isListening} size="sm"><Mic className="mr-2 h-4 w-4" /> Start Speaking</Button>
                                        <Button onClick={stopListening} disabled={!isListening} variant="destructive" size="sm"><MicOff className="mr-2 h-4 w-4" /> Stop Speaking</Button>
                                    </div>
                                </div>
                                
                                <div className="min-h-[100px] p-4 bg-muted rounded-lg border">
                                    {transcript.map((item, index) => (
                                        <span key={index} className={item.isFinal ? 'text-foreground' : 'text-muted-foreground'}>
                                            {item.text}{' '}
                                        </span>
                                    ))}
                                    {isListening && <span className="text-primary animate-pulse">|</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </motion.div>
        </AnimatePresence>
    );

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default VideoInterviewPage;