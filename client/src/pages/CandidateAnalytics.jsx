// CandidateAnalytics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import InterviewAnalytics from '@/components/InterviewAnalytics';
import { 
    BarChart3, 
    TrendingUp, 
    AlertCircle, 
    Brain,
    Target,
    Award,
    Activity,
    Sparkles,
    Eye,
    Zap,
    CheckCircle
} from 'lucide-react';

const CandidateAnalytics = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userInfo } = useAuth();

    useEffect(() => {
        if (!userInfo) return;
        
        const fetchApplications = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get('http://localhost:5001/api/applications/my-applications', config);
                setApplications(data);
            } catch (error) {
                console.error('Failed to fetch applications:', error);
                setError('Failed to load analytics data. Please try again later.');
                setApplications([]);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchApplications();
    }, [userInfo]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                
                <div className="relative p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="text-center">
                                <div className="relative mb-8">
                                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                                    <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                </div>
                                <p className="text-slate-700 text-xl font-semibold mb-2">Loading your analytics...</p>
                                <p className="text-slate-500">Analyzing your interview performance data</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                
                <div className="relative p-6 md:p-10">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                                    <BarChart3 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                        Interview Analytics
                                    </h1>
                                    <p className="text-slate-600 text-lg">Track your interview performance and insights</p>
                                </div>
                            </div>
                        </div>

                        {/* Error State */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-16 text-center">
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-100 to-red-100 rounded-2xl mx-auto mb-8">
                                <AlertCircle className="h-10 w-10 text-rose-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Unable to Load Analytics</h3>
                            <p className="text-slate-600 mb-8 text-lg max-w-md mx-auto leading-relaxed">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Check if user has any interview data
    const hasInterviewData = applications.some(app => 
        app.videoAnalysisReport && app.videoAnalysisReport.overallScore !== null
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            
            <div className="relative p-6 md:p-10 space-y-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                                <Brain className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                                    Interview Analytics
                                </h1>
                                <p className="text-slate-600 text-lg font-medium">AI-powered insights into your interview performance</p>
                            </div>
                        </div>
                        
                        {/* Quick Stats */}
                        {hasInterviewData && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                                                <Target className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <span className="text-sm font-bold text-blue-900 uppercase tracking-wide">Total Interviews</span>
                                        </div>
                                        <div className="text-3xl font-bold text-blue-900 mb-2">
                                            {applications.filter(app => app.videoAnalysisReport).length}
                                        </div>
                                        <p className="text-blue-700 text-sm">Completed sessions</p>
                                    </div>
                                </div>
                                
                                <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-xl">
                                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                                            </div>
                                            <span className="text-sm font-bold text-emerald-900 uppercase tracking-wide">Average Score</span>
                                        </div>
                                        <div className="text-3xl font-bold text-emerald-900 mb-2">
                                            {Math.round(
                                                applications
                                                    .filter(app => app.videoAnalysisReport?.overallScore)
                                                    .reduce((acc, app) => acc + app.videoAnalysisReport.overallScore, 0) /
                                                applications.filter(app => app.videoAnalysisReport?.overallScore).length || 0
                                            )}%
                                        </div>
                                        <p className="text-emerald-700 text-sm">Overall performance</p>
                                    </div>
                                </div>
                                
                                <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl">
                                                <CheckCircle className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <span className="text-sm font-bold text-purple-900 uppercase tracking-wide">Completed</span>
                                        </div>
                                        <div className="text-3xl font-bold text-purple-900 mb-2">
                                            {applications.filter(app => 
                                                app.videoAnalysisReport && app.screeningStage === 'video_completed'
                                            ).length}
                                        </div>
                                        <p className="text-purple-700 text-sm">Successful interviews</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Analytics Content */}
                    {!hasInterviewData ? (
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-16 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mx-auto mb-8">
                                    <BarChart3 className="h-12 w-12 text-slate-500" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-4">No Interview Data Available</h3>
                                <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                                    Complete some video interviews to see your analytics and performance insights here. 
                                    Our AI will analyze your responses and provide detailed feedback.
                                </p>
                                <button
                                    onClick={() => window.location.href = '/candidate/dashboard'}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
                                >
                                    <Eye className="h-5 w-5" />
                                    View Applications
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
                            <div className="mb-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                                        <Activity className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Performance Analysis</h2>
                                        <p className="text-slate-600 text-lg">AI-powered breakdown of your interview performance across all applications</p>
                                    </div>
                                </div>
                                
                                {/* Performance Insights Badge */}
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full px-4 py-2 border border-blue-200">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="text-sm font-semibold">AI-Powered Insights</span>
                                </div>
                            </div>
                            
                            <div className="relative">
                                {/* Gradient border effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-emerald-500/10 rounded-2xl"></div>
                                <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                                    <InterviewAnalytics applications={applications} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
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

export default CandidateAnalytics;