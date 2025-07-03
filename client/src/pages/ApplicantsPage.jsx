import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
    ArrowLeft, ExternalLink, TrendingUp, Users, CheckCircle, 
    XCircle, Clock, AlertCircle, Mail, Filter, BarChart3,
    Zap, BrainCircuit
} from 'lucide-react';
import { motion } from 'framer-motion';

const ApplicantsPage = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [jobInfo, setJobInfo] = useState(null);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState('aiScore');
    const [filterBy, setFilterBy] = useState('all');
    const [selectedApplicants, setSelectedApplicants] = useState([]);
    const [showStats, setShowStats] = useState(false);
    const { userInfo } = useAuth();

    useEffect(() => {
        fetchApplicants();
    }, [jobId, userInfo]);

    const fetchApplicants = async () => {
        if (!userInfo) return;
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`http://localhost:5001/api/applications/job/${jobId}`, config);
            
            // Handle both old and new response formats
            if (Array.isArray(data)) {
                // Old format - just an array of applications
                setApplicants(data);
                // Try to get job info from the first application if available
                if (data.length > 0 && data[0].job) {
                    setJobInfo(data[0].job);
                }
            } else {
                // New format with job info and stats
                setApplicants(data.applications || []);
                setJobInfo(data.job || null);
                setStats(data.stats || null);
            }
        } catch (error) {
            console.error("Failed to fetch applicants:", error);
            setApplicants([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(
                `http://localhost:5001/api/applications/${applicationId}/status`, 
                { status: newStatus },
                config
            );
            
            setApplicants(applicants.map(app => 
                app._id === applicationId ? { ...app, status: newStatus } : app
            ));
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const handleBulkAction = async (status) => {
        if (selectedApplicants.length === 0) {
            alert('Please select at least one applicant');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.put(
                'http://localhost:5001/api/applications/bulk-update',
                { 
                    applicationIds: selectedApplicants, 
                    status: status,
                    jobId: jobId 
                },
                config
            );
            
            alert(data.message);
            setSelectedApplicants([]);
            fetchApplicants(); // Refresh the list
        } catch (error) {
            console.error("Failed to update applications:", error);
            alert('Failed to update applications');
        }
    };

    const toggleApplicantSelection = (applicationId) => {
        setSelectedApplicants(prev => 
            prev.includes(applicationId)
                ? prev.filter(id => id !== applicationId)
                : [...prev, applicationId]
        );
    };

    const selectAllApplicants = (checked) => {
        if (checked) {
            setSelectedApplicants(filteredAndSortedApplicants.map(app => app._id));
        } else {
            setSelectedApplicants([]);
        }
    };

    const getScoreBadgeVariant = (score) => {
        if (score >= 80) return 'default';
        if (score >= 60) return 'secondary';
        if (score >= 40) return 'outline';
        return 'destructive';
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

    // Filter applicants (with null check)
    const filteredApplicants = (applicants || []).filter(app => {
        if (filterBy === 'all') return true;
        if (filterBy === 'auto-qualified') return app.status === 'shortlisted' && app.autoProcessed;
        if (filterBy === 'auto-rejected') return app.status === 'rejected' && app.autoProcessed;
        if (filterBy === 'high-match') return app.aiMatchScore >= 70;
        return app.status === filterBy;
    });

    // Sort applicants (with null check)
    const filteredAndSortedApplicants = [...filteredApplicants].sort((a, b) => {
        if (sortBy === 'aiScore') {
            if (a.aiMatchScore === null) return 1;
            if (b.aiMatchScore === null) return -1;
            return b.aiMatchScore - a.aiMatchScore;
        } else {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading applicants...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-6"
        >
            <Link to="/employer/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>

            <div>
                <h1 className="text-3xl font-bold">Applicants for {jobInfo?.title}</h1>
                <p className="text-muted-foreground mt-2">
                    {jobInfo?.companyName} • Review and manage applications
                </p>
            </div>

            {/* Auto-Qualification Alert */}
            {stats && (stats.autoShortlisted > 0 || stats.autoRejected > 0) && (
                <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertTitle>AI Auto-Qualification Active</AlertTitle>
                    <AlertDescription>
                        {stats.autoShortlisted > 0 && `${stats.autoShortlisted} candidates auto-shortlisted. `}
                        {stats.autoRejected > 0 && `${stats.autoRejected} candidates auto-rejected. `}
                        Email notifications have been sent automatically.
                    </AlertDescription>
                </Alert>
            )}

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.averageScore || 0}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Auto-Qualified</CardTitle>
                        <BrainCircuit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.autoShortlisted || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats?.pendingReview || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Auto-Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.autoRejected || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Bulk Actions */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Select value={filterBy} onValueChange={setFilterBy}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Applicants</SelectItem>
                                    <SelectItem value="auto-qualified">Auto-Qualified</SelectItem>
                                    <SelectItem value="auto-rejected">Auto-Rejected</SelectItem>
                                    <SelectItem value="high-match">High Match (70%+)</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="aiScore">AI Match Score</SelectItem>
                                    <SelectItem value="date">Application Date</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedApplicants.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    {selectedApplicants.length} selected
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBulkAction('shortlisted')}
                                >
                                    Bulk Shortlist
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBulkAction('rejected')}
                                >
                                    Bulk Reject
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={selectedApplicants.length === filteredAndSortedApplicants.length && filteredAndSortedApplicants.length > 0}
                                            onCheckedChange={selectAllApplicants}
                                        />
                                    </TableHead>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>AI Analysis</TableHead>
                                    <TableHead>Skills Match</TableHead>
                                    <TableHead>Applied</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedApplicants.length > 0 ? (
                                    filteredAndSortedApplicants.map((app) => (
                                        <TableRow key={app._id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedApplicants.includes(app._id)}
                                                    onCheckedChange={() => toggleApplicantSelection(app._id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {app.candidate.firstName} {app.candidate.lastName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {app.candidate.email}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {app.aiMatchScore !== null ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={getScoreBadgeVariant(app.aiMatchScore)}>
                                                                {app.aiMatchScore}%
                                                            </Badge>
                                                            {app.aiMatchScore >= 70 && (
                                                                <span className="text-xs text-green-600 font-medium">
                                                                    Strong Match
                                                                </span>
                                                            )}
                                                            {app.autoProcessed && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Zap className="h-3 w-3 mr-1" />
                                                                    Auto
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground max-w-xs">
                                                            {app.aiJustification}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="animate-pulse">
                                                        Analyzing...
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {app.skillsGapAnalysis && (
                                                    <div className="text-xs space-y-1">
                                                        <p className="text-green-600">
                                                            ✓ {app.skillsGapAnalysis.matched?.length || 0} matched
                                                        </p>
                                                        <p className="text-red-600">
                                                            ✗ {app.skillsGapAnalysis.missing?.length || 0} missing
                                                        </p>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(app.status)}
                                                    <Select
                                                        value={app.status}
                                                        onValueChange={(value) => handleStatusChange(app._id, value)}
                                                    >
                                                        <SelectTrigger className="w-[120px] h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="reviewed">Reviewed</SelectItem>
                                                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                                            <SelectItem value="rejected">Rejected</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="ghost" size="sm">
                                                    <a 
                                                        href={`http://localhost:5001/${app.resumeUrl}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                    >
                                                        Resume <ExternalLink className="ml-2 h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="7" className="text-center h-24">
                                            No applicants found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ApplicantsPage;