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
import { 
    Search, 
    CheckCircle, 
    XCircle, 
    Briefcase, 
    MapPin, 
    Building2, 
    Clock, 
    Star,
    Upload,
    FileText,
    Sparkles,
    Filter,
    TrendingUp,
    Zap,
    DollarSign,
    Calendar
} from 'lucide-react';
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="relative">
                    {/* Background decorative elements */}
                    <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                    
                    <div className="relative p-6 md:p-10 space-y-8">
                        {/* Hero Header Section */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 md:p-12 text-center">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6">
                                    <Briefcase className="h-10 w-10 text-white" />
                                </div>
                                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
                                    Find Your Next Opportunity
                                </h1>
                                <p className="text-slate-600 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                                    Discover AI-matched job opportunities tailored to your skills and experience. Join thousands of professionals finding their dream careers.
                                </p>
                                
                                <div className="max-w-2xl mx-auto relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
                                    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-white/40">
                                        <div className="relative flex items-center">
                                            <div className="absolute left-4 z-10">
                                                <Search className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors duration-200" />
                                            </div>
                                            <Input
                                                type="text"
                                                placeholder="Search jobs, companies, locations, or skills..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-14 pr-6 h-14 text-lg border-0 bg-transparent focus:ring-0 placeholder:text-slate-400 text-slate-700 font-medium"
                                            />
                                            <Button 
                                                size="lg" 
                                                className="absolute right-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                <Filter className="h-5 w-5 mr-2" />
                                                Search
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Results Summary */}
                        {!isLoading && (
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl">
                                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-slate-900">
                                                {filteredJobs.length} <span className="text-lg font-medium text-slate-600">
                                                    {filteredJobs.length === 1 ? 'position' : 'positions'} found
                                                </span>
                                            </div>
                                            {searchTerm && (
                                                <p className="text-slate-600">
                                                    Results for "<span className="font-semibold text-blue-600">{searchTerm}</span>"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                                        <Zap className="h-4 w-4" />
                                        AI-powered matching
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Job Listings */}
                        {isLoading ? (
                            <div className="flex items-center justify-center min-h-[500px]">
                                <div className="text-center">
                                    <div className="relative mb-8">
                                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                                        <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                    </div>
                                    <p className="text-xl text-slate-700 font-medium">Discovering opportunities for you...</p>
                                    <p className="text-slate-500 mt-2">Our AI is finding the perfect matches</p>
                                </div>
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="flex justify-center items-center min-h-[500px]">
                                <Card className="max-w-md w-full bg-white/80 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
                                    <CardContent className="text-center py-16 px-8">
                                        <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mx-auto mb-6">
                                            <Briefcase className="h-10 w-10 text-slate-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-3">
                                            {searchTerm ? 'No Jobs Found' : 'No Open Positions'}
                                        </h3>
                                        <p className="text-slate-600 mb-8 leading-relaxed">
                                            {searchTerm 
                                                ? 'Try adjusting your search terms or browse all available positions.' 
                                                : 'Please check back later for new opportunities.'
                                            }
                                        </p>
                                        {searchTerm && (
                                            <Button 
                                                variant="outline" 
                                                className="bg-white/60 backdrop-blur-sm border-slate-200 hover:bg-white/80 rounded-xl px-6 py-3"
                                                onClick={() => setSearchTerm('')}
                                            >
                                                View All Jobs
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {filteredJobs.map((job) => (
                                    <Dialog key={job._id}>
                                        <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 hover:bg-white/90 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col">
                                            {/* Gradient border effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            
                                            {/* Featured Badge */}
                                            {job.isFeatured && (
                                                <div className="absolute top-6 right-6 z-10">
                                                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-2 rounded-full flex items-center gap-1.5 shadow-lg">
                                                        <Star className="h-3 w-3" />
                                                        Featured
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <CardHeader className="relative pb-6 border-b border-slate-100/60">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 space-y-4">
                                                        <CardTitle className="text-xl font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors duration-200 line-clamp-2">
                                                            {job.title}
                                                        </CardTitle>
                                                        <div className="space-y-3 text-sm">
                                                            <div className="flex items-center gap-3 text-slate-600">
                                                                <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                                                                    <Building2 className="h-4 w-4 text-blue-600" />
                                                                </div>
                                                                <span className="font-semibold">{job.companyName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-slate-600">
                                                                <div className="flex items-center justify-center w-8 h-8 bg-emerald-50 rounded-lg">
                                                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                                                </div>
                                                                <span>{job.location}</span>
                                                            </div>
                                                            {job.postedDate && (
                                                                <div className="flex items-center gap-3 text-slate-500">
                                                                    <div className="flex items-center justify-center w-8 h-8 bg-slate-50 rounded-lg">
                                                                        <Clock className="h-4 w-4 text-slate-500" />
                                                                    </div>
                                                                    <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            
                                            <CardContent className="relative flex-1 flex flex-col p-6">
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {job.skills && job.skills.slice(0, 3).map(skill => (
                                                        <span key={skill} className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mr-2 mb-2 border border-blue-100">{skill}</span>
                                                    ))}
                                                    {job.skills && job.skills.length > 3 && <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mr-2 mb-2 border border-blue-100">...</span>}
                                                </div>
                                                <div className="flex flex-col gap-2 text-sm text-slate-700 mb-4">
                                                    {job.salary && (
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4 text-green-600" />
                                                            <span className="font-medium">{job.salary}</span>
                                                        </div>
                                                    )}
                                                    {job.jobType && (
                                                        <div className="flex items-center gap-2">
                                                            <Briefcase className="h-4 w-4 text-blue-600" />
                                                            <span className="font-medium">{job.jobType}</span>
                                                        </div>
                                                    )}
                                                    {(job.createdAt || job.postedDate) && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-purple-600" />
                                                            <span className="font-medium">Posted {new Date(job.createdAt || job.postedDate).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                    {job.description && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <FileText className="h-4 w-4 text-gray-500" />
                                                            <span className="line-clamp-2 text-gray-500">{job.description.slice(0, 120)}{job.description.length > 120 ? '...' : ''}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <CardDescription className="text-slate-600 line-clamp-3 mb-6 flex-1 leading-relaxed">
                                                    {job.description}
                                                </CardDescription>
                                                <div className="space-y-4 mt-auto">
                                                    <DialogTrigger asChild>
                                                        <Button 
                                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                                        >
                                                            <Sparkles className="h-5 w-5 mr-2" />
                                                            Apply Now
                                                        </Button>
                                                    </DialogTrigger>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        
                                        <DialogContent className="bg-white/95 backdrop-blur-xl border-white/30 max-w-md rounded-3xl shadow-2xl">
                                            <DialogHeader className="border-b border-slate-100 pb-6">
                                                <DialogTitle className="text-2xl font-bold text-slate-900 mb-4">
                                                    Apply for {job.title}
                                                </DialogTitle>
                                                <div className="text-sm text-slate-600 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                                                            <Building2 className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <span className="font-medium">{job.companyName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-8 h-8 bg-emerald-50 rounded-lg">
                                                            <MapPin className="h-4 w-4 text-emerald-600" />
                                                        </div>
                                                        <span>{job.location}</span>
                                                    </div>
                                                </div>
                                            </DialogHeader>
                                            
                                            <form className="space-y-6 mt-8" onSubmit={e => handleApply(e, job._id)}>
                                                <div className="space-y-3">
                                                    <Label htmlFor={`resume-${job._id}`} className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        Upload Resume (PDF) *
                                                    </Label>
                                                    <div className="relative">
                                                        <Input 
                                                            id={`resume-${job._id}`} 
                                                            type="file" 
                                                            accept=".pdf"
                                                            required 
                                                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        />
                                                    </div>
                                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                                        <p className="text-xs text-blue-700 flex items-center gap-2">
                                                            <Zap className="h-3 w-3" />
                                                            Your resume will be analyzed by our AI for skill matching and compatibility assessment.
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {applyError && (
                                                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                                                        <div className="flex items-center gap-2">
                                                            <XCircle className="h-5 w-5 text-rose-500" />
                                                            <p className="text-rose-700 text-sm font-medium">{applyError}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {applySuccess && (
                                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                                                            <p className="text-emerald-700 text-sm font-medium">{applySuccess}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <Button 
                                                    type="submit" 
                                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                                    disabled={applyLoading}
                                                >
                                                    {applyLoading ? (
                                                        <div className="flex items-center justify-center gap-3">
                                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                                            <span>Submitting Application...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Upload className="h-5 w-5" />
                                                            Submit Application
                                                        </div>
                                                    )}
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-white/30 rounded-3xl">
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
                        <AlertDialogCancel className="rounded-xl">Close</AlertDialogCancel>
                        {/* {dialogContent.nextStep && ( */}
                             {/* <AlertDialogAction onClick={dialogContent.nextStep.action}> */}
                                {/* {dialogContent.nextStep.text} */}
                            {/* </AlertDialogAction> */}
                        {/* )} */}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
};

export default Jobs;