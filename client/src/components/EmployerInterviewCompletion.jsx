import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const EmployerInterviewCompletion = ({ application, onCompleted }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { userInfo } = useAuth();

    const [formData, setFormData] = useState({
        feedback: '',
        decision: 'pending'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const response = await axios.post(
                `http://localhost:5001/api/applications/${application._id}/complete-employer-interview`,
                formData,
                config
            );

            setSuccess('Interview completed successfully!');
            if (onCompleted) {
                onCompleted(response.data);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to complete interview');
        } finally {
            setIsLoading(false);
        }
    };

    if (application.screeningStage !== 'employer_scheduled') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Interview Completion</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertDescription>
                            This interview is not yet scheduled or has already been completed. 
                            Current stage: {application.screeningStage}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Complete Interview
                </CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}
                
                {success && (
                    <Alert className="mb-4 border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                )}

                {/* Interview Details */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">Interview Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="font-medium">Candidate:</span> {application.candidate?.firstName} {application.candidate?.lastName}
                        </div>
                        <div>
                            <span className="font-medium">Date:</span> {application.employerInterview?.scheduledDate ? 
                                new Date(application.employerInterview.scheduledDate).toLocaleDateString() : 'N/A'
                            }
                        </div>
                        <div>
                            <span className="font-medium">Time:</span> {application.employerInterview?.scheduledTime || 'N/A'}
                        </div>
                        <div>
                            <span className="font-medium">Type:</span> {application.employerInterview?.interviewType || 'N/A'}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="decision">Interview Decision</Label>
                        <Select value={formData.decision} onValueChange={(value) => setFormData(prev => ({ ...prev, decision: value }))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hired">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        Hire Candidate
                                    </div>
                                </SelectItem>
                                <SelectItem value="rejected">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        Reject Candidate
                                    </div>
                                </SelectItem>
                                <SelectItem value="pending">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-yellow-500" />
                                        Pending Decision
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="feedback">Interview Feedback</Label>
                        <Textarea
                            id="feedback"
                            placeholder="Provide detailed feedback about the candidate's performance, strengths, areas for improvement, and overall impression..."
                            value={formData.feedback}
                            onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                            rows={6}
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            This feedback will be used internally and may be shared with the candidate.
                        </p>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Completing...' : 'Complete Interview'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default EmployerInterviewCompletion; 