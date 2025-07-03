import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
    MapPin, 
    Building2, 
    DollarSign, 
    Clock, 
    Briefcase,
    Calendar,
    Users,
    Sparkles
} from 'lucide-react';

const CardFooter = ({ job }) => {
    // Calculate days until expiry
    const getDaysUntilExpiry = (expiryDate) => {
        if (!expiryDate) return null;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysLeft = job.expiryDate ? getDaysUntilExpiry(job.expiryDate) : null;

    // Format salary for display
    const formatSalary = (salary) => {
        if (!salary) return 'Competitive';
        return salary;
    };

    // Get job type badge variant
    const getJobTypeBadgeVariant = (jobType) => {
        switch (jobType) {
            case 'Full-time':
                return 'default';
            case 'Part-time':
                return 'secondary';
            case 'Contract':
                return 'outline';
            case 'Internship':
                return 'secondary';
            default:
                return 'default';
        }
    };

    return (
        <div className="space-y-4 p-6 pt-0">
            {/* Company and Location */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{job.companyName}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                </div>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                        </Badge>
                    ))}
                    {job.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 3} more
                        </Badge>
                    )}
                </div>
            )}

            {/* Job Details Grid */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y">
                {/* Salary */}
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">Salary</p>
                        <p className="text-sm font-medium truncate">{formatSalary(job.salary)}</p>
                    </div>
                </div>

                {/* Job Type */}
                <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <Badge 
                            variant={getJobTypeBadgeVariant(job.jobType)} 
                            className="text-xs px-2 py-0"
                        >
                            {job.jobType || 'Full-time'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                {/* Posted Date */}
                <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                        Posted {new Date(job.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                        })}
                    </span>
                </div>

                {/* Expiry Warning or Active Status */}
                {daysLeft !== null && daysLeft > 0 ? (
                    <div className={`flex items-center gap-1 ${daysLeft <= 7 ? 'text-orange-600' : ''}`}>
                        <Clock className="h-3 w-3" />
                        <span>
                            {daysLeft <= 7 
                                ? `Expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`
                                : 'Active'
                            }
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-green-600">
                        <Sparkles className="h-3 w-3" />
                        <span>Active</span>
                    </div>
                )}
            </div>

            {/* Interview Duration Badge (if specified) */}
            {job.interviewDuration && (
                <div className="flex items-center gap-2 pt-2 border-t">
                    <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {job.interviewDuration} min interview
                    </Badge>
                </div>
            )}
        </div>
    );
};

export default CardFooter;