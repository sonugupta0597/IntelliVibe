import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Briefcase,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    FileText,
    AlertCircle,
    Calendar,
    Building2,
    MapPin,
    ExternalLink,
    Award,
    MessageSquare,
    Video,
    Sparkles,
    Target,
    Brain,
    BarChart2,
    Lightbulb,
    ClipboardList,
    Mic,
    Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ApplicationProgressTracker from '@/components/ApplicationProgressTracker';

const CandidateDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        reviewed: 0,
        shortlisted: 0,
        rejected: 0,
        averageScore: 0,
        completedInterviews: 0,
        averageInterviewScore: 0
    });
    const { userInfo } = useAuth();
    const navigate = useNavigate();

    // State for analysis modal
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [selectedApplicationForAnalysis, setSelectedApplicationForAnalysis] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, [userInfo]);

    const fetchApplications = async () => {
        if (!userInfo) return;
        
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('http://localhost:5001/api/applications/my-applications', config);
            
            setApplications(data);
            
            // Calculate statistics
            const completedInterviews = data.filter(app => 
                app.videoAnalysisReport && 
                app.videoAnalysisReport.overallScore !== null &&
                app.screeningStage === 'video_completed'
            );

            const stats = {
                total: data.length,
                pending: data.filter(app => app.status === 'pending').length,
                reviewed: data.filter(app => app.status === 'reviewed').length,
                shortlisted: data.filter(app => app.status === 'shortlisted').length,
                rejected: data.filter(app => app.status === 'rejected').length,
                averageScore: data.filter(app => app.aiMatchScore !== null).length > 0
                    ? Math.round(
                        data
                            .filter(app => app.aiMatchScore !== null)
                            .reduce((acc, app) => acc + app.aiMatchScore, 0) /
                        data.filter(app => app.aiMatchScore !== null).length
                    )
                    : 0,
                completedInterviews: completedInterviews.length,
                averageInterviewScore: completedInterviews.length > 0
                    ? Math.round(
                        completedInterviews.reduce((acc, app) => acc + app.videoAnalysisReport.overallScore, 0) /
                        completedInterviews.length
                    )
                    : 0
            };
            setStats(stats);
        } catch (error) {
            console.error("Failed to fetch applications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'shortlisted':
                return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-rose-500" />;
            case 'reviewed':
                return <Clock className="h-5 w-5 text-blue-500" />;
            default:
                return <Clock className="h-5 w-5 text-slate-400" />;
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'shortlisted':
                return 'default';
            case 'rejected':
                return 'destructive';
            case 'reviewed':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getScoreBadgeVariant = (score) => {
        if (score >= 80) return 'default';
        if (score >= 60) return 'secondary';
        if (score >= 40) return 'outline';
        return 'destructive';
    };

    const ApplicationCard = ({ application }) => (
        <Card className="group relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl backdrop-blur-sm hover:-translate-y-1">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="relative border-b border-slate-100/60 pb-6 bg-gradient-to-br from-slate-50/50 to-white">
                <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                        <CardTitle className="text-xl font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors duration-200">
                            {application.job?.title || <span className="text-rose-600">[Job no longer available]</span>}
                        </CardTitle>
                        <CardDescription className="space-y-2">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="font-medium">{application.job?.companyName || <span className="text-rose-600">N/A</span>}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <div className="flex items-center justify-center w-8 h-8 bg-emerald-50 rounded-lg">
                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                </div>
                                <span>{application.job?.location || <span className="text-rose-600">N/A</span>}</span>
                            </div>
                        </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100">
                            {getStatusIcon(application.status)}
                        </div>
                        <Badge variant={getStatusBadgeVariant(application.status)} className="uppercase tracking-wider text-xs font-semibold px-3 py-1.5 rounded-full">
                            {application.status}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="relative p-6 space-y-6 flex-grow">
                {/* AI Score Section */}
                {application.aiMatchScore !== null && application.aiMatchScore !== undefined ? (
                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 space-y-4">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-200/20 rounded-full -translate-y-8 translate-x-8" />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-xl">
                                    <Brain className="h-5 w-5 text-indigo-600" />
                                </div>
                                <span className="text-sm font-semibold text-slate-800">AI Match Score</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={getScoreBadgeVariant(application.aiMatchScore)} className="text-base font-bold px-3 py-1.5">
                                    {application.aiMatchScore}%
                                </Badge>
                                {application.aiMatchScore >= 70 && (
                                    <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-100 px-3 py-1.5 rounded-full">
                                        <Sparkles className="h-3 w-3" />
                                        Strong Match
                                    </div>
                                )}
                            </div>
                        </div>
                        {application.aiJustification && (
                            <p className="text-sm text-slate-700 leading-relaxed bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40">
                                {application.aiJustification}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-slate-200 rounded-xl">
                                    <Brain className="h-5 w-5 text-slate-500" />
                                </div>
                                <span className="text-sm font-semibold text-slate-700">AI Match Score</span>
                            </div>
                            <Badge variant="outline" className="text-slate-500 border-slate-300">
                                Processing...
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-600 bg-white/60 backdrop-blur-sm rounded-lg p-3">
                            AI analysis is being processed...
                        </p>
                    </div>
                )}

                {/* Video Interview Scores Section */}
                {application.videoAnalysisReport && application.videoAnalysisReport.overallScore !== null && (
                    <div className="border-t border-slate-100 pt-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl">
                                    <Video className="h-5 w-5 text-purple-600" />
                                </div>
                                <span className="text-sm font-semibold text-slate-800">Video Interview Analysis</span>
                            </div>
                            <Badge variant={getScoreBadgeVariant(application.videoAnalysisReport.overallScore)} className="text-base font-bold px-3 py-1.5">
                                {application.videoAnalysisReport.overallScore}%
                            </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:scale-105 transition-transform duration-200">
                                <div className="font-bold text-blue-700 text-lg mb-1">
                                    {application.videoAnalysisReport.communicationScore || 'N/A'}%
                                </div>
                                <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Communication</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:scale-105 transition-transform duration-200">
                                <div className="font-bold text-amber-700 text-lg mb-1">
                                    {application.videoAnalysisReport.technicalScore || 'N/A'}%
                                </div>
                                <div className="text-xs text-amber-600 font-medium uppercase tracking-wide">Technical</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:scale-105 transition-transform duration-200">
                                <div className="font-bold text-emerald-700 text-lg mb-1">
                                    {application.videoAnalysisReport.articulationScore || 'N/A'}%
                                </div>
                                <div className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Articulation</div>
                            </div>
                        </div>
                        
                        {/* Skills Analysis */}
                        {application.skillsGapAnalysis && (
                            <div className="space-y-4 bg-slate-50 rounded-xl p-4">
                                {application.skillsGapAnalysis.matched && application.skillsGapAnalysis.matched.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">Matched Skills:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {application.skillsGapAnalysis.matched.map((skill, idx) => (
                                                <span key={idx} className="bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-emerald-200 transition-colors duration-200">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {application.skillsGapAnalysis.missing && application.skillsGapAnalysis.missing.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">Areas for Development:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {application.skillsGapAnalysis.missing.map((skill, idx) => (
                                                <span key={idx} className="bg-rose-100 text-rose-800 border border-rose-200 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-rose-200 transition-colors duration-200">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Tracker */}
                <div className="pt-2">
                    <ApplicationProgressTracker application={application} />
                </div>
            </CardContent>
            
            {/* Action Buttons Section */}
            <div className="p-6 pt-0 mt-auto">
                {/* Condition to Start Quiz */}
                {application.screeningStage === 'quiz_pending' && (
                    <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        onClick={() => navigate(`/candidate/quiz/${application._id}`)}
                    >
                        <Target className="h-5 w-5 mr-2" />
                        Start Skills Assessment
                    </Button>
                )}

                {/* Condition to Start Interview (After successful quiz) */}
                {application.screeningStage === 'video_pending' && (
                    <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        onClick={() => navigate(`/candidate/interview/${application._id}`)}
                    >
                        <Video className="h-5 w-5" />
                        Start Video Interview
                    </Button>
                )}

                {/* Condition to Check Interview Analysis (After video interview completed) */}
                {application.videoInterviewCompletedAt && (
                    <Button
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        onClick={() => {
                            setSelectedApplicationForAnalysis(application);
                            setShowAnalysisModal(true);
                        }}
                    >
                        <BarChart2 className="h-5 w-5" />
                        Check Interview Analysis
                    </Button>
                )}

                {/* Condition for Failed Quiz */}
                {application.screeningStage === 'quiz_failed' && (
                    <Alert variant="destructive" className="border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle className="font-semibold">Assessment Failed</AlertTitle>
                        <AlertDescription>
                            You did not meet the requirements for this stage.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </Card>
    );

    const filterApplications = (status) => {
        if (status === 'all') return applications;
        return applications.filter(app => app.status === status);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="mt-6 text-slate-700 font-medium">Loading your applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-10">
            {/* Header Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                        <Briefcase className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            My Applications
                        </h1>
                        <p className="text-slate-600 mt-2 text-lg">Track and manage your job applications with AI-powered insights</p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-8 mb-8">
                <Card className="bg-white/70 backdrop-blur-xl border-white/20 hover:bg-white/90 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Total Applied</CardTitle>
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-xl border-white/20 hover:bg-white/90 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Pending</CardTitle>
                        <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors duration-200">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-xl border-white/20 hover:bg-white/90 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Under Review</CardTitle>
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{stats.reviewed}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-xl border-white/20 hover:bg-white/90 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Shortlisted</CardTitle>
                        <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors duration-200">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">{stats.shortlisted}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-xl border-white/20 hover:bg-white/90 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Rejected</CardTitle>
                        <div className="flex items-center justify-center w-10 h-10 bg-rose-100 rounded-xl group-hover:bg-rose-200 transition-colors duration-200">
                            <XCircle className="h-5 w-5 text-rose-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-rose-600">{stats.rejected}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-xl border-white/20 hover:bg-white/90 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Avg. Match</CardTitle>
                        <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors duration-200">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-600">{stats.averageScore}%</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-xl border-white/20 hover:bg-white/90 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Interviews</CardTitle>
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors duration-200">
                            <MessageSquare className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">{stats.completedInterviews}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-xl border-white/20 hover:bg-white/90 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Avg. Interview</CardTitle>
                        <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-xl group-hover:bg-teal-200 transition-colors duration-200">
                            <Award className="h-5 w-5 text-teal-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-teal-600">{stats.averageInterviewScore}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Applications List with Tabs */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 rounded-2xl shadow-xl">
                <CardHeader className="border-b border-slate-100 pb-6">
                    <CardTitle className="text-2xl font-bold text-slate-900">Application Status</CardTitle>
                    <p className="text-slate-600">View and manage your application progress</p>
                </CardHeader>
                <CardContent className="p-6">
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 bg-slate-100/80 backdrop-blur-sm rounded-xl p-1">
                            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
                                All ({applications.length})
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
                                Pending ({stats.pending})
                            </TabsTrigger>
                            <TabsTrigger value="reviewed" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
                                Under Review ({stats.reviewed})
                            </TabsTrigger>
                            <TabsTrigger value="shortlisted" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
                                Shortlisted ({stats.shortlisted})
                            </TabsTrigger>
                            <TabsTrigger value="rejected" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
                                Rejected ({stats.rejected})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-8">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {applications.map(app => (
                                    <ApplicationCard key={app._id} application={app} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="pending" className="mt-8">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filterApplications('pending').map(app => (
                                    <ApplicationCard key={app._id} application={app} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="reviewed" className="mt-8">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filterApplications('reviewed').map(app => (
                                    <ApplicationCard key={app._id} application={app} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="shortlisted" className="mt-8">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filterApplications('shortlisted').map(app => (
                                    <ApplicationCard key={app._id} application={app} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="rejected" className="mt-8">
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filterApplications('rejected').map(app => (
                                    <ApplicationCard key={app._id} application={app} />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {applications.length === 0 && (
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 rounded-2xl shadow-xl text-center py-16 mt-8">
                    <CardContent>
                        <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mx-auto mb-6">
                            <Briefcase className="h-12 w-12 text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">No applications yet</h3>
                        <p className="text-slate-600 mb-8 text-lg max-w-md mx-auto">
                            Start applying to jobs to track your applications here and get AI-powered insights.
                        </p>
                        <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                            <Link to="/jobs">Browse Jobs</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Analysis Modal */}
            <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
                <DialogContent className="max-w-3xl p-8 bg-white/95 backdrop-blur-xl border-white/30 rounded-3xl shadow-2xl">
                    <DialogHeader className="border-b border-slate-100 pb-6 mb-6">
                        <DialogTitle className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <BarChart2 className="h-7 w-7 text-blue-600" />
                            Interview Analysis for {selectedApplicationForAnalysis?.job?.title}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 text-lg">
                            Detailed insights from your AI quiz and video interview performance.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedApplicationForAnalysis && (
                        <div className="space-y-8">
                            {/* Overall Score */}
                            {selectedApplicationForAnalysis.overallScore !== null && (
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-6 flex items-center justify-between shadow-md">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl">
                                            <Award className="h-7 w-7 text-blue-700" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-slate-800">Overall Performance Score</p>
                                            <p className="text-sm text-slate-600">Combined score from all assessments</p>
                                        </div>
                                    </div>
                                    <Badge variant={getScoreBadgeVariant(selectedApplicationForAnalysis.overallScore)} className="text-xl font-bold px-4 py-2">
                                        {selectedApplicationForAnalysis.overallScore}%
                                    </Badge>
                                </div>
                            )}

                            {/* AI Match Score */}
                            {selectedApplicationForAnalysis.aiMatchScore !== null && (
                                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 space-y-4">
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-xl">
                                                <Brain className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800">AI Resume Match Score</span>
                                        </div>
                                        <Badge variant={getScoreBadgeVariant(selectedApplicationForAnalysis.aiMatchScore)} className="text-base font-bold px-3 py-1.5">
                                            {selectedApplicationForAnalysis.aiMatchScore}%
                                        </Badge>
                                    </div>
                                    {selectedApplicationForAnalysis.aiJustification && (
                                        <p className="text-sm text-slate-700 leading-relaxed bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40">
                                            {selectedApplicationForAnalysis.aiJustification}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Quiz Score */}
                            {selectedApplicationForAnalysis.quizScore !== null && (
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5 space-y-4">
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl">
                                            <ClipboardList className="h-5 w-5 text-green-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-800">Skills Quiz Score</span>
                                        <Badge variant={getScoreBadgeVariant(selectedApplicationForAnalysis.quizScore)} className="text-base font-bold px-3 py-1.5">
                                            {selectedApplicationForAnalysis.quizScore}%
                                        </Badge>
                                    </div>
                                    {selectedApplicationForAnalysis.quizResults && selectedApplicationForAnalysis.quizResults.length > 0 && (
                                        <div className="text-sm text-slate-700 leading-relaxed bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40">
                                            <p className="font-semibold mb-2">Quiz Details:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Correct Answers: {selectedApplicationForAnalysis.quizResults.filter(r => r.isCorrect).length}</li>
                                                <li>Total Questions: {selectedApplicationForAnalysis.quizResults.length}</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Video Interview Analysis */}
                            {selectedApplicationForAnalysis.videoAnalysisReport && selectedApplicationForAnalysis.videoAnalysisReport.overallScore !== null && (
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl">
                                                <Video className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800">Video Interview Performance</span>
                                        </div>
                                        <Badge variant={getScoreBadgeVariant(selectedApplicationForAnalysis.videoAnalysisReport.overallScore)} className="text-base font-bold px-3 py-1.5">
                                            {selectedApplicationForAnalysis.videoAnalysisReport.overallScore}%
                                        </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-white/60 rounded-xl border border-slate-200">
                                            <div className="font-bold text-blue-700 text-lg mb-1">
                                                {selectedApplicationForAnalysis.videoAnalysisReport.communicationScore || 'N/A'}%
                                            </div>
                                            <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Communication</div>
                                        </div>
                                        <div className="text-center p-4 bg-white/60 rounded-xl border border-slate-200">
                                            <div className="font-bold text-amber-700 text-lg mb-1">
                                                {selectedApplicationForAnalysis.videoAnalysisReport.technicalScore || 'N/A'}%
                                            </div>
                                            <div className="text-xs text-amber-600 font-medium uppercase tracking-wide">Technical</div>
                                        </div>
                                        <div className="text-center p-4 bg-white/60 rounded-xl border border-slate-200">
                                            <div className="font-bold text-emerald-700 text-lg mb-1">
                                                {selectedApplicationForAnalysis.videoAnalysisReport.confidenceScore || 'N/A'}%
                                            </div>
                                            <div className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Confidence</div>
                                        </div>
                                    </div>

                                    {selectedApplicationForAnalysis.videoAnalysisReport.feedback && (
                                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40">
                                            <p className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-600" /> AI Feedback:</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">{selectedApplicationForAnalysis.videoAnalysisReport.feedback}</p>
                                        </div>
                                    )}

                                    {selectedApplicationForAnalysis.videoAnalysisReport.redFlags && selectedApplicationForAnalysis.videoAnalysisReport.redFlags.length > 0 && (
                                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                                            <p className="font-semibold text-rose-800 mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-rose-600" /> Red Flags Detected:</p>
                                            <ul className="list-disc list-inside text-sm text-rose-700">
                                                {selectedApplicationForAnalysis.videoAnalysisReport.redFlags.map((flag, idx) => (
                                                    <li key={idx}>{flag}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {selectedApplicationForAnalysis.videoAnalysisReport.transcripts && selectedApplicationForAnalysis.videoAnalysisReport.transcripts.length > 0 && (
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                                            <p className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Mic className="h-4 w-4 text-slate-600" /> Interview Transcripts:</p>
                                            <div className="space-y-3 text-sm text-slate-700">
                                                {selectedApplicationForAnalysis.videoAnalysisReport.transcripts.map((t, idx) => (
                                                    <div key={idx} className="border-b border-slate-100 pb-2 last:border-b-0">
                                                        <p className="font-medium">Q: {t.question}</p>
                                                        <p>A: {t.answer}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Skills Gap Analysis */}
                            {selectedApplicationForAnalysis.skillsGapAnalysis && (
                                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-xl">
                                            <Target className="h-5 w-5 text-teal-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-800">Skills Gap Analysis</span>
                                    </div>
                                    {selectedApplicationForAnalysis.skillsGapAnalysis.matched && selectedApplicationForAnalysis.skillsGapAnalysis.matched.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">Matched Skills:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedApplicationForAnalysis.skillsGapAnalysis.matched.map((skill, idx) => (
                                                    <span key={idx} className="bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-emerald-200 transition-colors duration-200">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedApplicationForAnalysis.skillsGapAnalysis.missing && selectedApplicationForAnalysis.skillsGapAnalysis.missing.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">Areas for Development:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedApplicationForAnalysis.skillsGapAnalysis.missing.map((skill, idx) => (
                                                    <span key={idx} className="bg-rose-100 text-rose-800 border border-rose-200 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-rose-200 transition-colors duration-200">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {(!selectedApplicationForAnalysis.skillsGapAnalysis.matched || selectedApplicationForAnalysis.skillsGapAnalysis.matched.length === 0) &&
                                     (!selectedApplicationForAnalysis.skillsGapAnalysis.missing || selectedApplicationForAnalysis.skillsGapAnalysis.missing.length === 0) && (
                                        <p className="text-sm text-slate-600">No detailed skills analysis available yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CandidateDashboard;