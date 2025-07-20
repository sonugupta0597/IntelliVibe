import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
    User, 
    Calendar, 
    Clock, 
    Award, 
    TrendingUp, 
    AlertTriangle,
    MessageSquare,
    Code,
    Shield,
    Download,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

const VideoInterviewReport = ({ applicationId, onClose }) => {
    const { userInfo } = useAuth();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (userInfo) {
            fetchReport();
        }
    }, [applicationId, userInfo]);

    const fetchReport = async () => {
        if (!userInfo?.token) {
            setError('Authentication required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/reports/video-interview/${applicationId}`, {
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch report');
            }

            const data = await response.json();
            setReport(data.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async (format = 'json') => {
        try {
            const response = await fetch(`http://localhost:5001/api/reports/export/video-interview/${applicationId}?format=${format}`, {
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`
                }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `video-interview-report-${applicationId}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 65) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getRecommendationIcon = (recommendation) => {
        if (recommendation.includes('Highly recommended')) return <CheckCircle className="text-green-600" />;
        if (recommendation.includes('Not recommended')) return <XCircle className="text-red-600" />;
        return <AlertCircle className="text-yellow-600" />;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading interview report...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg max-w-md">
                    <div className="text-red-600 text-center">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Error Loading Report </h3>
                        <p className="text-sm text-gray-600 mb-4">{error}</p>
                        <button



                            onClick={onClose}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">AI Video Interview Report</h2>
                            <div className="flex items-center space-x-4 text-blue-100">
                                <div className="flex items-center">
                                    <User className="h-4 w-4 mr-1" />
                                    {report.candidateInfo.name}
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {new Date(report.candidateInfo.applicationDate).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => downloadReport('json')}
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg flex items-center"
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Export
                            </button>
                            <button
                                onClick={onClose}
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'Overview', icon: Eye },
                            { id: 'performance', label: 'Performance', icon: TrendingUp },
                            { id: 'transcript', label: 'Transcript', icon: MessageSquare },
                            { id: 'insights', label: 'AI Insights', icon: Code },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="h-4 w-4 mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Score Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Overall Score</p>
                                            <p className={`text-2xl font-bold ${getScoreColor(report.interviewMetrics.overallScore)}`}>
                                                {report.interviewMetrics.overallScore}%
                                            </p>
                                        </div>
                                        <Award className={`h-8 w-8 ${getScoreColor(report.interviewMetrics.overallScore)}`} />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Communication</p>
                                            <p className={`text-2xl font-bold ${getScoreColor(report.interviewMetrics.communicationScore)}`}>
                                                {report.interviewMetrics.communicationScore}%
                                            </p>
                                        </div>
                                        <MessageSquare className={`h-8 w-8 ${getScoreColor(report.interviewMetrics.communicationScore)}`} />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Technical</p>
                                            <p className={`text-2xl font-bold ${getScoreColor(report.interviewMetrics.technicalScore)}`}>
                                                {report.interviewMetrics.technicalScore}%
                                            </p>
                                        </div>
                                        <Code className={`h-8 w-8 ${getScoreColor(report.interviewMetrics.technicalScore)}`} />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Confidence</p>
                                            <p className={`text-2xl font-bold ${getScoreColor(report.interviewMetrics.confidenceScore)}`}>
                                                {report.interviewMetrics.confidenceScore}%
                                            </p>
                                        </div>
                                        <Shield className={`h-8 w-8 ${getScoreColor(report.interviewMetrics.confidenceScore)}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Interview Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4">Interview Details</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                            <span className="text-sm">Duration: {report.interviewMetrics.duration} minutes</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                            <span className="text-sm">Completed: {new Date(report.interviewMetrics.completedAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4">Job Details</h3>
                                    <div className="space-y-2">
                                        <p className="text-sm"><strong>Position:</strong> {report.jobInfo.title}</p>
                                        <p className="text-sm"><strong>Company:</strong> {report.jobInfo.companyName}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {(report.jobInfo.requiredSkills || []).map((skill, index) => (
                                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendation */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    {getRecommendationIcon(report.overallAssessment.recommendation)}
                                    <h3 className="text-lg font-semibold ml-2">Hiring Recommendation</h3>
                                </div>
                                <p className="text-gray-700 mb-3">{report.overallAssessment.recommendation}</p>
                                <p className="text-sm text-gray-600"><strong>Next Steps:</strong> {report.overallAssessment.nextSteps}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div className="space-y-6">
                            {/* Score Breakdown */}
                            <div className="bg-white border rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
                                <div className="space-y-4">
                                    {Object.entries(report.aiInsights.scoreBreakdown || {}).map(([key, data]) => (
                                        <div key={key}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium capitalize">{key}</span>
                                                <span className={`text-sm font-bold ${getScoreColor(data?.score || 0)}`}>
                                                    {data?.score || 0}% (Weight: {data?.weight || 0}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full ${
                                                        (data?.score || 0) >= 80 ? 'bg-green-500' :
                                                        (data?.score || 0) >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${data?.score || 0}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{data?.description || 'No description available'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Strengths and Weaknesses */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-green-800 mb-4">Strengths</h3>
                                    <ul className="space-y-2">
                                        {(report.performanceAnalysis.strengths || []).map((strength, index) => (
                                            <li key={index} className="flex items-start">
                                                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-green-700">{strength}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-red-800 mb-4">Areas for Improvement</h3>
                                    <ul className="space-y-2">
                                        {(report.performanceAnalysis.weaknesses || []).map((weakness, index) => (
                                            <li key={index} className="flex items-start">
                                                <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-red-700">{weakness}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Red Flags */}
                            {(report.performanceAnalysis.redFlags || []).length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-red-800 mb-4">Red Flags</h3>
                                    <ul className="space-y-2">
                                        {(report.performanceAnalysis.redFlags || []).map((flag, index) => (
                                            <li key={index} className="flex items-start">
                                                <XCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-red-700">{flag}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Comparison Data */}
                            {report.aiInsights.comparisonData && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Candidate Comparison</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">{report.aiInsights.comparisonData.percentile}th</p>
                                            <p className="text-xs text-gray-600">Percentile</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">#{report.aiInsights.comparisonData.ranking}</p>
                                            <p className="text-xs text-gray-600">Ranking</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">{report.aiInsights.comparisonData.averageScore}%</p>
                                            <p className="text-xs text-gray-600">Avg Score</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">{report.aiInsights.comparisonData.totalCandidates}</p>
                                            <p className="text-xs text-gray-600">Total Candidates</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'transcript' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Interview Transcript</h3>
                            {(report.questionAndAnswers || []).length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No transcript data available</p>
                                </div>
                            ) : (
                                (report.questionAndAnswers || []).map((qa, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="mb-3">
                                        <h4 className="font-medium text-blue-600 mb-2">Question {index + 1}</h4>
                                        <p className="text-gray-700 bg-blue-50 p-3 rounded">{qa.question}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-green-600 mb-2">Answer</h4>
                                        <p className="text-gray-700 bg-green-50 p-3 rounded">{qa.answer}</p>
                                        <div className="flex items-center mt-2 text-sm text-gray-500">
                                            <Clock className="h-4 w-4 mr-1" />
                                            Duration: {qa.duration || 'N/A'} seconds
                                        </div>
                                    </div>
                                </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            {/* AI Feedback */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-purple-800 mb-4">AI Analysis Feedback</h3>
                                <p className="text-gray-700 leading-relaxed">{report.aiInsights.feedback}</p>
                            </div>

                            {/* Key Observations */}
                            <div className="bg-gray-50 border rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Key Observations</h3>
                                <ul className="space-y-2">
                                    {(report.aiInsights.keyObservations || []).map((observation, index) => (
                                        <li key={index} className="flex items-start">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                            <span className="text-sm text-gray-700">{observation}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Recommendations */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-yellow-800 mb-4">Recommendations</h3>
                                <ul className="space-y-2">
                                    {(report.performanceAnalysis.recommendations || []).map((rec, index) => (
                                        <li key={index} className="flex items-start">
                                            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-yellow-700">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default VideoInterviewReport;