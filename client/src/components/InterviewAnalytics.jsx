import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Chart as ChartJS, 
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { 
    TrendingUp, 
    MessageSquare, 
    Code, 
    UserCheck,
    Target,
    Award
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

const InterviewAnalytics = ({ applications }) => {
    // Filter applications that have completed video interviews
    const completedInterviews = applications.filter(app => 
        app.videoAnalysisReport && 
        app.videoAnalysisReport.overallScore !== null &&
        app.screeningStage === 'video_completed'
    );

    // Development mode: Add sample data if no real interviews exist
    const hasRealData = completedInterviews.length > 0;
    const sampleInterviews = [
        {
            _id: 'sample1',
            job: { title: 'Frontend Developer', companyName: 'Tech Corp' },
            videoAnalysisReport: {
                overallScore: 85,
                communicationScore: 88,
                technicalScore: 82,
                confidenceScore: 90,
                feedback: 'Strong technical knowledge with excellent communication skills. Shows confidence in problem-solving approaches.'
            }
        },
        {
            _id: 'sample2',
            job: { title: 'Backend Engineer', companyName: 'Startup Inc' },
            videoAnalysisReport: {
                overallScore: 92,
                communicationScore: 85,
                technicalScore: 95,
                confidenceScore: 88,
                feedback: 'Exceptional technical depth with clear articulation of complex concepts. Demonstrates strong problem-solving abilities.'
            }
        },
        {
            _id: 'sample3',
            job: { title: 'Full Stack Developer', companyName: 'Enterprise Ltd' },
            videoAnalysisReport: {
                overallScore: 78,
                communicationScore: 75,
                technicalScore: 80,
                confidenceScore: 82,
                feedback: 'Good technical foundation with room for improvement in communication clarity. Shows potential for growth.'
            }
        }
    ];

    const displayInterviews = hasRealData ? completedInterviews : sampleInterviews;

    if (displayInterviews.length === 0) {
        return (
            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Interview Analytics
                    </CardTitle>
                    <CardDescription>
                        Complete video interviews to see detailed analytics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No completed interviews yet</p>
                        <p className="text-sm">Your interview performance analytics will appear here</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calculate average scores across all interviews
    const averageScores = {
        overall: Math.round(
            displayInterviews.reduce((sum, app) => sum + app.videoAnalysisReport.overallScore, 0) / 
            displayInterviews.length
        ),
        communication: Math.round(
            displayInterviews.reduce((sum, app) => sum + (app.videoAnalysisReport.communicationScore || 0), 0) / 
            displayInterviews.length
        ),
        technical: Math.round(
            displayInterviews.reduce((sum, app) => sum + (app.videoAnalysisReport.technicalScore || 0), 0) / 
            displayInterviews.length
        ),
        confidence: Math.round(
            displayInterviews.reduce((sum, app) => sum + (app.videoAnalysisReport.confidenceScore || 0), 0) / 
            displayInterviews.length
        )
    };

    // Prepare data for pie chart (overall performance distribution)
    const performanceData = {
        labels: ['Excellent (90-100)', 'Good (80-89)', 'Average (70-79)', 'Below Average (60-69)', 'Poor (<60)'],
        datasets: [{
            data: [
                displayInterviews.filter(app => app.videoAnalysisReport.overallScore >= 90).length,
                displayInterviews.filter(app => app.videoAnalysisReport.overallScore >= 80 && app.videoAnalysisReport.overallScore < 90).length,
                displayInterviews.filter(app => app.videoAnalysisReport.overallScore >= 70 && app.videoAnalysisReport.overallScore < 80).length,
                displayInterviews.filter(app => app.videoAnalysisReport.overallScore >= 60 && app.videoAnalysisReport.overallScore < 70).length,
                displayInterviews.filter(app => app.videoAnalysisReport.overallScore < 60).length,
            ],
            backgroundColor: [
                '#10b981', // Green
                '#3b82f6', // Blue
                '#f59e0b', // Yellow
                '#f97316', // Orange
                '#ef4444', // Red
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
        }]
    };

    // Prepare data for bar chart (detailed scores by job)
    const jobScoresData = {
        labels: displayInterviews.map(app => app.job?.title || 'Unknown Job').slice(0, 8), // Limit to 8 jobs for readability
        datasets: [
            {
                label: 'Overall Score',
                data: displayInterviews.slice(0, 8).map(app => app.videoAnalysisReport.overallScore),
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1,
            },
            {
                label: 'Communication',
                data: displayInterviews.slice(0, 8).map(app => app.videoAnalysisReport.communicationScore || 0),
                backgroundColor: '#10b981',
                borderColor: '#059669',
                borderWidth: 1,
            },
            {
                label: 'Technical',
                data: displayInterviews.slice(0, 8).map(app => app.videoAnalysisReport.technicalScore || 0),
                backgroundColor: '#f59e0b',
                borderColor: '#d97706',
                borderWidth: 1,
            },
            {
                label: 'Confidence',
                data: displayInterviews.slice(0, 8).map(app => app.videoAnalysisReport.confidenceScore || 0),
                backgroundColor: '#8b5cf6',
                borderColor: '#7c3aed',
                borderWidth: 1,
            }
        ]
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed} interviews (${percentage}%)`;
                    }
                }
            }
        }
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y}%`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                }
            }
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-blue-600';
        if (score >= 70) return 'text-yellow-600';
        if (score >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    const getScoreBadgeVariant = (score) => {
        if (score >= 90) return 'default';
        if (score >= 80) return 'secondary';
        if (score >= 70) return 'outline';
        if (score >= 60) return 'outline';
        return 'destructive';
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-muted-foreground">
                        Performance insights from {displayInterviews.length} completed video interview{displayInterviews.length !== 1 ? 's' : ''}
                        {!hasRealData && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Demo Data
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {!hasRealData && (
                        <Badge variant="secondary" className="text-xs">
                            Demo Mode
                        </Badge>
                    )}
                    <Badge variant="outline" className="text-sm">
                        {displayInterviews.length} Interview{displayInterviews.length !== 1 ? 's' : ''}
                    </Badge>
                </div>
            </div>

            {/* Average Scores Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Overall</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getScoreColor(averageScores.overall)}`}>
                            {averageScores.overall}%
                        </div>
                        <Badge variant={getScoreBadgeVariant(averageScores.overall)} className="mt-1">
                            {averageScores.overall >= 90 ? 'Excellent' : 
                             averageScores.overall >= 80 ? 'Good' : 
                             averageScores.overall >= 70 ? 'Average' : 
                             averageScores.overall >= 60 ? 'Below Average' : 'Poor'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Communication</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getScoreColor(averageScores.communication)}`}>
                            {averageScores.communication}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Clarity & Expression
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Technical</CardTitle>
                        <Code className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getScoreColor(averageScores.technical)}`}>
                            {averageScores.technical}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Knowledge & Skills
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Confidence</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getScoreColor(averageScores.confidence)}`}>
                            {averageScores.confidence}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Self-Assurance
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart - Performance Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Distribution</CardTitle>
                        <CardDescription>
                            Breakdown of your interview scores across all completed interviews
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <Pie data={performanceData} options={pieChartOptions} />
                        </div>
                    </CardContent>
                </Card>

                {/* Bar Chart - Detailed Scores by Job */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Scores by Job</CardTitle>
                        <CardDescription>
                            Comparison of different scoring categories for each position
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <Bar data={jobScoresData} options={barChartOptions} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Interview Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Interview Details</CardTitle>
                    <CardDescription>
                        Detailed breakdown of your most recent video interviews
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {displayInterviews.slice(0, 5).map((app) => (
                            <div key={app._id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold">
                                            {app.job?.title || 'Unknown Position'}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {app.job?.companyName || 'Unknown Company'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-lg font-bold ${getScoreColor(app.videoAnalysisReport.overallScore)}`}>
                                            {app.videoAnalysisReport.overallScore}%
                                        </div>
                                        <Badge variant={getScoreBadgeVariant(app.videoAnalysisReport.overallScore)}>
                                            Overall
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="font-medium text-green-600">
                                            {app.videoAnalysisReport.communicationScore || 'N/A'}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">Communication</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-medium text-yellow-600">
                                            {app.videoAnalysisReport.technicalScore || 'N/A'}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">Technical</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-medium text-purple-600">
                                            {app.videoAnalysisReport.confidenceScore || 'N/A'}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">Confidence</div>
                                    </div>
                                </div>

                                {app.videoAnalysisReport.feedback && (
                                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                        <p className="text-sm">
                                            <span className="font-medium">Feedback:</span> {app.videoAnalysisReport.feedback}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InterviewAnalytics; 