import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
    MessageSquare
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
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'reviewed':
                return <Clock className="h-4 w-4 text-blue-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
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
        <Card className="relative flex flex-col bg-white/10 backdrop-blur-md shadow-2xl overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-pink-500/30 group" style={{ borderRadius: '1.5rem', boxShadow: '0 8px 32px 0 rgba(233,30,99,0.15), 0 1.5px 8px 0 rgba(156,39,176,0.10)' }}>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-300" style={{background: 'linear-gradient(120deg, #e91e63 0%, #9c27b0 100%)'}} />
            <CardHeader className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold text-white drop-shadow-lg">
                            {application.job?.title || <span className="text-red-500">[Job no longer available]</span>}
                        </CardTitle>
                        <CardDescription className="mt-1 text-pink-100">
                            <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-3 w-3" />
                                {application.job?.companyName || <span className="text-red-500">N/A</span>}
                            </div>
                            <div className="flex items-center gap-2 text-sm mt-1">
                                <MapPin className="h-3 w-3" />
                                {application.job?.location || <span className="text-red-500">N/A</span>}
                            </div>
                        </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {getStatusIcon(application.status)}
                        <Badge variant={getStatusBadgeVariant(application.status)} className="uppercase tracking-wide px-3 py-1 text-xs font-bold">
                            {application.status}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
                {/* AI Score Section */}
                {application.aiMatchScore !== null && application.aiMatchScore !== undefined ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">AI Match Score</span>
                            <div className="flex items-center gap-2">
                                <Badge variant={getScoreBadgeVariant(application.aiMatchScore)}>
                                    {application.aiMatchScore}%
                                </Badge>
                                {application.aiMatchScore >= 70 && (
                                    <span className="text-xs text-green-400 font-medium">
                                        Strong Match
                                    </span>
                                )}
                            </div>
                        </div>
                        {application.aiJustification && (
                            <p className="text-xs text-pink-100">
                                {application.aiJustification}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">AI Match Score</span>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                    Pending
                                </Badge>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            AI analysis is being processed...
                        </p>
                    </div>
                )}
                {/* Video Interview Scores Section */}
                {application.videoAnalysisReport && application.videoAnalysisReport.overallScore !== null && (
                    <div className="space-y-3 border-t border-pink-400/30 pt-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">Video Interview Analysis</span>
                            <Badge variant={getScoreBadgeVariant(application.videoAnalysisReport.overallScore)}>
                                {application.videoAnalysisReport.overallScore}%
                            </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center p-2 bg-blue-100/30 rounded">
                                <div className="font-semibold text-blue-200">
                                    {application.videoAnalysisReport.communicationScore || 'N/A'}%
                                </div>
                                <div className="text-blue-100">Communication</div>
                            </div>
                            <div className="text-center p-2 bg-yellow-100/30 rounded">
                                <div className="font-semibold text-yellow-200">
                                    {application.videoAnalysisReport.technicalScore || 'N/A'}%
                                </div>
                                <div className="text-yellow-100">Technical</div>
                            </div>
                            <div className="text-center p-2 bg-green-100/30 rounded">
                                <div className="font-semibold text-green-200">
                                    {application.videoAnalysisReport.articulationScore || 'N/A'}%
                                </div>
                                <div className="text-green-100">Articulation</div>
                            </div>
                        </div>
                        {/* Show matched skills as badges */}
                        {application.skillsGapAnalysis.matched && application.skillsGapAnalysis.matched.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {application.skillsGapAnalysis.matched.map((skill, idx) => (
                                    <span key={idx} className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs border border-green-300">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                        {/* Show missing skills as badges */}
                        {application.skillsGapAnalysis.missing && application.skillsGapAnalysis.missing.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {application.skillsGapAnalysis.missing.map((skill, idx) => (
                                    <span key={idx} className="bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs border border-red-300">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* Progress Tracker */}
                <div className="pt-2">
                    <ApplicationProgressTracker application={application} />
                </div>
                {/* Start Quiz Button */}
                {(application.screeningStage === 'quiz_pending' || application.status === 'Skills Assessment') && (
                    <Button
                        className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold px-6 py-2 rounded-lg shadow-lg hover:from-pink-600 hover:to-purple-700 hover:shadow-pink-500/40 transition-all duration-300 text-lg"
                        onClick={() => navigate(`/candidate/quiz/${application._id}`)}
                    >
                        Start Quiz
                    </Button>
                )}
            </CardContent>
        </Card>
    );

    const filterApplications = (status) => {
        if (status === 'all') return applications;
        return applications.filter(app => app.status === status);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading your applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mt-16">My Applications</h1>
                <p className="text-muted-foreground mt-2">Track and manage your job applications</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applied</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.shortlisted}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Match</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageScore}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{stats.completedInterviews}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Interview</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-600">{stats.averageInterviewScore}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Applications List with Tabs */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                    <TabsTrigger value="reviewed">Under Review ({stats.reviewed})</TabsTrigger>
                    <TabsTrigger value="shortlisted">Shortlisted ({stats.shortlisted})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-6 space-y-6">
                        {applications.map(app => (
                            <ApplicationCard key={app._id} application={app} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="pending" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-6 space-y-6">
                        {filterApplications('pending').map(app => (
                            <ApplicationCard key={app._id} application={app} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="reviewed" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-6 space-y-6">
                        {filterApplications('reviewed').map(app => (
                            <ApplicationCard key={app._id} application={app} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="shortlisted" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-6 space-y-6">
                        {filterApplications('shortlisted').map(app => (
                            <ApplicationCard key={app._id} application={app} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="rejected" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-6 space-y-6">
                        {filterApplications('rejected').map(app => (
                            <ApplicationCard key={app._id} application={app} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {applications.length === 0 && (
                <Card className="text-center py-12">
                    <CardContent>
                        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Start applying to jobs to track your applications here.
                        </p>
                        <Button asChild>
                            <Link to="/jobs">Browse Jobs</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CandidateDashboard;