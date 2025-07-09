// CandidateAnalytics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import InterviewAnalytics from '@/components/InterviewAnalytics';

const CandidateAnalytics = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userInfo } = useAuth();

    useEffect(() => {
        if (!userInfo) return;
        const fetchApplications = async () => {
            setIsLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get('http://localhost:5001/api/applications/my-applications', config);
                setApplications(data);
            } catch (error) {
                setApplications([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplications();
    }, [userInfo]);

    if (isLoading) return <div className="text-center py-12">Loading analytics...</div>;

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-6 mt-16">Interview Analytics</h1>
            <InterviewAnalytics applications={applications} />
        </div>
    );
};

export default CandidateAnalytics; 