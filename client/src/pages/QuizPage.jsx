import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, 
    AlertCircle, 
    CheckCircle, 
    XCircle,
    ChevronRight,
    ChevronLeft,
    Send,
    Timer
} from 'lucide-react';

const QuizPage = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    
    // Quiz state
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizResult, setQuizResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Fetch quiz data
    useEffect(() => {
        fetchQuiz();
    }, [applicationId]);

    // Timer effect
    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    handleSubmit(); // Auto-submit when time runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    const fetchQuiz = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(
                `http://localhost:5001/api/applications/${applicationId}/quiz`,
                config
            );
            
            setQuiz(data);
            // Set initial time (in seconds)
            setTimeRemaining(data.timeLimit * 60); // Convert minutes to seconds
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            setError(error.response?.data?.message || 'Failed to load quiz');
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        // Check if all questions are answered
        const unansweredQuestions = quiz.questions.filter(
            q => answers[q._id] === undefined
        );

        if (unansweredQuestions.length > 0 && timeRemaining > 0) {
            if (!window.confirm(`You have ${unansweredQuestions.length} unanswered questions. Submit anyway?`)) {
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            // Format answers for submission
            const formattedAnswers = quiz.questions.map(q => ({
                questionId: q._id,
                selectedAnswer: answers[q._id] !== undefined ? parseInt(answers[q._id]) : null
            }));

            const { data } = await axios.post(
                `http://localhost:5001/api/applications/${applicationId}/quiz/submit`,
                { answers: formattedAnswers },
                config
            );
            
            setQuizResult(data);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            setError('Failed to submit quiz. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format time display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / quiz?.questions.length) * 100;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button 
                    className="mt-4" 
                    onClick={() => navigate('/candidate/dashboard')}
                >
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    // Show result screen
    if (quizResult) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="container mx-auto px-4 py-8 max-w-2xl"
            >
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">
                            {quizResult.passed ? 'Congratulations!' : 'Quiz Completed'}
                        </CardTitle>
                        <CardDescription>
                            {quiz.jobTitle} - {quiz.companyName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                                quizResult.passed ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                                {quizResult.passed ? (
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                ) : (
                                    <XCircle className="h-12 w-12 text-red-600" />
                                )}
                            </div>
                            <h3 className="text-3xl font-bold mb-2">
                                Your Score: {quizResult.score}%
                            </h3>
                            <p className="text-muted-foreground">
                                Passing Score: {quizResult.passingScore}%
                            </p>
                        </div>

                        <Alert className={quizResult.passed ? '' : 'border-red-200'}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>
                                {quizResult.passed ? 'Next Steps' : 'Result'}
                            </AlertTitle>
                            <AlertDescription>
                                {quizResult.message}
                            </AlertDescription>
                        </Alert>

                        {quizResult.nextStep && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">What's Next?</h4>
                                <p>{quizResult.nextStep.message}</p>
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <Button onClick={() => navigate('/candidate/dashboard')}>
                                Back to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{quiz.jobTitle}</CardTitle>
                            <CardDescription>{quiz.companyName}</CardDescription>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-2xl font-bold">
                                <Timer className={`h-6 w-6 ${timeRemaining < 300 ? 'text-red-500' : ''}`} />
                                <span className={timeRemaining < 300 ? 'text-red-500' : ''}>
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">Time Remaining</p>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Progress */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                        <span>{answeredCount} answered</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </CardContent>
            </Card>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <Badge variant="outline">
                                    Question {currentQuestion + 1}
                                </Badge>
                                {answers[quiz.questions[currentQuestion]._id] !== undefined && (
                                    <Badge variant="secondary">Answered</Badge>
                                )}
                            </div>
                            <CardTitle className="text-xl mt-4">
                                {quiz.questions[currentQuestion].question}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={answers[quiz.questions[currentQuestion]._id]?.toString() || ''}
                                onValueChange={(value) => 
                                    handleAnswerChange(quiz.questions[currentQuestion]._id, value)
                                }
                            >
                                {quiz.questions[currentQuestion].options.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-3 py-3">
                                        <RadioGroupItem 
                                            value={index.toString()} 
                                            id={`option-${index}`} 
                                        />
                                        <Label 
                                            htmlFor={`option-${index}`} 
                                            className="cursor-pointer flex-1 font-normal"
                                        >
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>

                {currentQuestion === quiz.questions.length - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="ml-auto"
                    >
                        {isSubmitting ? (
                            <>Submitting...</>
                        ) : (
                            <>
                                Submit Quiz
                                <Send className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                ) : (
                    <Button onClick={handleNext}>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Question Navigator */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-sm">Question Navigator</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-10 gap-2">
                        {quiz.questions.map((_, index) => (
                            <Button
                                key={index}
                                variant={currentQuestion === index ? 'default' : 'outline'}
                                size="sm"
                                className={`w-10 h-10 p-0 ${
                                    answers[quiz.questions[index]._id] !== undefined 
                                        ? 'bg-green-100 hover:bg-green-200' 
                                        : ''
                                }`}
                                onClick={() => setCurrentQuestion(index)}
                            >
                                {index + 1}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default QuizPage;