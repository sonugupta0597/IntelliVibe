import React, { useState, useEffect } from 'react';
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
import { AnimatePresence, motion } from 'framer-motion';
import { 
    Clock, 
    AlertCircle, 
    CheckCircle, 
    XCircle,
    ChevronRight,
    ChevronLeft,
    Send,
    Timer,
    FileText,
    Target,
    Award,
    Brain,
    Zap,
    TrendingUp,
    Eye,
    Sparkles
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
    const [autoSubmitted, setAutoSubmitted] = useState(false);
    
    // Fetch quiz data
    useEffect(() => {
        if (userInfo) {
            fetchQuiz();
        }
    }, [applicationId, userInfo]);

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

    // Auto-submit on tab change or back
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === 'hidden' && !quizResult && !autoSubmitted) {
                setAutoSubmitted(true);
                handleSubmit(true); // pass auto=true
            }
        };
        const handleBeforeUnload = (e) => {
            if (!quizResult && !autoSubmitted) {
                setAutoSubmitted(true);
                handleSubmit(true);
                e.preventDefault();
                e.returnValue = '';
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [quizResult, autoSubmitted]);

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

    const handleSubmit = async (auto = false) => {
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
                { answers: formattedAnswers, auto },
                config
            );
            
            setQuizResult(data);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            // Show backend error if available, else generic
            const backendMsg = error.response?.data?.message;
            setError(backendMsg || 'Failed to submit quiz. Please try again.');
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="relative mb-8">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                        <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="text-slate-700 text-xl font-semibold mb-2">Loading Skills Assessment...</p>
                    <p className="text-slate-500 text-sm">Preparing your customized quiz</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
                <div className="max-w-2xl mx-auto pt-20">
                    <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
                        <CardContent className="p-8">
                            <Alert className="border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl">
                                <AlertCircle className="h-5 w-5 text-rose-600" />
                                <AlertTitle className="text-rose-800 font-semibold">Unable to Load Assessment</AlertTitle>
                                <AlertDescription className="text-rose-700">{error}</AlertDescription>
                            </Alert>
                            <div className="mt-8 text-center">
                                <Button 
                                    onClick={() => navigate('/candidate/dashboard')}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    Return to Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Show result screen
    if (quizResult) {
        // If auto-submitted, mark as failed
        const failed = autoSubmitted || !quizResult.passed;
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-10">
                <AnimatePresence mode="wait">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto pt-12"
                    >
                        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                            <CardHeader className="text-center pb-8 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                                <div className="flex justify-center mb-8">
                                    <div className={`relative inline-flex items-center justify-center w-24 h-24 rounded-2xl ${
                                        failed ? 'bg-gradient-to-br from-rose-100 to-red-100' : 'bg-gradient-to-br from-emerald-100 to-green-100'
                                    } shadow-lg`}>
                                        {failed ? (
                                            <XCircle className="h-12 w-12 text-rose-600" />
                                        ) : (
                                            <CheckCircle className="h-12 w-12 text-emerald-600" />
                                        )}
                                        <div className={`absolute inset-0 rounded-2xl ${
                                            failed ? 'bg-rose-500/10' : 'bg-emerald-500/10'
                                        } animate-pulse`}></div>
                                    </div>
                                </div>
                                <CardTitle className="text-3xl font-bold text-slate-900 mb-3">
                                    {failed ? 'Assessment Not Completed' : 'Assessment Completed!'}
                                </CardTitle>
                                <CardDescription className="text-slate-600 text-lg">
                                    {quiz.jobTitle} • {quiz.companyName}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="text-center">
                                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 mb-8 border border-slate-200">
                                        <h3 className="text-4xl font-bold text-slate-900 mb-3">
                                            Score: {quizResult.score}%
                                        </h3>
                                        <p className="text-slate-600 text-lg">
                                            Required: {quizResult.passingScore}% to proceed
                                        </p>
                                        <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
                                            <div 
                                                className={`h-3 rounded-full transition-all duration-1000 ${
                                                    failed ? 'bg-gradient-to-r from-rose-500 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-green-500'
                                                }`}
                                                style={{ width: `${Math.min(quizResult.score, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <Alert className={`rounded-2xl border-0 ${
                                    failed 
                                        ? 'bg-gradient-to-r from-rose-50 to-red-50 shadow-lg shadow-rose-100' 
                                        : 'bg-gradient-to-r from-emerald-50 to-green-50 shadow-lg shadow-emerald-100'
                                }`}>
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                                        failed ? 'bg-rose-100' : 'bg-emerald-100'
                                    } mr-3`}>
                                        <AlertCircle className={`h-5 w-5 ${failed ? 'text-rose-600' : 'text-emerald-600'}`} />
                                    </div>
                                    <div>
                                        <AlertTitle className={`font-semibold ${failed ? 'text-rose-800' : 'text-emerald-800'}`}>
                                            {failed ? 'Assessment Result' : 'Next Steps'}
                                        </AlertTitle>
                                        <AlertDescription className={`${failed ? 'text-rose-700' : 'text-emerald-700'} mt-1`}>
                                            {quizResult.message}
                                        </AlertDescription>
                                    </div>
                                </Alert>

                                {quizResult.nextStep && !failed && (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
                                        <div className="flex items-start gap-4">
                                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                                                <Award className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-blue-900 mb-3 text-lg">What's Next?</h4>
                                                <p className="text-blue-800 mb-6 leading-relaxed">{quizResult.nextStep.message}</p>
                                                <Button 
                                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                                    onClick={() => navigate(`/candidate/interview/${applicationId}`)}
                                                >
                                                    <Sparkles className="h-5 w-5 mr-2" />
                                                    Proceed to Interview
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center pt-6">
                                    <Button 
                                        variant="outline"
                                        onClick={() => navigate('/candidate/dashboard')}
                                        className="bg-white/60 backdrop-blur-sm border-slate-300 text-slate-700 hover:bg-white/80 px-8 py-3 rounded-xl font-medium"
                                    >
                                        Return to Dashboard
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
                    <CardHeader className="border-b border-slate-100">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                        <Brain className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-slate-900">{quiz.jobTitle}</CardTitle>
                                        <CardDescription className="text-slate-600 text-lg">{quiz.companyName} • Skills Assessment</CardDescription>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`flex items-center gap-3 text-3xl font-bold mb-2 ${
                                    timeRemaining < 300 ? 'text-rose-600' : 'text-blue-600'
                                }`}>
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                                        timeRemaining < 300 ? 'bg-rose-100' : 'bg-blue-100'
                                    }`}>
                                        <Timer className={`h-6 w-6 ${timeRemaining < 300 ? 'text-rose-600' : 'text-blue-600'}`} />
                                    </div>
                                    <span>{formatTime(timeRemaining)}</span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium">Time Remaining</p>
                                {timeRemaining < 300 && (
                                    <Badge className="mt-2 bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold px-3 py-1 rounded-full">
                                        ⚠️ Low Time!
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Progress */}
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
                    <CardContent className="pt-6">
                        <div className="flex justify-between text-sm text-slate-600 mb-4">
                            <span className="font-semibold">Question {currentQuestion + 1} of {quiz.questions.length}</span>
                            <span className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                {answeredCount} of {quiz.questions.length} answered
                            </span>
                        </div>
                        <div className="relative">
                            <Progress value={progress} className="h-4 bg-slate-200 rounded-full" />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" 
                                 style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-3">
                            <span className="font-medium">Progress: {Math.round(progress)}%</span>
                            <span>{quiz.questions.length - answeredCount} remaining</span>
                        </div>
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
                        <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
                            <CardHeader className="border-b border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 px-4 py-2 rounded-full font-semibold">
                                        Question {currentQuestion + 1}
                                    </Badge>
                                    {answers[quiz.questions[currentQuestion]._id] !== undefined && (
                                        <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 px-4 py-2 rounded-full font-semibold">
                                            ✓ Answered
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-xl text-slate-900 leading-relaxed">
                                    {quiz.questions[currentQuestion].question}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <RadioGroup
                                    value={answers[quiz.questions[currentQuestion]._id]?.toString() || ''}
                                    onValueChange={(value) => 
                                        handleAnswerChange(quiz.questions[currentQuestion]._id, value)
                                    }
                                    className="space-y-4"
                                >
                                    {quiz.questions[currentQuestion].options.map((option, index) => (
                                        <div key={index} className="group relative">
                                            <div className="flex items-start space-x-4 p-6 rounded-2xl border border-slate-200 bg-white/60 hover:bg-white/80 hover:border-blue-300 transition-all duration-300 cursor-pointer group-hover:shadow-lg group-hover:scale-[1.02]">
                                                <RadioGroupItem 
                                                    value={index.toString()} 
                                                    id={`option-${index}`} 
                                                    className="mt-1 border-2 border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <Label 
                                                    htmlFor={`option-${index}`} 
                                                    className="cursor-pointer flex-1 font-medium text-slate-700 leading-relaxed text-lg"
                                                >
                                                    {option}
                                                </Label>
                                            </div>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        className="bg-white/60 backdrop-blur-sm border-slate-300 text-slate-700 hover:bg-white/80 px-6 py-3 rounded-xl font-medium"
                    >
                        <ChevronLeft className="mr-2 h-5 w-5" />
                        Previous
                    </Button>

                    {currentQuestion === quiz.questions.length - 1 ? (
                        <Button
                            onClick={() => handleSubmit()}
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Assessment
                                    <Send className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleNext}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            Next Question
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Question Navigator */}
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <Target className="h-4 w-4 text-white" />
                            </div>
                            Question Navigator
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                            {quiz.questions.map((_, index) => (
                                <Button
                                    key={index}
                                    variant={currentQuestion === index ? 'default' : 'outline'}
                                    size="sm"
                                    className={`w-12 h-12 p-0 text-sm font-bold rounded-xl transition-all duration-300 ${
                                        currentQuestion === index 
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110' 
                                            : answers[quiz.questions[index]._id] !== undefined 
                                                ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 hover:scale-105' 
                                                : 'bg-white/60 border-slate-300 text-slate-700 hover:bg-white/80 hover:scale-105'
                                    }`}
                                    onClick={() => setCurrentQuestion(index)}
                                >
                                    {index + 1}
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center justify-between mt-6 text-xs text-slate-500">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md"></div>
                                    <span className="font-medium">Current</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-300 rounded-md"></div>
                                    <span className="font-medium">Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-white border border-slate-300 rounded-md"></div>
                                    <span className="font-medium">Unanswered</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default QuizPage;