"# IntelliVibe" 
"# IntelliVibe" 
"# IntelliVibe" 
http://localhost:5173/candidate/interview/687b973cce8565328e0f6aed

1. the candidate should have the right to widraw from job application that he/she applied for
2. Routes are not protected for employee login


http://localhost:5173/candidate/interview/686a26c06e0db93711bdd101


// Add this function to generate follow-up questions

const generateFollowUpQuestion = async (conversationHistory, job) => {

    try {

        // For now, return a simple follow-up. Replace with actual AI logic later

        const lastCandidateAnswer = conversationHistory

            .filter(entry => entry.speaker === 'Candidate')

            .pop();

            

        if (!lastCandidateAnswer) {

            return "Could you please elaborate on that?";

        }

        

        // You can integrate with Gemini here for dynamic questions

        // For demo, returning contextual follow-ups

        const followUps = [

            "That's interesting! Can you elaborate on the specific technologies you used?",

            "What challenges did you face during implementation?",

            "How did you measure the success of that approach?",

            "What would you do differently if you tackled this problem again?",

            "How did you collaborate with your team on this?"

        ];

        

        return followUps[Math.floor(Math.random() * followUps.length)];

    } catch (error) {

        console.error('[AI] Error generating follow-up:', error);

        return "Can you tell me more about your technical experience?";

    }

};

----------

// import React, { useEffect, useState, useRef, useCallback } from 'react';

// // Mock socket service - replace with your actual socket implementation
// const socket = {
//     connected: false,
//     listeners: {},
    
//     connect() { 
//         this.connected = true;
//         console.log('[Socket] Connected');
//     },
    
//     disconnect() { 
//         this.connected = false;
//         console.log('[Socket] Disconnected');
//     },
    
//     emit(event, data) {
//         console.log(`[Socket] Emit: ${event}`, data);
        
//         // Simulate server responses for demo
//         if (event === 'start-interview') {
//             setTimeout(() => {
//                 this.trigger('ai-question', {
//                     questionText: "Hi! Thanks for joining today. Can you start by telling me about your most challenging project and how you approached solving the technical problems you encountered?"
//                 });
//             }, 2000);
//         }
        
//         if (event === 'candidate-answer-finished') {
//             setTimeout(() => {
//                 this.trigger('follow-up-question', "That's interesting! Can you elaborate on the specific technologies you used and why you chose them for that particular solution?");
//             }, 3000);
//         }
//     },
    
//     on(event, callback) {
//         if (!this.listeners[event]) {
//             this.listeners[event] = [];
//         }
//         this.listeners[event].push(callback);
//     },
    
//     off(event, callback) {
//         if (this.listeners[event]) {
//             this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
//         }
//     },
    
//     trigger(event, data) {
//         if (this.listeners[event]) {
//             this.listeners[event].forEach(callback => callback(data));
//         }
//     }
// };

// // UI Components (Simplified versions of shadcn/ui components)
// const Button = ({ children, onClick, disabled, size = 'default', className = '' }) => (
//     <button
//         onClick={onClick}
//         disabled={disabled}
//         className={`px-4 py-2 rounded-md font-medium transition-colors
//             ${disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}
//             ${size === 'lg' ? 'px-6 py-3 text-lg' : ''}
//             ${className}`}
//     >
//         {children}
//     </button>
// );

// const Card = ({ children, className = '' }) => (
//     <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
// );

// const CardHeader = ({ children, className = '' }) => (
//     <div className={`p-6 ${className}`}>{children}</div>
// );

// const CardContent = ({ children, className = '' }) => (
//     <div className={`p-6 pt-0 ${className}`}>{children}</div>
// );

// const CardTitle = ({ children, className = '' }) => (
//     <h2 className={`text-2xl font-bold ${className}`}>{children}</h2>
// );

// const CardDescription = ({ children, className = '' }) => (
//     <p className={`text-gray-600 mt-1 ${className}`}>{children}</p>
// );

// const Avatar = ({ children, className = '' }) => (
//     <div className={`rounded-full bg-gray-200 flex items-center justify-center ${className}`}>
//         {children}
//     </div>
// );

// const AvatarFallback = ({ children }) => (
//     <span className="text-gray-600 font-medium">{children}</span>
// );

// const Badge = ({ children, variant = 'default', className = '' }) => {
//     const variants = {
//         default: 'bg-gray-100 text-gray-700',
//         secondary: 'bg-blue-100 text-blue-700',
//         destructive: 'bg-red-100 text-red-700'
//     };
    
//     return (
//         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
//             {children}
//         </span>
//     );
// };

// // Icons (Simple SVG icons)
// const Power = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
// const Loader2 = ({ className = '' }) => <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>;
// const Mic = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
// const MicOff = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>;
// const Volume2 = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
// const BrainCircuit = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;

// const VideoInterviewPage = () => {
//     const applicationId = 'demo-application-id'; // Replace with actual applicationId
    
//     // UI and Flow State
//     const [uiState, setUiState] = useState('lobby'); // lobby, interview
//     const [flowState, setFlowState] = useState('AI_IDLE'); // AI_IDLE, AI_THINKING, AI_SPEAKING, CANDIDATE_LISTENING, CANDIDATE_SPEAKING
//     const [conversation, setConversation] = useState([]);
//     const [mediaReady, setMediaReady] = useState(false);
//     const [currentAIQuestion, setCurrentAIQuestion] = useState('');
//     const [streamError, setStreamError] = useState(null);
    
//     // Media Refs
//     const mediaRecorderRef = useRef(null);
//     const mediaStreamRef = useRef(null);
//     const audioContextRef = useRef(null);
//     const videoRef = useRef(null);
//     const hiddenVideoRef = useRef(null);
    
//     // Proctoring State
//     const [proctoringAlerts, setProctoringAlerts] = useState([]);
    
//     // Refs for state inside socket listeners
//     const flowStateRef = useRef(flowState);
//     useEffect(() => { flowStateRef.current = flowState }, [flowState]);
    
//     const conversationRef = useRef(conversation);
//     useEffect(() => { conversationRef.current = conversation }, [conversation]);

//     // Initialize media stream
//     const initializeMediaStream = useCallback(async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ 
//                 video: {
//                     width: { ideal: 1280 },
//                     height: { ideal: 720 },
//                     facingMode: 'user'
//                 },
//                 audio: {
//                     echoCancellation: true,
//                     noiseSuppression: true,
//                     autoGainControl: true,
//                     sampleRate: 44100
//                 }
//             });
            
//             mediaStreamRef.current = stream;
            
//             // Set up the hidden video element that maintains the stream
//             if (hiddenVideoRef.current) {
//                 hiddenVideoRef.current.srcObject = stream;
//             }
            
//             // Initialize audio context for better audio handling
//             audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            
//             setMediaReady(true);
//             setStreamError(null);
//             console.log('[Media] Stream initialized successfully');
//         } catch (error) {
//             console.error('[Media] Failed to initialize stream:', error);
//             setStreamError(error.message);
            
//             if (error.name === 'NotAllowedError') {
//                 alert('Camera and microphone permissions were denied. Please allow access and refresh the page.');
//             } else if (error.name === 'NotFoundError') {
//                 alert('No camera or microphone found. Please connect a device and refresh the page.');
//             } else {
//                 alert(`Failed to access media devices: ${error.message}`);
//             }
//         }
//     }, []);

//     // Initialize media stream on component mount
//     useEffect(() => {
//         initializeMediaStream();
        
//         return () => {
//             // Cleanup media stream on unmount
//             if (mediaStreamRef.current) {
//                 mediaStreamRef.current.getTracks().forEach(track => {
//                     track.stop();
//                     console.log(`[Media] Stopped track: ${track.kind}`);
//                 });
//             }
//             if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
//                 audioContextRef.current.close();
//             }
//         };
//     }, [initializeMediaStream]);

//     // Update video elements when stream is ready
//     useEffect(() => {
//         if (mediaStreamRef.current && videoRef.current) {
//             videoRef.current.srcObject = mediaStreamRef.current;
//         }
//     }, [uiState, mediaReady]);

//     // Function to stop recording
//     const stopRecording = useCallback(() => {
//         if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//             mediaRecorderRef.current.stop();
//             console.log('[Recorder] Recording stopped.');
//         }
//     }, []);

//     // Function to start recording
//     const startRecording = useCallback(() => {
//         if (!mediaStreamRef.current) {
//             console.error('[Recorder] No media stream available');
//             return;
//         }

//         try {
//             const audioTracks = mediaStreamRef.current.getAudioTracks();
//             if (audioTracks.length === 0) {
//                 console.error('[Recorder] No audio tracks found');
//                 return;
//             }

//             // Create a new MediaStream with only audio
//             const audioStream = new MediaStream(audioTracks);
            
//             // Check for supported MIME types
//             const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
//                 ? 'audio/webm;codecs=opus' 
//                 : 'audio/webm';
            
//             const recorder = new MediaRecorder(audioStream, { 
//                 mimeType,
//                 audioBitsPerSecond: 128000
//             });
            
//             mediaRecorderRef.current = recorder;

//             recorder.ondataavailable = (event) => {
//                 if (event.data && event.data.size > 0) {
//                     socket.emit('audio-stream', event.data);
//                     console.log(`[Recorder] Sent audio chunk: ${event.data.size} bytes`);
//                 }
//             };

//             recorder.onerror = (error) => {
//                 console.error('[Recorder] MediaRecorder error:', error);
//             };

//             recorder.onstart = () => {
//                 console.log('[Recorder] Recording started');
//             };

//             recorder.onstop = () => {
//                 console.log('[Recorder] Recording stopped');
//             };

//             recorder.start(100); // Send chunks every 100ms
//         } catch (error) {
//             console.error('[Recorder] Failed to start recording:', error);
//             alert('Failed to start audio recording. Please check your microphone permissions.');
//         }
//     }, []);

//     // Proctoring Setup
//     useEffect(() => {
//         if (uiState !== 'interview') return;

//         // Tab visibility monitoring
//         const handleVisibilityChange = () => {
//             if (document.hidden) {
//                 console.log('[Proctoring] Tab unfocused');
//                 socket.emit('proctoring-violation', { 
//                     type: 'tab-unfocused',
//                     timestamp: new Date().toISOString()
//                 });
//                 setProctoringAlerts(prev => [...prev, {
//                     type: 'tab-unfocused',
//                     message: 'Tab switched',
//                     timestamp: new Date()
//                 }]);
//             }
//         };

//         // Copy/Paste monitoring
//         const handlePaste = (e) => {
//             console.log('[Proctoring] Paste detected');
//             socket.emit('proctoring-violation', { 
//                 type: 'paste-detected',
//                 timestamp: new Date().toISOString()
//             });
//             setProctoringAlerts(prev => [...prev, {
//                 type: 'paste-detected',
//                 message: 'Content pasted',
//                 timestamp: new Date()
//             }]);
//         };

//         document.addEventListener('visibilitychange', handleVisibilityChange);
//         window.addEventListener('paste', handlePaste);

//         return () => {
//             document.removeEventListener('visibilitychange', handleVisibilityChange);
//             window.removeEventListener('paste', handlePaste);
//         };
//     }, [uiState]);

//     // Flow state management
//     useEffect(() => {
//         const handleFlowTransition = async () => {
//             switch (flowState) {
//                 case 'AI_SPEAKING':
//                     // Simulate AI speaking duration
//                     setTimeout(() => {
//                         setFlowState('CANDIDATE_LISTENING');
//                     }, 2000);
//                     break;
                    
//                 case 'CANDIDATE_LISTENING':
//                     // Auto-transition to speaking
//                     setTimeout(() => {
//                         setFlowState('CANDIDATE_SPEAKING');
//                     }, 500);
//                     break;
                    
//                 case 'CANDIDATE_SPEAKING':
//                     startRecording();
//                     // Simulate utterance end after 5 seconds for demo
//                     setTimeout(() => {
//                         socket.trigger('utterance-end');
//                     }, 5000);
//                     break;
                    
//                 case 'AI_THINKING':
//                     stopRecording();
//                     break;
                    
//                 default:
//                     break;
//             }
//         };

//         handleFlowTransition();
//     }, [flowState, startRecording, stopRecording]);

//     // Socket event handlers
//     useEffect(() => {
//         const handleAiQuestion = (data) => {
//             const questionText = typeof data === 'string' ? data : data.questionText;
//             setCurrentAIQuestion(questionText);
//             setConversation(prev => [...prev, { 
//                 speaker: 'AI', 
//                 text: questionText, 
//                 timestamp: new Date(),
//                 isFinal: true 
//             }]);
//             setFlowState('AI_SPEAKING');
//         };

//         const handleNewTranscript = (data) => {
//             setConversation(prev => {
//                 const last = prev[prev.length - 1];
//                 if (last?.speaker === 'Candidate' && !last.isFinal) {
//                     return [...prev.slice(0, -1), { 
//                         speaker: 'Candidate', 
//                         ...data,
//                         timestamp: last.timestamp 
//                     }];
//                 }
//                 return [...prev, { 
//                     speaker: 'Candidate', 
//                     text: data.text || "I've been working on several challenging projects...",
//                     isFinal: data.isFinal,
//                     timestamp: new Date()
//                 }];
//             });
//         };

//         const handleUtteranceEnd = () => {
//             if (flowStateRef.current === 'CANDIDATE_SPEAKING') {
//                 stopRecording();
//                 setFlowState('AI_THINKING');
//                 socket.emit('candidate-answer-finished', { 
//                     applicationId, 
//                     conversationHistory: conversationRef.current 
//                 });
//             }
//         };

//         const handleFollowUpQuestion = (question) => {
//             console.log('Received follow-up question:', question);
//             setCurrentAIQuestion(question);
//             setConversation(prev => [...prev, { 
//                 speaker: 'AI', 
//                 text: question, 
//                 timestamp: new Date(),
//                 isFinal: true 
//             }]);
//             setFlowState('AI_SPEAKING');
//         };

//         socket.on('ai-question', handleAiQuestion);
//         socket.on('new-transcript', handleNewTranscript);
//         socket.on('utterance-end', handleUtteranceEnd);
//         socket.on('follow-up-question', handleFollowUpQuestion);
        
//         socket.connect();
//         socket.emit('join-interview-room', applicationId);

//         return () => {
//             socket.off('ai-question', handleAiQuestion);
//             socket.off('new-transcript', handleNewTranscript);
//             socket.off('utterance-end', handleUtteranceEnd);
//             socket.off('follow-up-question', handleFollowUpQuestion);
//             stopRecording();
//             socket.disconnect();
//         };
//     }, [applicationId, stopRecording]);

//     const handleStartInterview = useCallback(() => {
//         if (!mediaReady) return;
//         setUiState('interview');
//         setFlowState('AI_THINKING');
//         socket.emit('start-interview', applicationId);
//     }, [applicationId, mediaReady]);

//     // Get flow state display info
//     const getFlowStateDisplay = () => {
//         switch (flowState) {
//             case 'AI_SPEAKING':
//                 return { icon: Volume2, text: 'Speaking', color: 'text-blue-600' };
//             case 'AI_THINKING':
//                 return { icon: BrainCircuit, text: 'Thinking', color: 'text-yellow-600' };
//             case 'CANDIDATE_LISTENING':
//                 return { icon: MicOff, text: 'Your turn', color: 'text-gray-600' };
//             case 'CANDIDATE_SPEAKING':
//                 return { icon: Mic, text: 'Recording', color: 'text-red-600' };
//             default:
//                 return { icon: null, text: '', color: '' };
//         }
//     };

//     const flowStateDisplay = getFlowStateDisplay();

//     return (
//         <div className="min-h-screen bg-gray-50 p-4">
//             {/* Hidden video element to maintain stream */}
//             <video
//                 ref={hiddenVideoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 style={{ display: 'none' }}
//             />

//             {/* LOBBY VIEW */}
//             {uiState === 'lobby' && (
//                 <div className="max-w-2xl mx-auto mt-20">
//                     <Card>
//                         <CardHeader className="text-center">
//                             <CardTitle>Video Interview Lobby</CardTitle>
//                             <CardDescription>
//                                 Please ensure your camera and microphone are working properly
//                             </CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-6">
//                             <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
//                                 {mediaReady ? (
//                                     <video
//                                         ref={videoRef}
//                                         autoPlay
//                                         playsInline
//                                         muted
//                                         className="w-full h-full object-cover"
//                                         style={{ transform: 'scaleX(-1)' }}
//                                     />
//                                 ) : (
//                                     <div className="w-full h-full flex items-center justify-center">
//                                         {streamError ? (
//                                             <div className="text-center">
//                                                 <p className="text-red-600 mb-2">Camera Error</p>
//                                                 <p className="text-sm text-gray-600">{streamError}</p>
//                                             </div>
//                                         ) : (
//                                             <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
                            
//                             <div className="text-center space-y-4">
//                                 <div className="flex items-center justify-center gap-4 text-sm">
//                                     <div className={`flex items-center gap-2 ${mediaReady ? 'text-green-600' : 'text-gray-400'}`}>
//                                         <div className={`w-2 h-2 rounded-full ${mediaReady ? 'bg-green-600' : 'bg-gray-400'}`} />
//                                         Camera {mediaReady ? 'Ready' : 'Loading...'}
//                                     </div>
//                                     <div className={`flex items-center gap-2 ${mediaReady ? 'text-green-600' : 'text-gray-400'}`}>
//                                         <div className={`w-2 h-2 rounded-full ${mediaReady ? 'bg-green-600' : 'bg-gray-400'}`} />
//                                         Microphone {mediaReady ? 'Ready' : 'Loading...'}
//                                     </div>
//                                 </div>
                                
//                                 <Button 
//                                     size="lg" 
//                                     onClick={handleStartInterview} 
//                                     disabled={!mediaReady}
//                                 >
//                                     {mediaReady ? (
//                                         <>
//                                             <Power />
//                                             <span className="ml-2">Start Interview</span>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Loader2 className="animate-spin" />
//                                             <span className="ml-2">Checking Devices...</span>
//                                         </>
//                                     )}
//                                 </Button>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>
//             )}

//             {/* INTERVIEW VIEW */}
//             {uiState === 'interview' && (
//                 <div className="h-screen flex flex-col gap-4">
//                     {/* Main Interview Area */}
//                     <div className="flex-1 grid grid-cols-2 gap-4">
//                         {/* AI Interviewer Panel */}
//                         <Card className="flex flex-col">
//                             <CardHeader className="pb-4">
//                                 <div className="flex items-center justify-between">
//                                     <div className="flex items-center gap-3">
//                                         <Avatar className="h-12 w-12">
//                                             <AvatarFallback>AI</AvatarFallback>
//                                         </Avatar>
//                                         <div>
//                                             <h3 className="font-semibold">AI Interviewer</h3>
//                                             <p className="text-sm text-gray-600">Technical Interview Assistant</p>
//                                         </div>
//                                     </div>
//                                     {flowStateDisplay.icon && flowState.includes('AI') && (
//                                         <Badge variant="secondary" className="animate-pulse">
//                                             <flowStateDisplay.icon />
//                                             <span className="ml-1">{flowStateDisplay.text}</span>
//                                         </Badge>
//                                     )}
//                                 </div>
//                             </CardHeader>
//                             <CardContent className="flex-1 flex items-center justify-center">
//                                 <div className="w-full max-w-lg text-center">
//                                     <div className="bg-gray-100 rounded-lg p-6 min-h-[120px] flex items-center justify-center">
//                                         <p className="text-lg">
//                                             {currentAIQuestion || 'Preparing your interview...'}
//                                         </p>
//                                     </div>
//                                     {flowState === 'AI_THINKING' && (
//                                         <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
//                                             <BrainCircuit className="animate-spin" />
//                                             Analyzing your response...
//                                         </div>
//                                     )}
//                                 </div>
//                             </CardContent>
//                         </Card>

//                         {/* Candidate Video Panel */}
//                         <Card className="flex flex-col">
//                             <CardHeader className="pb-4">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <h3 className="font-semibold">You</h3>
//                                         <p className="text-sm text-gray-600">Candidate View</p>
//                                     </div>
//                                     {flowStateDisplay.icon && flowState.includes('CANDIDATE') && (
//                                         <Badge 
//                                             variant={flowState === 'CANDIDATE_SPEAKING' ? 'destructive' : 'secondary'}
//                                             className={flowState === 'CANDIDATE_SPEAKING' ? 'animate-pulse' : ''}
//                                         >
//                                             <flowStateDisplay.icon />
//                                             <span className="ml-1">{flowStateDisplay.text}</span>
//                                         </Badge>
//                                     )}
//                                 </div>
//                             </CardHeader>
//                             <CardContent className="p-0 flex-1">
//                                 <div className="relative w-full h-full bg-gray-100 rounded-b-lg overflow-hidden">
//                                     {mediaReady && (
//                                         <video
//                                             ref={videoRef}
//                                             autoPlay
//                                             playsInline
//                                             muted
//                                             className="w-full h-full object-cover"
//                                             style={{ transform: 'scaleX(-1)' }}
//                                         />
//                                     )}
                                    
//                                     {/* Proctoring Alerts */}
//                                     {proctoringAlerts.length > 0 && (
//                                         <div className="absolute top-2 right-2 space-y-2">
//                                             {proctoringAlerts.slice(-3).map((alert, idx) => (
//                                                 <Badge key={idx} variant="destructive">
//                                                     {alert.message}
//                                                 </Badge>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </div>

//                     {/* Transcript Panel */}
//                     <Card className="h-48">
//                         <CardHeader className="py-3">
//                             <h3 className="font-semibold">Live Transcript</h3>
//                         </CardHeader>
//                         <CardContent className="h-[calc(100%-3rem)] overflow-y-auto">
//                             <div className="space-y-3">
//                                 {conversation.map((entry, index) => (
//                                     <div
//                                         key={index}
//                                         className={`flex gap-3 ${entry.speaker === 'AI' ? '' : 'flex-row-reverse'}`}
//                                     >
//                                         <Avatar className="h-8 w-8 flex-shrink-0">
//                                             <AvatarFallback>
//                                                 {entry.speaker === 'AI' ? 'AI' : 'You'}
//                                             </AvatarFallback>
//                                         </Avatar>
//                                         <div className={`flex-1 ${entry.speaker === 'AI' ? 'text-left' : 'text-right'}`}>
//                                             <div className={`inline-block px-4 py-2 rounded-lg ${
//                                                 entry.speaker === 'AI' 
//                                                     ? 'bg-gray-200 text-gray-800' 
//                                                     : 'bg-blue-600 text-white'
//                                             }`}>
//                                                 <p className="text-sm">{entry.text}</p>
//                                                 {!entry.isFinal && (
//                                                     <span className="text-xs opacity-50 ml-2">...</span>
//                                                 )}
//                                             </div>
//                                             <p className="text-xs text-gray-500 mt-1">
//                                                 {entry.timestamp.toLocaleTimeString()}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default VideoInterviewPage;


--------------------