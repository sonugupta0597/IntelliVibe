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
    ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CandidateDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        reviewed: 0,
        shortlisted: 0,
        rejected: 0,
        averageScore: 0
    });
    const { userInfo } = useAuth();

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
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">
                            {application.job?.title || <span className="text-red-500">[Job no longer available]</span>}
                        </CardTitle>
                        <CardDescription className="mt-1">
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
                    <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        <Badge variant={getStatusBadgeVariant(application.status)}>
                            {application.status}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* AI Score Section */}
                {application.aiMatchScore !== null && application.aiMatchScore !== undefined ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">AI Match Score</span>
                            <div className="flex items-center gap-2">
                                <Badge variant={getScoreBadgeVariant(application.aiMatchScore)}>
                                    {application.aiMatchScore}%
                                </Badge>
                                {application.aiMatchScore >= 70 && (
                                    <span className="text-xs text-green-600 font-medium">
                                        Strong Match
                                    </span>
                                )}
                            </div>
                        </div>
                        {application.aiJustification && (
                            <p className="text-xs text-muted-foreground">
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

                {/* Skills Gap Analysis */}
                {application.skillsGapAnalysis && (
                    <div className="border-t pt-3">
                        <p className="text-sm font-medium mb-2">Skills Analysis</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-green-600">
                                ✓ {application.skillsGapAnalysis.matched?.length || 0} skills matched
                            </div>
                            <div className="text-red-600">
                                ✗ {application.skillsGapAnalysis.missing?.length || 0} skills missing
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

                {/* Application Date */}
                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Applied {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                    <Button asChild variant="ghost" size="sm" disabled={!application.job?._id}>
                        <Link to={application.job?._id ? `/jobs/${application.job._id}` : "#"}>
                            View Job <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>

                {/* Status-specific messages */}
                {application.status === 'shortlisted' && (
                    <Alert className="mt-3">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Congratulations!</AlertTitle>
                        <AlertDescription>
                            You've been shortlisted! Expect to hear from the employer soon.
                        </AlertDescription>
                    </Alert>
                )}

                {application.status === 'rejected' && application.aiMatchScore < 50 && (
                    <Alert className="mt-3" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Application Unsuccessful</AlertTitle>
                        <AlertDescription>
                            Consider improving your skills in: {application.skillsGapAnalysis?.missing?.slice(0, 3).join(', ')}
                        </AlertDescription>
                    </Alert>
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
                <h1 className="text-3xl font-bold">My Applications</h1>
                <p className="text-muted-foreground mt-2">Track and manage your job applications</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-6">
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
                    <div className="grid gap-4 md:grid-cols-2">
                        {applications.map(app => (
                            <ApplicationCard key={app._id} application={app} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="pending" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {filterApplications('pending').map(app => (
                            <ApplicationCard key={app._id} application={app} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="reviewed" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {filterApplications('reviewed').map(app => (
                            <ApplicationCard key={app._id} application={app} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="shortlisted" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {filterApplications('shortlisted').map(app => (
                            <ApplicationCard key={app._id} application={app} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="rejected" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
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