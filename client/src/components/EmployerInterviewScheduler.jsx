import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, User, Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const EmployerInterviewScheduler = ({ application, onScheduled }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { userInfo } = useAuth();

    const [formData, setFormData] = useState({
        scheduledDate: '',
        scheduledTime: '',
        interviewType: 'video',
        employerContact: {
            name: userInfo?.firstName + ' ' + userInfo?.lastName || '',
            email: userInfo?.email || '',
            phone: ''
        },
        meetingLink: '',
        location: '',
        notes: ''
    });

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const response = await axios.post(
                `http://localhost:5001/api/applications/${application._id}/schedule-employer-interview`,
                formData,
                config
            );

            setSuccess('Interview scheduled successfully!');
            if (onScheduled) {
                onScheduled(response.data);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to schedule interview');
        } finally {
            setIsLoading(false);
        }
    };

    if (application.screeningStage !== 'selected_for_employer') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Interview Scheduling</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertDescription>
                            This candidate is not yet ready for interview scheduling. 
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
                    <Calendar className="h-5 w-5" />
                    Schedule Interview
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Candidate Information */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Candidate Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="font-medium">Name:</span> {application.candidate?.firstName} {application.candidate?.lastName}
                            </div>
                            <div>
                                <span className="font-medium">Email:</span> {application.candidate?.email}
                            </div>
                            <div>
                                <span className="font-medium">Resume Score:</span> {application.aiMatchScore}%
                            </div>
                            <div>
                                <span className="font-medium">Quiz Score:</span> {application.quizScore}%
                            </div>
                            <div>
                                <span className="font-medium">Video Score:</span> {application.videoAnalysisReport?.overallScore || 'N/A'}%
                            </div>
                            <div>
                                <span className="font-medium">Overall Score:</span> {application.overallScore}%
                            </div>
                        </div>
                    </div>

                    {/* Interview Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="scheduledDate">Interview Date</Label>
                            <Input
                                id="scheduledDate"
                                type="date"
                                value={formData.scheduledDate}
                                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="scheduledTime">Interview Time</Label>
                            <Input
                                id="scheduledTime"
                                type="time"
                                value={formData.scheduledTime}
                                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="interviewType">Interview Type</Label>
                        <Select value={formData.interviewType} onValueChange={(value) => handleInputChange('interviewType', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="video">Video Call</SelectItem>
                                <SelectItem value="phone">Phone Call</SelectItem>
                                <SelectItem value="onsite">On-site</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Your Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="contactName">Your Name</Label>
                                <Input
                                    id="contactName"
                                    value={formData.employerContact.name}
                                    onChange={(e) => handleInputChange('employerContact.name', e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="contactEmail">Your Email</Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    value={formData.employerContact.email}
                                    onChange={(e) => handleInputChange('employerContact.email', e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="contactPhone">Your Phone (Optional)</Label>
                                <Input
                                    id="contactPhone"
                                    type="tel"
                                    value={formData.employerContact.phone}
                                    onChange={(e) => handleInputChange('employerContact.phone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Meeting Details */}
                    {formData.interviewType === 'video' && (
                        <div>
                            <Label htmlFor="meetingLink">Meeting Link</Label>
                            <Input
                                id="meetingLink"
                                type="url"
                                placeholder="https://meet.google.com/..."
                                value={formData.meetingLink}
                                onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                            />
                        </div>
                    )}

                    {formData.interviewType === 'onsite' && (
                        <div>
                            <Label htmlFor="location">Interview Location</Label>
                            <Input
                                id="location"
                                placeholder="Office address or meeting room"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any specific instructions or requirements for the candidate..."
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            rows={3}
                        />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Scheduling...' : 'Schedule Interview'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default EmployerInterviewScheduler; 