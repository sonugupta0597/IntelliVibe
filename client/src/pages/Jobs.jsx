import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import JobCardFooter from "../components/layout/Footer"; // Import the custom footer

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { userInfo } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/jobs');
                setJobs(data);
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleApply = async (e) => {
        e.preventDefault();
        
        // Check if user is logged in
        if (!userInfo) {
            alert("Please login to apply for jobs.");
            navigate('/login');
            return;
        }

        if (!resumeFile) {
            alert("Please select a resume file.");
            return;
        }
        setIsApplying(true);

        const formData = new FormData();
        formData.append('jobId', selectedJob._id);
        formData.append('resume', resumeFile);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.post('http://localhost:5001/api/applications', formData, config);
            alert('Application submitted successfully!');
            // Close dialog and reset state
            setSelectedJob(null);
            setResumeFile(null);
        } catch (error) {
            alert(`Application failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsApplying(false);
        }
    };

    // Filter jobs based on search term
    const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Find Your Next Opportunity</h1>
                <p className="text-muted-foreground">Browse our open positions and apply today.</p>
                
                {/* Search Bar */}
                <div className="max-w-md mx-auto relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        type="text"
                        placeholder="Search jobs, companies, or skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>
            
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading jobs...</p>
                    </div>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        {searchTerm ? 'No jobs found matching your search.' : 'No jobs available at the moment.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredJobs.map((job) => (
                        <Card key={job._id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                                    {job.description}
                                </CardDescription>
                            </CardHeader>
                            
                            {/* Use the custom CardFooter */}
                            <JobCardFooter job={job} />
                            
                            <div className="px-6 pb-6">
                                <Dialog onOpenChange={(open) => !open && setSelectedJob(null)}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            className="w-full" 
                                            onClick={() => setSelectedJob(job)}
                                        >
                                            Apply Now
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                at {selectedJob?.companyName} • {selectedJob?.location}
                                            </p>
                                        </DialogHeader>
                                        <form onSubmit={handleApply} className="space-y-4 mt-4">
                                            <div>
                                                <Label htmlFor="resume">Upload Resume (PDF)</Label>
                                                <Input 
                                                    id="resume" 
                                                    type="file" 
                                                    accept=".pdf"
                                                    onChange={(e) => setResumeFile(e.target.files[0])} 
                                                    required 
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Only PDF files are accepted
                                                </p>
                                            </div>
                                            <Button 
                                                type="submit" 
                                                disabled={isApplying} 
                                                className="w-full"
                                            >
                                                {isApplying ? 'Submitting...' : 'Submit Application'}
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default Jobs;