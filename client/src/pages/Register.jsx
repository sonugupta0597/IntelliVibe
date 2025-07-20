import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Loader2, 
    Info, 
    Eye, 
    EyeOff, 
    Shield, 
    AlertCircle, 
    Users, 
    Building2,
    Brain,
    Sparkles,
    UserPlus,
    ArrowRight,
    CheckCircle,
    Mail,
    Lock,
    User
} from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { Switch } from "@/components/ui/switch";
import { motion } from 'framer-motion';

const passwordRules = [
  "At least 8 characters",
  "At least one uppercase letter (A-Z)",
  "At least one lowercase letter (a-z)",
  "At least one number (0-9)",
  "At least one special character (!@#$%^&*)"
];

const formSchema = z.object({
  firstName: z.string()
    .min(2, { message: "First name must be at least 2 characters." })
    .regex(/^[A-Za-z]+$/, { message: "First name must contain only letters." }),
  lastName: z.string()
    .min(2, { message: "Last name must be at least 2 characters." })
    .regex(/^[A-Za-z]+$/, { message: "Last name must contain only letters." }),
  email: z.string()
    .email({ message: "Please enter a valid email address." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[!@#$%^&*]/, { message: "Password must contain at least one special character (!@#$%^&*)." }),
  role: z.enum(["candidate", "employer"], { required_error: "You must select a role." }),
});

const Register = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [selectedRole, setSelectedRole] = useState('candidate');
    const [showPasswordRules, setShowPasswordRules] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: "candidate",
        },
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
    });

    const onSubmit = async (values) => {
        setIsLoading(true);
        setApiError(null);
        try {
            const { data } = await axios.post('http://localhost:5001/api/auth/register', values);
            
            // On success, save user info and redirect
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            // Redirect based on role
            if (data.role === 'employer') {
                navigate('/employer/dashboard');
            } else {
                navigate('/candidate/dashboard');
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || "An unexpected error occurred. Please try again.";
            console.error("Registration failed:", errorMessage); 
            setApiError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            
            <div className="relative flex items-center justify-center min-h-screen p-6 md:p-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                        <CardHeader className="text-center pb-8 bg-gradient-to-br from-slate-50/50 to-white/50 border-b border-slate-100/60">
                            {/* Logo/Brand */}
                            <motion.div 
                                className="flex justify-center mb-6"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <div className="relative">
                                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
                                        <Brain className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                                        <UserPlus className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
                                Create Your Account
                            </CardTitle>
                            <CardDescription className="text-slate-600 text-lg leading-relaxed">
                                Join the AI-powered recruitment platform and transform your hiring experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {/* Role Selection */}
                            <motion.div 
                                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="text-sm font-bold text-slate-700 mb-4 text-center uppercase tracking-wide">I am a:</div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className={`flex items-center gap-3 transition-all duration-300 px-4 py-2 rounded-xl ${
                                        selectedRole === 'candidate' 
                                            ? 'text-blue-600 font-bold bg-blue-50 border border-blue-200' 
                                            : 'text-slate-500 font-medium hover:text-slate-700'
                                    }`}>
                                        <div className={`p-2 rounded-lg ${
                                            selectedRole === 'candidate' ? 'bg-blue-100' : 'bg-slate-200'
                                        }`}>
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <span>Job Seeker</span>
                                    </div>
                                    
                                    <Switch
                                        checked={selectedRole === 'employer'}
                                        onCheckedChange={checked => {
                                            setSelectedRole(checked ? 'employer' : 'candidate');
                                            form.setValue('role', checked ? 'employer' : 'candidate');
                                        }}
                                        id="role-toggle"
                                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-purple-600 scale-125"
                                    />
                                    
                                    <div className={`flex items-center gap-3 transition-all duration-300 px-4 py-2 rounded-xl ${
                                        selectedRole === 'employer' 
                                            ? 'text-blue-600 font-bold bg-blue-50 border border-blue-200' 
                                            : 'text-slate-500 font-medium hover:text-slate-700'
                                    }`}>
                                        <div className={`p-2 rounded-lg ${
                                            selectedRole === 'employer' ? 'bg-blue-100' : 'bg-slate-200'
                                        }`}>
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <span>Employer</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Google Sign-up */}
                            <GoogleSignInButton 
                                text={`Continue with Google as ${selectedRole === 'candidate' ? 'Job Seeker' : 'Employer'}`}
                                className="w-full bg-white/60 backdrop-blur-sm border-slate-200 text-slate-700 hover:bg-white/80 hover:border-slate-300 transition-all duration-300 rounded-xl py-3 font-medium shadow-lg hover:shadow-xl" 
                                role={selectedRole}
                            />
                            
                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white/80 backdrop-blur-sm px-4 py-1 text-slate-500 font-semibold rounded-full">
                                        Or create account with email
                                    </span>
                                </div>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-700 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                        First Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="John" 
                                                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 bg-white/60 backdrop-blur-sm rounded-xl h-12 text-base transition-all duration-300"
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-rose-600 text-sm font-medium" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-700 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                        Last Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Doe" 
                                                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 bg-white/60 backdrop-blur-sm rounded-xl h-12 text-base transition-all duration-300"
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-rose-600 text-sm font-medium" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                    Email Address
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="email" 
                                                        placeholder="Enter your email address"
                                                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 bg-white/60 backdrop-blur-sm rounded-xl h-12 text-base transition-all duration-300"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-rose-600 text-sm font-medium" />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="relative">
                                                <FormLabel className="flex items-center gap-2 text-slate-700 font-semibold text-sm uppercase tracking-wide">
                                                    <Lock className="h-4 w-4 text-blue-600" />
                                                    Password
                                                    <button
                                                        type="button"
                                                        aria-label="Show password requirements"
                                                        className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 hover:bg-blue-50 transition-colors duration-200"
                                                        onClick={() => setShowPasswordRules(!showPasswordRules)}
                                                    >
                                                        <Info className="w-4 h-4 text-slate-400 hover:text-blue-600 transition-colors" />
                                                    </button>
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input 
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Create a secure password"
                                                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 bg-white/60 backdrop-blur-sm rounded-xl h-12 text-base pl-4 pr-12 transition-all duration-300"
                                                            {...field} 
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-slate-50 rounded-r-xl transition-colors duration-200"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                                            ) : (
                                                                <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-rose-600 text-sm font-medium" />
                                                
                                                {/* Password Rules Tooltip */}
                                                {showPasswordRules && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        className="absolute z-20 mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-6 text-sm w-full"
                                                    >
                                                        <div className="flex items-center gap-2 font-bold mb-4 text-slate-800">
                                                            <Shield className="h-4 w-4 text-blue-600" />
                                                            Password Requirements:
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {passwordRules.map((rule, index) => (
                                                                <li key={index} className="flex items-start gap-3 text-slate-600">
                                                                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                                    <span className="font-medium">{rule}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </motion.div>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    {/* API Error Display */}
                                    {apiError && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3"
                                        >
                                            <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-rose-700 font-medium leading-relaxed">{apiError}</span>
                                        </motion.div>
                                    )}

                                    <Button 
                                        type="submit" 
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 text-base rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Creating Account...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-3">
                                                <span>Create Account</span>
                                                <ArrowRight className="h-5 w-5" />
                                            </div>
                                        )}
                                    </Button>
                                </form>
                            </Form>

                            {/* Sign In Link */}
                            <div className="text-center pt-6 border-t border-slate-200">
                                <p className="text-slate-600 mb-3">
                                    Already have an account?
                                </p>
                                <Link 
                                    to="/login" 
                                    className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-800 transition-all duration-200 px-4 py-2 rounded-xl hover:bg-blue-50"
                                >
                                    Sign In
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            {/* Terms and Privacy */}
                            <div className="text-center">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    By creating an account, you agree to our{' '}
                                    <Link to="/terms" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                                        Terms of Service
                                    </Link>
                                    {' '}and{' '}
                                    <Link to="/privacy" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                                        Privacy Policy
                                    </Link>
                                </p>
                            </div>

                            {/* Security Notice */}
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-semibold border border-emerald-200">
                                    <Shield className="h-3 w-3" />
                                    Your information is secure and encrypted
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Help */}
                    <motion.div 
                        className="mt-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
                            <p className="text-sm text-slate-600">
                                Need help?{' '}
                                <Link 
                                    to="/support" 
                                    className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200"
                                >
                                    Contact Support
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
            
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
        </div>
    );
};

export default Register;