import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State for the result dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    
    // Add state for form loading and feedback
    const [applyLoading, setApplyLoading] = useState(false);
    const [applyError, setApplyError] = useState(null);
    const [applySuccess, setApplySuccess] = useState(null);
    
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

    const filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Handler for job application form submit
    const handleApply = async (e, jobId) => {
        e.preventDefault();
        setApplyLoading(true);
        setApplyError(null);
        setApplySuccess(null);
        const form = e.target;
        const fileInput = form.querySelector('input[type="file"]');
        const resume = fileInput.files[0];
        if (!resume) {
            setApplyError('Please upload your resume (PDF).');
            setApplyLoading(false);
            return;
        }
        const formData = new FormData();
        formData.append('resume', resume);
        formData.append('jobId', jobId);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {})
                }
            };
            const { data } = await axios.post('http://localhost:5001/api/applications', formData, config);
            setApplySuccess(data.message || 'Application submitted!');
            form.reset();
            // Redirect to My Applications if success
            if (data.success) {
                setTimeout(() => navigate('/candidate/dashboard'), 1200);
            }
        } catch (error) {
            setApplyError(error.response?.data?.message || 'Failed to submit application.');
        } finally {
            setApplyLoading(false);
        }
    };

    return (
        <>
            <div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
            >
                <div className="text-center space-y-4 mt-16">
                    <h1 className="text-4xl font-bold tracking-tight">Discover AI-Matched Opportunities</h1>
                    <p className="text-white">Let our AI match you to your perfect role. Browse openings and apply with confidence.</p>
                    
                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-100 h-4 w-4" />
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
                            <p className="mt-4 text-white">Loading jobs...</p>
                        </div>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <Card className="w-full max-w-md text-center py-12">
                            <CardContent>
                                <Briefcase className="h-12 w-12 text-pink-100 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    {searchTerm ? 'No Jobs Found' : 'No Open Positions'}
                                </h3>
                                <p className="text-white">
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
                            <Dialog key={job._id}>
                                <Card
                                    className="relative flex flex-col bg-white/10 backdrop-blur-md shadow-2xl overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-pink-500/30 group"
                                    style={{
                                        borderRadius: '1.5rem',
                                        // border: '2px solid',
                                        // borderImage: 'linear-gradient(135deg, #e91e63 0%, #9c27b0 100%) 1',
                                        boxShadow: '0 8px 32px 0 rgba(233,30,99,0.15), 0 1.5px 8px 0 rgba(156,39,176,0.10)'
                                    }}
                                >
                                    {/* Featured Badge */}
                                    {job.isFeatured && (
                                        <span className="absolute top-4 right-4 z-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                                            Featured
                                        </span>
                                    )}
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-300" style={{background: 'linear-gradient(120deg, #e91e63 0%, #9c27b0 100%)'}} />
                                    <CardHeader className="relative z-10">
                                        <CardTitle className="line-clamp-1 text-white text-2xl font-bold drop-shadow-lg">
                                            {job.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 min-h-[2.5rem] text-pink-100">
                                        {job.description}
                                    </CardDescription>
                                </CardHeader>
                                    <CardContent className="relative z-10">
                                <JobCardFooter job={job} />
                                    </CardContent>
                                    <div className="relative z-10 flex-1 flex items-end justify-end p-6 pt-0">
                                        <DialogTrigger asChild>
                                            <Button 
                                                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold px-6 py-2 rounded-lg shadow-lg hover:from-pink-600 hover:to-purple-700 hover:shadow-pink-500/40 transition-all duration-300 text-lg"
                                            >
                                                Apply Now
                                            </Button>
                                        </DialogTrigger>
                                    </div>
                                </Card>
                                            <DialogContent>
                                                <DialogHeader>
                                        <DialogTitle>Apply for {job.title}</DialogTitle>
                                        <p className="text-sm text-pink-100 mt-2">
                                            at {job.companyName} • {job.location}
                                                    </p>
                                                </DialogHeader>
                                    <form className="space-y-4 mt-4" onSubmit={e => handleApply(e, job._id)}>
                                                    <div>
                                            <Label htmlFor={`resume-${job._id}`}>Upload Resume (PDF)</Label>
                                                        <Input 
                                                id={`resume-${job._id}`} 
                                                            type="file" 
                                                            accept=".pdf"
                                                            required 
                                                        />
                                            <p className="text-xs text-pink-100 mt-1">
                                                            Your resume will be analyzed by our AI.
                                                        </p>
                                                    </div>
                                        {applyError && <p className="text-red-500 text-sm font-semibold">{applyError}</p>}
                                        {applySuccess && <p className="text-green-400 text-sm font-semibold">{applySuccess}</p>}
                                                    <Button 
                                                        type="submit" 
                                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold"
                                            disabled={applyLoading}
                                                    >
                                            {applyLoading ? 'Submitting...' : 'Submit & Analyze'}
                                                    </Button>
                                                </form>
                                            </DialogContent>
                                    </Dialog>
                        ))}
                    </div>
                )}
            </div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                             {/* {dialogContent.isSuccess ?  */}
                                {/* <CheckCircle className="h-6 w-6 text-green-500" /> :  */}
                                {/* <XCircle className="h-6 w-6 text-red-500" /> */}
                             {/* } */}
                             {/* {dialogContent.title} */}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {/* {dialogContent.description} */}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        {/* {dialogContent.nextStep && ( */}
                             {/* <AlertDialogAction onClick={dialogContent.nextStep.action}> */}
                                {/* {dialogContent.nextStep.text} */}
                            {/* </AlertDialogAction> */}
                        {/* )} */}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default Jobs;