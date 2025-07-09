import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Info } from 'lucide-react'; // For loading spinner
import { useAuth } from '@/contexts/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { motion } from 'framer-motion';

// Define the validation schema with Zod
const passwordRules = [
  "At least 8 characters",
  "At least one uppercase letter (A-Z)",
  "At least one lowercase letter (a-z)",
  "At least one number (0-9)",
  "At least one special character (!@#$%^&*)"
];

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[!@#$%^&*]/, { message: "Password must contain at least one special character (!@#$%^&*)." }),
});

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const { login } = useAuth(); // Get the login function from context
    const [showPasswordRules, setShowPasswordRules] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values) => {
        setIsLoading(true);
        setApiError(null);
        try {
            const { data } = await axios.post('http://localhost:5001/api/auth/login', values);
            
            // In a real app, you'd save this to AuthContext
           login(data);
            
            // Redirect based on role
            if (data.role === 'employer') {
                navigate('/employer/dashboard');
            } else {
                navigate('/candidate/dashboard');
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
            setApiError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center items-center py-12"
        >
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome to AI Recruiter</CardTitle>
                    <CardDescription>Sign in to access your AI-powered recruitment dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <GoogleSignInButton text="Sign in with Google" className="w-full mb-4" />
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="you@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="relative">
                                        <FormLabel className="flex items-center gap-2">
                                            Password
                                            <button
                                                type="button"
                                                aria-label="Show password rules"
                                                className="focus:outline-none"
                                                onClick={() => setShowPasswordRules((v) => !v)}
                                            >
                                                <Info className="w-4 h-4 text-pink-200 hover:text-pink-400" />
                                            </button>
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-destructive text-red-500 font-semibold mt-1" />
                                        {showPasswordRules && (
                                            <div className="absolute z-20 mt-2 bg-gray-900 border border-pink-400 rounded-lg shadow-lg p-4 text-xs text-pink-100 w-64">
                                                <div className="font-semibold mb-2 text-pink-200">Password must contain:</div>
                                                <ul className="list-disc pl-5">
                                                    {passwordRules.map(rule => (
                                                        <li key={rule}>{rule}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />

                            {apiError && (
                                <p className="text-sm font-medium text-destructive">{apiError}</p>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Please wait
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </Button>
                        </form>
                    </Form>
                    <p className="text-center text-sm text-white mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default Login;