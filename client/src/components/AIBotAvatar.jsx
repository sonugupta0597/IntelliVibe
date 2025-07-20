import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AIBotAvatar = ({ 
    isSpeaking = false, 
    isThinking = false, 
    question = '', 
    className = '' 
}) => {
    const [mouthOpen, setMouthOpen] = useState(false);
    const [eyeBlink, setEyeBlink] = useState(false);
    const [expression, setExpression] = useState('neutral');

    // Lip sync animation
    useEffect(() => {
        if (isSpeaking && question) {
            const interval = setInterval(() => {
                setMouthOpen(prev => !prev);
            }, 200);
            return () => clearInterval(interval);
        } else {
            setMouthOpen(false);
        }
    }, [isSpeaking, question]);

    // Eye blinking animation
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setEyeBlink(true);
            setTimeout(() => setEyeBlink(false), 150);
        }, 3000);
        return () => clearInterval(blinkInterval);
    }, []);

    // Expression based on state
    useEffect(() => {
        if (isThinking) {
            setExpression('thinking');
        } else if (isSpeaking) {
            setExpression('speaking');
        } else {
            setExpression('neutral');
        }
    }, [isSpeaking, isThinking]);

    const getExpressionStyles = () => {
        switch (expression) {
            case 'thinking':
                return {
                    eyebrows: 'translateY(-2px)',
                    eyes: 'scaleY(0.7)',
                    mouth: 'scaleY(0.3)',
                    color: 'bg-blue-500'
                };
            case 'speaking':
                return {
                    eyebrows: 'translateY(0px)',
                    eyes: 'scaleY(1)',
                    mouth: mouthOpen ? 'scaleY(1.2)' : 'scaleY(0.8)',
                    color: 'bg-green-500'
                };
            default:
                return {
                    eyebrows: 'translateY(0px)',
                    eyes: 'scaleY(1)',
                    mouth: 'scaleY(0.8)',
                    color: 'bg-purple-500'
                };
        }
    };

    const styles = getExpressionStyles();

    return (
        <div className={`relative ${className}`}>
            {/* AI Bot Face Container */}
            <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 rounded-full border-4 border-purple-200 shadow-lg">
                {/* Glow effect when speaking */}
                {isSpeaking && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                )}

                {/* Thinking animation */}
                {isThinking && (
                    <motion.div
                        className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 360]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                )}

                {/* Face Features */}
                <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
                    {/* Eyebrows */}
                    <div className="flex gap-8 mb-2">
                        <motion.div
                            className="w-6 h-1 bg-gray-700 rounded-full"
                            animate={{ transform: styles.eyebrows }}
                            transition={{ duration: 0.3 }}
                        />
                        <motion.div
                            className="w-6 h-1 bg-gray-700 rounded-full"
                            animate={{ transform: styles.eyebrows }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Eyes */}
                    <div className="flex gap-8 mb-4">
                        <motion.div
                            className="w-4 h-4 bg-gray-800 rounded-full relative"
                            animate={{ transform: styles.eyes }}
                            transition={{ duration: 0.3 }}
                        >
                            {eyeBlink && (
                                <motion.div
                                    className="absolute inset-0 bg-white rounded-full"
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    exit={{ scaleY: 0 }}
                                    transition={{ duration: 0.15 }}
                                />
                            )}
                        </motion.div>
                        <motion.div
                            className="w-4 h-4 bg-gray-800 rounded-full relative"
                            animate={{ transform: styles.eyes }}
                            transition={{ duration: 0.3 }}
                        >
                            {eyeBlink && (
                                <motion.div
                                    className="absolute inset-0 bg-white rounded-full"
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    exit={{ scaleY: 0 }}
                                    transition={{ duration: 0.15 }}
                                />
                            )}
                        </motion.div>
                    </div>

                    {/* Mouth */}
                    <motion.div
                        className="w-8 h-3 bg-gray-800 rounded-full"
                        animate={{ transform: styles.mouth }}
                        transition={{ duration: 0.2 }}
                    />

                    {/* Cheeks */}
                    <div className="absolute bottom-4 left-4 w-3 h-3 bg-pink-300 rounded-full opacity-60" />
                    <div className="absolute bottom-4 right-4 w-3 h-3 bg-pink-300 rounded-full opacity-60" />
                </div>

                {/* Status indicator */}
                <div className="absolute -bottom-2 -right-2">
                    <motion.div
                        className={`w-4 h-4 ${styles.color} rounded-full border-2 border-white`}
                        animate={{
                            scale: isSpeaking || isThinking ? [1, 1.2, 1] : 1,
                            opacity: isSpeaking || isThinking ? [0.7, 1, 0.7] : 0.7
                        }}
                        transition={{
                            duration: 1,
                            repeat: isSpeaking || isThinking ? Infinity : 0,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </div>

            {/* Thinking indicator */}
            {isThinking && (
                <motion.div
                    className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-blue-100 rounded-lg p-2 shadow-lg border border-blue-200"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                        <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                        />
                        <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                        />
                        <span>Thinking...</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AIBotAvatar; 