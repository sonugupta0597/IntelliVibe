// src/components/VideoInterviewPage.jsx (FIXED with MIME Type checker and extensive logging)

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

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
const InterviewScreen = ({ localStream, currentQuestion, questionNumber, liveTranscript }) => (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-xl">
        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1"><h3 className="font-semibold text-lg mb-2 text-gray-700">Your Camera</h3><div className="w-full aspect-square bg-gray-900 rounded-md overflow-hidden"><VideoPlayer stream={localStream} muted={true} /></div></div>
            <div className="col-span-2 flex flex-col">
                <div className="flex-grow p-4 bg-gray-50 rounded-md mb-4"><h3 className="font-semibold text-lg mb-2 text-blue-800">Question {questionNumber}:</h3><p className="text-xl text-gray-800 min-h-[60px]">{currentQuestion || "Waiting for the first question..."}</p></div>
                <div className="flex-grow p-4 bg-gray-50 rounded-md"><h3 className="font-semibold text-lg mb-2 text-green-800">Live Transcript:</h3><p className="text-md text-gray-600 italic min-h-[40px]">{liveTranscript || "..."}</p></div>
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
            console.log("[Flow] New question received. Attempting to start recording...");
            // Add a small delay to ensure socket connection is ready
            setTimeout(() => {
                startRecording();
            }, 100);
        });

        socket.on('live-transcript', (transcript) => {
            // This log can be very noisy, enable if needed for fine-grained debugging
            // console.log(`[Socket] <== Live transcript: "${transcript}"`);
            setLiveTranscript(transcript);
        });

        socket.on('interview-finished', () => {
            console.log('[Socket] <== Interview finished by server.');
            stopRecording();
            setInterviewState('Finished');
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
                audioBitsPerSecond: 16000
            });
            console.log(`[Recorder] Using format: ${mimeType}`);

            console.log(`[Recorder] MediaRecorder created with settings:`, {
                audioBitsPerSecond: 16000,
                audioTracks: audioStream.getAudioTracks().length,
                mimeType: mediaRecorderRef.current.mimeType
            });

            mediaRecorderRef.current.ondataavailable = async (event) => {
                if (event.data.size > 0 && socketRef.current.connected) {
                    console.log(`[Recorder] Data available. Blob type: ${event.data.type}, size: ${event.data.size} bytes`);
                    try {
                        const arrayBuffer = await event.data.arrayBuffer();
                        console.log(`[Recorder] Converted to ArrayBuffer (${arrayBuffer.byteLength} bytes). Emitting audio-stream.`);
                        socketRef.current.emit('audio-stream', arrayBuffer);
                    } catch (error) {
                        console.error('[Recorder] Error converting Blob to ArrayBuffer:', error);
                    }
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
            };

            mediaRecorderRef.current.start(500); // Timeslice in ms

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

    const renderContent = () => {
        switch (interviewState) {
            case 'Interviewing': return <InterviewScreen localStream={localStreamRef.current} currentQuestion={currentQuestion} questionNumber={questionNumber} liveTranscript={liveTranscript} />;
            case 'Finished': return <ThankYouScreen />;
            default: return <Lobby onStartInterview={handleStartInterview} localStream={localStreamRef.current} isCameraReady={isCameraReady} />;
        }
    };

    return (<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">{renderContent()}</div>);
};

export default VideoInterviewPage;