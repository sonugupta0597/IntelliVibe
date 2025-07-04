import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner'; // For toast notifications

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Icons from lucide-react
import { Search, CheckCircle, XCircle, Briefcase } from 'lucide-react';
import JobCardFooter from "../components/layout/Footer"; // Assuming this is your custom component

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State for the result dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState({
        title: '',
        description: '',
        isSuccess: false,
        nextStep: null,
    });
    
    const { userInfo } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/jobs');
                setJobs(data);
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
                toast.error("Failed to load jobs. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleApply = async (e) => {
        e.preventDefault();

        if (!userInfo) {
            toast.error("Please log in to apply for jobs.");
            navigate('/login');
            return;
        }
        if (!resumeFile) {
            toast.error("Please select a resume file.");
            return;
        }
        
        setIsApplying(true);
        // Close the initial application dialog
        document.querySelector('[data-state="open"]')?.click();

        toast.info('Submitting your application...', {
            description: 'Our AI is analyzing your resume. This may take a moment.',
        });

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
            
            const { data } = await axios.post('http://localhost:5001/api/applications', formData, config);
            
            if (data.success) {
                toast.success("Analysis complete! You're a great match.");
                setDialogContent({
                    title: "Congratulations! You're a Match!",
                    description: "Your profile aligns well with the job requirements. The next step is a short skills assessment.",
                    isSuccess: true,
                    nextStep: {
                        text: 'Take the Quiz Now',
                        action: () => navigate(`/candidate/quiz/${data.application._id}`)
                    }
                });
            } else {
                toast.warning("Analysis complete. It wasn't a match this time.");
                setDialogContent({
                    title: "Application Submitted",
                    description: "Thank you for your interest. Unfortunately, your profile does not closely match the requirements for this position. Don't be discouraged!",
                    isSuccess: false,
                    nextStep: {
                        text: 'View My Applications',
                        action: () => navigate('/candidate/dashboard')
                    }
                });
            }
            setDialogOpen(true);

        } catch (error) {
            toast.error(`Application failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsApplying(false);
            setSelectedJob(null);
            setResumeFile(null);
        }
    };

    const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
            >
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">Find Your Next Opportunity</h1>
                    <p className="text-muted-foreground">Browse our open positions and apply today.</p>
                    
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
                
                {/* --- START OF COMPLETED SECTIONS --- */}
                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted-foreground">Loading jobs...</p>
                        </div>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <Card className="w-full max-w-md text-center py-12">
                            <CardContent>
                                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    {searchTerm ? 'No Jobs Found' : 'No Open Positions'}
                                </h3>
                                <p className="text-muted-foreground">
                                    {searchTerm 
                                        ? 'Try adjusting your search terms.' 
                                        : 'Please check back later for new opportunities.'
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                // --- END OF COMPLETED SECTIONS ---
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredJobs.map((job) => (
                            <Card key={job._id} className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                                        {job.description}
                                    </CardDescription>
                                </CardHeader>
                                
                                <JobCardFooter job={job} />
                                
                                <div className="px-6 pb-6 mt-auto">
                                    <Dialog onOpenChange={(open) => { if(!open) setSelectedJob(null); }}>
                                        <DialogTrigger asChild>
                                            <Button 
                                                className="w-full" 
                                                onClick={() => setSelectedJob(job)}
                                            >
                                                Apply Now
                                            </Button>
                                        </DialogTrigger>
                                        {selectedJob && (
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Apply for {selectedJob.title}</DialogTitle>
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        at {selectedJob.companyName} • {selectedJob.location}
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
                                                            Your resume will be analyzed by our AI.
                                                        </p>
                                                    </div>
                                                    <Button 
                                                        type="submit" 
                                                        disabled={isApplying} 
                                                        className="w-full"
                                                    >
                                                        {isApplying ? 'Analyzing...' : 'Submit & Analyze'}
                                                    </Button>
                                                </form>
                                            </DialogContent>
                                        )}
                                    </Dialog>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </motion.div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                             {dialogContent.isSuccess ? 
                                <CheckCircle className="h-6 w-6 text-green-500" /> : 
                                <XCircle className="h-6 w-6 text-red-500" />
                             }
                             {dialogContent.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogContent.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        {dialogContent.nextStep && (
                             <AlertDialogAction onClick={dialogContent.nextStep.action}>
                                {dialogContent.nextStep.text}
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default Jobs;