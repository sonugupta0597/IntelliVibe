import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import VideoInterviewReport from './VideoInterviewReport';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import {
    FileText,
    Users,
    TrendingUp,
    Award,
    AlertTriangle,
    Download,
    Eye,
    Filter,
    Search,
    RefreshCw,
    Calendar,
    Target,
    Zap
} from 'lucide-react';

const ReportDashboard = ({ jobId }) => {
    const { userInfo } = useAuth();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showVideoReport, setShowVideoReport] = useState(false);
    const [filters, setFilters] = useState({
        stage: '',
        sortBy: 'overallScore',
        order: 'desc',
        searchTerm: ''
    });

    useEffect(() => {
        if (userInfo) {
            fetchReportData();
        }
    }, [jobId, filters, userInfo]);

    const fetchReportData = async () => {
        if (!userInfo?.token) {
            setError('Authentication required');
            setLoading(false);
            return;
        }

        try {
            const queryParams = new URLSearchParams({
                stage: filters.stage,
                sortBy: filters.sortBy,
                order: filters.order
            }).toString();

            const response = await fetch(`http://localhost:5001/api/reports/applications/${jobId}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch report data');
            }

            const data = await response.json();
            setReportData(data.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const openVideoReport = (applicationId) => {
        setSelectedApplication(applicationId);
        setShowVideoReport(true);
    };

    const closeVideoReport = () => {
        setShowVideoReport(false);
        setSelectedApplication(null);
    };

    const exportData = async (format = 'json') => {
        try {
            const response = await fetch(`http://localhost:5001/api/reports/export/applications/${jobId}?format=${format}`, {
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`
                }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `applications-report-${jobId}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10B981';
        if (score >= 65) return '#F59E0B';
        return '#EF4444';
    };

    const filteredApplications = reportData?.applications?.filter(app =>
        app.candidate.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        app.candidate.email.toLowerCase().includes(filters.searchTerm.toLowerCase())
    ) || [];

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reports</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const stageChartData = Object.entries(reportData.summary.stageDistribution).map(([stage, count]) => ({
        stage: stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count
    }));

    const scoreDistributionData = [
        { name: 'Excellent (90-100%)', value: reportData.summary.qualityDistribution?.excellent || 0 },
        { name: 'Good (75-89%)', value: reportData.summary.qualityDistribution?.good || 0 },
        { name: 'Average (60-74%)', value: reportData.summary.qualityDistribution?.average || 0 },
        { name: 'Poor (<60%)', value: reportData.summary.qualityDistribution?.poor || 0 }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">AI Interview Reports</h1>
                        <p className="text-blue-100">
                            {reportData.jobInfo.title} at {reportData.jobInfo.companyName}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-blue-100">
                            <Users className="h-4 w-4 mr-1" />
                            {reportData.summary.totalApplications} Applications
                            <Target className="h-4 w-4 ml-4 mr-1" />
                            {reportData.summary.videoInterviewStats.completed} Video Interviews Completed
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => exportData('json')}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export JSON
                        </button>
                        <button
                            onClick={() => exportData('csv')}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </button>
                        <button
                            onClick={fetchReportData}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Overall Score</p>
                            <p className="text-2xl font-bold text-blue-600">{reportData.summary.averageScores.overall}%</p>
                        </div>
                        <Award className="h-8 w-8 text-blue-600" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Video Score</p>
                            <p className="text-2xl font-bold text-green-600">{reportData.summary.videoInterviewStats.averageOverallScore}%</p>
                        </div>
                        <Zap className="h-8 w-8 text-green-600" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {Math.round((reportData.summary.videoInterviewStats.completed / reportData.summary.totalApplications) * 100)}%
                            </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Red Flags</p>
                            <p className="text-2xl font-bold text-red-600">
                                {Object.values(reportData.summary.videoInterviewStats.commonRedFlags).reduce((sum, count) => sum + count, 0)}
                            </p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Application Stage Distribution */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Application Stage Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stageChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="stage" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                fontSize={12}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Score Distribution */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={scoreDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {scoreDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Video Interview Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Video Interview Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">{reportData.summary.videoInterviewStats.averageCommunicationScore}%</p>
                        <p className="text-sm text-gray-600">Avg Communication Score</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">{reportData.summary.videoInterviewStats.averageTechnicalScore}%</p>
                        <p className="text-sm text-gray-600">Avg Technical Score</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">{reportData.summary.videoInterviewStats.averageConfidenceScore}%</p>
                        <p className="text-sm text-gray-600">Avg Confidence Score</p>
                    </div>
                </div>
            </div>

            {/* Common Red Flags */}
            {Object.keys(reportData.summary.videoInterviewStats.commonRedFlags).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-4">Common Red Flags</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(reportData.summary.videoInterviewStats.commonRedFlags).map(([flag, count]) => (
                            <div key={flag} className="flex justify-between items-center bg-white p-3 rounded-lg">
                                <span className="text-sm text-gray-700">{flag}</span>
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {count} candidates
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1 min-w-64">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                value={filters.searchTerm}
                                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <select
                        value={filters.stage}
                        onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Stages</option>
                        <option value="video_completed">Video Completed</option>
                        <option value="video_pending">Video Pending</option>
                        <option value="quiz_completed">Quiz Completed</option>
                        <option value="resume_screening">Resume Screening</option>
                    </select>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="overallScore">Overall Score</option>
                        <option value="appliedAt">Application Date</option>
                        <option value="screeningStage">Stage</option>
                    </select>
                    <select
                        value={filters.order}
                        onChange={(e) => setFilters(prev => ({ ...prev, order: e.target.value }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="desc">Highest First</option>
                        <option value="asc">Lowest First</option>
                    </select>
                </div>

                {/* Applications Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Candidate</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Overall Score</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Video Score</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Stage</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Applied</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((application) => (
                                <tr key={application.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{application.candidate.name}</p>
                                            <p className="text-sm text-gray-500">{application.candidate.email}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        {application.scores.overall ? (
                                            <div className="flex items-center">
                                                <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{
                                                            width: `${application.scores.overall}%`,
                                                            backgroundColor: getScoreColor(application.scores.overall)
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium">{application.scores.overall}%</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        {application.scores.video ? (
                                            <div className="flex items-center">
                                                <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{
                                                            width: `${application.scores.video}%`,
                                                            backgroundColor: getScoreColor(application.scores.video)
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium">{application.scores.video}%</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            application.screeningStage.includes('completed') || application.screeningStage.includes('hired')
                                                ? 'bg-green-100 text-green-800'
                                                : application.screeningStage.includes('failed') || application.screeningStage.includes('rejected')
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {application.screeningStage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-500">
                                        {new Date(application.appliedAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4">
                                        {application.hasVideoReport && (
                                            <button
                                                onClick={() => openVideoReport(application.id)}
                                                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Report
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Performers */}
            {reportData.summary.topPerformers.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">Top Performers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {reportData.summary.topPerformers.map((performer, index) => (
                            <div key={performer.id} className="bg-white rounded-lg p-4 text-center shadow-sm">
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full mx-auto mb-2">
                                    {index + 1}
                                </div>
                                <p className="font-medium text-gray-900 text-sm">{performer.candidateName}</p>
                                <p className="text-2xl font-bold text-green-600">{performer.overallScore}%</p>
                                <p className="text-xs text-gray-500">{performer.screeningStage.replace(/_/g, ' ')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Video Interview Report Modal */}
            {showVideoReport && selectedApplication && (
                <VideoInterviewReport
                    applicationId={selectedApplication}
                    onClose={closeVideoReport}
                />
            )}
        </div>
    );
};

export default ReportDashboard;