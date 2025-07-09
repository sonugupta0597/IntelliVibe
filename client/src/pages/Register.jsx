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
import { Loader2 } from 'lucide-react'; // Import a loader icon
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { Switch } from "@/components/ui/switch";
import { Info } from 'lucide-react';

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
    const [apiError, setApiError] = useState(null); // State to hold server-side error messages
    const [selectedRole, setSelectedRole] = useState('candidate');
    const [showPasswordRules, setShowPasswordRules] = useState(false);

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

    // THE FIX IS IN THIS FUNCTION
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
            // THIS IS THE CORRECT WAY TO HANDLE THE ERROR
            const errorMessage = error.response?.data?.message || "An unexpected error occurred. Please try again.";
            
            // Log the *specific message string*, not the whole object
            console.error("Registration failed:", errorMessage); 
            
            // Set the error message in state to display it in the UI
            setApiError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="flex justify-center items-center py-12"
        >
            <Card className="w-full max-w-md">
                <CardHeader className="mb-10">
                    <CardTitle className="text-2xl">Join the AI Recruitment Revolution</CardTitle>
                    <CardDescription>Sign up as a candidate or employer and experience AI-powered hiring.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center mb-4 gap-4">
                        <span className={selectedRole === 'candidate' ? 'font-bold' : ''}>Candidate</span>
                        <Switch
                            checked={selectedRole === 'employer'}
                            onCheckedChange={checked => {
                                setSelectedRole(checked ? 'employer' : 'candidate');
                                form.setValue('role', checked ? 'employer' : 'candidate');
                            }}
                            id="role-toggle"
                        />
                        <span className={selectedRole === 'employer' ? 'font-bold' : ''}>Employer</span>
                    </div>
                    <GoogleSignInButton text={`Sign up with Google as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`} className="w-full mb-4" role={selectedRole} />
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                               <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-destructive text-red-500 font-semibold mt-1" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-destructive text-red-500 font-semibold mt-1" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="you@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-destructive text-red-500 font-semibold mt-1" />
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
                            {/* Remove the dropdown role selector, replaced by toggle */}
                            {/* Display API error message here */}
                            {apiError && (
                                <p className="text-sm font-medium text-destructive">{apiError}</p>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>
                    </Form>
                    <p className="text-center text-sm text-white mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary hover:underline">
                            Login
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;