import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
    const { userInfo, logout } = useAuth();
    const navigate = useNavigate();

    const renderNavLinks = () => {
        if (!userInfo) return null; // No nav links if not logged in, besides the logo

        if (userInfo.role === 'employer') {
            return (
                <>
                    <NavLink to="/employer/dashboard" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? '' : 'text-muted-foreground'}`}>
                        Dashboard
                    </NavLink>
                    {/* Add more employer-specific links here */}
                </>
            );
        }

        if (userInfo.role === 'candidate') {
            return (
                <>
                    <NavLink to="/jobs" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? '' : 'text-muted-foreground'}`}>
                        Browse Jobs
                    </NavLink>
                    <NavLink to="/candidate/dashboard" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? '' : 'text-muted-foreground'}`}>
                        My Applications
                    </NavLink>
                    <NavLink to="/candidate/analytics" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? '' : 'text-muted-foreground'}`}>
                        Interview Analytics
                    </NavLink>
                </>
            );
        }
    };

    return (
        <motion.header 
            className="fixed top-0 left-0 w-full z-50 border-b backdrop-blur-xl bg-white/10 supports-[backdrop-filter]:bg-white/10 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
        >
            <div className="container h-14 flex items-center">
                <Link to="/" className="mr-6 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-pink-500"><path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.7 10.2 19 8.9 19 7c0-2.2-1.8-4-4-4S11 4.8 11 7c0 1.9 1.3 3.2 2.5 4.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                    <span className="font-bold text-white text-xl tracking-tight bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IntelliVibe</span>
                </Link>

                <nav className="flex-1 flex items-center space-x-6">
                    {renderNavLinks()}
                </nav>

                <div className="flex items-center justify-end space-x-4">
                    {userInfo ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="rounded-full bg-white/20 text-white border border-pink-400 hover:bg-pink-500/30">
                                    <User className="h-5 w-5" />
                                    <span className="sr-only">Toggle user menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => navigate('/profile')}>
                                    My Account
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => navigate(userInfo.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard')}>
                                    Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={logout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="ghost" asChild className="text-white border border-pink-400 bg-white/10 hover:bg-pink-500/20 hover:text-white">
                                <Link to="/login">Login</Link>
                            </Button>
                            <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none shadow-md hover:from-pink-600 hover:to-purple-700">
                                <Link to="/register">Sign Up</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </motion.header>
    );
};

export default Header;