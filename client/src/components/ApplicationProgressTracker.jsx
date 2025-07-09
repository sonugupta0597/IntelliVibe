import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

const ApplicationProgressTracker = ({ application }) => {
    const getStageInfo = (stage) => {
        const stageInfo = {
            'resume_uploaded': {
                title: 'Resume Uploaded',
                description: 'Your resume has been uploaded and is being processed',
                icon: '📄',
                color: 'blue'
            },
            'resume_screening': {
                title: 'AI Resume Analysis',
                description: 'AI is analyzing your resume against job requirements',
                icon: '🤖',
                color: 'blue'
            },
            'resume_rejected': {
                title: 'Resume Screening Failed',
                description: 'Your resume did not meet the minimum requirements',
                icon: '❌',
                color: 'red'
            },
            'quiz_pending': {
                title: 'Skills Assessment Pending',
                description: 'You qualify for the technical skills assessment',
                icon: '📝',
                color: 'green'
            },
            'quiz_in_progress': {
                title: 'Skills Assessment in Progress',
                description: 'Complete the technical skills assessment',
                icon: '⏳',
                color: 'yellow'
            },
            'quiz_failed': {
                title: 'Skills Assessment Failed',
                description: 'You did not pass the technical skills assessment',
                icon: '❌',
                color: 'red'
            },
            'video_pending': {
                title: 'Video Interview Pending',
                description: 'You qualify for the AI-powered video interview',
                icon: '🎥',
                color: 'green'
            },
            'video_in_progress': {
                title: 'Video Interview in Progress',
                description: 'Complete the AI-powered video interview',
                icon: '⏳',
                color: 'yellow'
            },
            'video_completed': {
                title: 'Video Interview Completed',
                description: 'Your video interview has been analyzed',
                icon: '✅',
                color: 'green'
            },
            'video_failed': {
                title: 'Video Interview Failed',
                description: 'You did not pass the video interview',
                icon: '❌',
                color: 'red'
            },
            'final_review': {
                title: 'Final Review',
                description: 'Your application is under final review',
                icon: '🔍',
                color: 'blue'
            },
            'selected_for_employer': {
                title: 'Selected for Employer Interview',
                description: 'Congratulations! You\'ve been selected for the final interview',
                icon: '🎉',
                color: 'green'
            },
            'employer_scheduled': {
                title: 'Employer Interview Scheduled',
                description: 'Your interview with the employer has been scheduled',
                icon: '📅',
                color: 'green'
            },
            'employer_interview_completed': {
                title: 'Employer Interview Completed',
                description: 'Your interview with the employer has been completed',
                icon: '✅',
                color: 'blue'
            },
            'hired': {
                title: 'Hired',
                description: 'Congratulations! You have been hired',
                icon: '🎊',
                color: 'green'
            },
            'manual_review_needed': {
                title: 'Manual Review Required',
                description: 'Your application requires manual review',
                icon: '👤',
                color: 'orange'
            }
        };
        
        return stageInfo[stage] || {
            title: 'Unknown Stage',
            description: 'Application status is unclear',
            icon: '❓',
            color: 'gray'
        };
    };

    const getProgressPercentage = (stage) => {
        const stageProgress = {
            'resume_uploaded': 10,
            'resume_screening': 20,
            'resume_rejected': 100,
            'quiz_pending': 30,
            'quiz_in_progress': 40,
            'quiz_failed': 100,
            'video_pending': 50,
            'video_in_progress': 60,
            'video_completed': 70,
            'video_failed': 100,
            'final_review': 80,
            'selected_for_employer': 85,
            'employer_scheduled': 90,
            'employer_interview_completed': 95,
            'hired': 100,
            'manual_review_needed': 25
        };
        
        return stageProgress[stage] || 0;
    };

    const getStageStatus = (stage, currentStage) => {
        const stageOrder = [
            'resume_uploaded',
            'resume_screening',
            'quiz_pending',
            'quiz_in_progress',
            'video_pending',
            'video_in_progress',
            'video_completed',
            'final_review',
            'selected_for_employer',
            'employer_scheduled',
            'employer_interview_completed',
            'hired'
        ];

        const currentIndex = stageOrder.indexOf(currentStage);
        const stageIndex = stageOrder.indexOf(stage);

        if (stageIndex === -1) return 'unknown';
        if (currentIndex === -1) return 'pending';

        if (stageIndex < currentIndex) return 'completed';
        if (stageIndex === currentIndex) return 'current';
        return 'pending';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'current':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-600';
            case 'current':
                return 'text-blue-600';
            case 'failed':
                return 'text-red-600';
            default:
                return 'text-gray-400';
        }
    };

    const currentStageInfo = getStageInfo(application.screeningStage);
    const progressPercentage = getProgressPercentage(application.screeningStage);

    const stages = [
        { key: 'resume_uploaded', title: 'Resume Upload' },
        { key: 'quiz_pending', title: 'Skills Assessment' },
        { key: 'video_pending', title: 'Video Interview' },
        { key: 'selected_for_employer', title: 'Employer Interview' },
        { key: 'hired', title: 'Hired' }
    ];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{currentStageInfo.icon}</span>
                    Application Progress
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Current Stage Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">{currentStageInfo.icon}</span>
                        <div>
                            <h4 className="font-semibold text-blue-900">{currentStageInfo.title}</h4>
                            <p className="text-sm text-blue-700 mt-1">{currentStageInfo.description}</p>
                        </div>
                    </div>
                </div>

                {/* Stage Timeline */}
                <div className="space-y-4">
                    <h4 className="font-semibold">Application Timeline</h4>
                    <div className="space-y-3">
                        {stages.map((stage, index) => {
                            const status = getStageStatus(stage.key, application.screeningStage);
                            const isLast = index === stages.length - 1;
                            
                            return (
                                <div key={stage.key} className="flex items-start gap-3">
                                    <div className="flex flex-col items-center">
                                        {getStatusIcon(status)}
                                        {!isLast && (
                                            <div className={`w-0.5 h-8 mt-1 ${
                                                status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                                            }`} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`flex items-center gap-2 ${getStatusColor(status)}`}>
                                            <span className="font-medium">{stage.title}</span>
                                            {status === 'completed' && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Completed
                                                </Badge>
                                            )}
                                            {status === 'current' && (
                                                <Badge variant="default" className="text-xs">
                                                    Current
                                                </Badge>
                                            )}
                                        </div>
                                        {status === 'completed' && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {stage.key === 'resume_uploaded' && application.aiMatchScore && 
                                                    `AI Score: ${application.aiMatchScore}%`
                                                }
                                                {stage.key === 'quiz_pending' && application.quizScore && 
                                                    `Quiz Score: ${application.quizScore}%`
                                                }
                                                {stage.key === 'video_pending' && application.videoAnalysisReport?.overallScore && 
                                                    `Video Score: ${application.videoAnalysisReport.overallScore}%`
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Scores Summary */}
                {(application.aiMatchScore || application.quizScore || application.videoAnalysisReport?.overallScore) && (
                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">Your Scores</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {application.aiMatchScore && (
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-lg font-bold text-blue-600">{application.aiMatchScore}%</div>
                                    <div className="text-xs text-muted-foreground">Resume Analysis</div>
                                </div>
                            )}
                            {application.quizScore && (
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-lg font-bold text-green-600">{application.quizScore}%</div>
                                    <div className="text-xs text-muted-foreground">Skills Assessment</div>
                                </div>
                            )}
                            {application.videoAnalysisReport?.overallScore && (
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-lg font-bold text-purple-600">{application.videoAnalysisReport.overallScore}%</div>
                                    <div className="text-xs text-muted-foreground">Video Interview</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Employer Interview Details */}
                {application.employerInterview && (
                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3 text-white">Employer Interview Details</h4>
                        <div className="backdrop-blur bg-black/40 border border-pink-400 rounded-lg p-4 text-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-pink-300">Date:</span> {new Date(application.employerInterview.scheduledDate).toLocaleDateString()}
                                </div>
                                <div>
                                    <span className="font-medium text-pink-300">Time:</span> {application.employerInterview.scheduledTime}
                                </div>
                                <div>
                                    <span className="font-medium text-pink-300">Type:</span> {application.employerInterview.interviewType}
                                </div>
                                <div>
                                    <span className="font-medium text-pink-300">Status:</span> 
                                    <Badge variant={application.employerInterview.status === 'completed' ? 'default' : 'secondary'} className="ml-2">
                                        {application.employerInterview.status}
                                    </Badge>
                                </div>
                                {application.employerInterview.employerContact && (
                                    <>
                                        <div>
                                            <span className="font-medium text-pink-300">Contact:</span> {application.employerInterview.employerContact.name}
                                        </div>
                                        <div>
                                            <span className="font-medium text-pink-300">Email:</span> {application.employerInterview.employerContact.email}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ApplicationProgressTracker; 