import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from "@/components/ui/badge"; // <--- THE FIX IS HERE
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import PostJobForm from '@/components/forms/PostJobForm';

const EmployerDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { userInfo } = useAuth();
    
    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                // Fetching newest jobs first
                const { data } = await axios.get('http://localhost:5001/api/jobs/myjobs', config);
                setJobs(data);
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userInfo) fetchJobs();
    }, [userInfo]);

    const handleJobPosted = (newJob) => {
        if (newJob) {
            setJobs([newJob, ...jobs]);
        }
        setIsDialogOpen(false); 
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Your Job Postings</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Post a New Job</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                            <DialogTitle>Create a New Job Posting</DialogTitle>
                            <DialogDescription>Fill out the details below to find your next great hire.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <PostJobForm onJobPosted={handleJobPosted} />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? <p>Loading your jobs...</p> : jobs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">No jobs posted yet.</h2>
                    <p className="text-muted-foreground mt-2">Click 'Post a New Job' to get started.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                        <Card key={job._id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="pr-4">{job.title}</CardTitle>
                                    <Badge variant={job.isActive ? "default" : "destructive"}>
                                        {job.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <CardDescription>{job.companyName} • {job.location}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills.slice(0, 3).map(skill => (
                                        <Badge key={skill} variant="outline">{skill}</Badge>
                                    ))}
                                    {job.skills.length > 3 && <Badge variant="outline">...</Badge>}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild variant="secondary" className="w-full">
                                    <Link to={`/employer/job/${job._id}/applicants`}>View Applicants</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default EmployerDashboard;