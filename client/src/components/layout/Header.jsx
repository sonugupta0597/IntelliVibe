import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
    const { userInfo, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const renderNavLinks = () => {
        if (!userInfo) {
            return (
                <>
                    <NavLink to="/jobs" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} onClick={() => setIsMobileMenuOpen(false)}>
                        Browse Jobs
                    </NavLink>
                </>
            );
        }

        if (userInfo.role === 'employer') {
            return (
                <>
                    <NavLink to="/employer/dashboard" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} onClick={() => setIsMobileMenuOpen(false)}>
                        Dashboard
                    </NavLink>
                </>
            );
        }

        if (userInfo.role === 'candidate') {
            return (
                <>
                    <NavLink to="/jobs" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} onClick={() => setIsMobileMenuOpen(false)}>
                        Browse Jobs
                    </NavLink>
                    <NavLink to="/candidate/dashboard" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} onClick={() => setIsMobileMenuOpen(false)}>
                        My Applications
                    </NavLink>
                    <NavLink to="/candidate/analytics" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} onClick={() => setIsMobileMenuOpen(false)}>
                        Interview Analytics
                    </NavLink>
                </>
            );
        }
    };

    return (
        <motion.header 
            className="w-full z-50 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-100 shadow-lg rounded-b-2xl border-b border-blue-100"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full h-20 flex items-center px-6 lg:px-12">
                <Link to="/" className="mr-8 flex items-center space-x-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow text-white font-bold text-2xl">IV</div>
                    <span className="font-extrabold text-2xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent tracking-tight">IntelliVibe</span>
                </Link>

                {/* Hamburger menu button for small screens */}
                <div className="md:hidden flex-1 flex justify-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-gray-600 hover:bg-gray-100"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>

                {/* Desktop navigation and auth buttons */}
                <nav className="hidden md:flex flex-1 items-center space-x-8">
                    {renderNavLinks()}
                </nav>
                <div className="hidden md:flex items-center justify-end space-x-4">
                    {userInfo ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200">
                                    <User className="h-5 w-5" />
                                    <span className="sr-only">Toggle user menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white text-gray-900 border-gray-200">
                                <DropdownMenuItem onSelect={() => navigate(userInfo.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard')} className="hover:bg-gray-100">
                                    Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-200" />
                                <DropdownMenuItem onSelect={logout} className="text-red-500 hover:bg-gray-100 focus:text-red-500 focus:bg-gray-100">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="ghost" asChild className="text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                                <Link to="/login">Login</Link>
                            </Button>
                            <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
                                <Link to="/register">Sign Up</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile menu (conditionally rendered) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden bg-white shadow-md pb-4"
                    >
                        <nav className="flex flex-col items-center space-y-4 py-4">
                            {renderNavLinks()}
                            {userInfo ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className="rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200">
                                            <User className="h-5 w-5" />
                                            <span className="sr-only">Toggle user menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="center" className="bg-white text-gray-900 border-gray-200">
                                        <DropdownMenuItem onSelect={() => {
                                            navigate(userInfo.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard');
                                            setIsMobileMenuOpen(false);
                                        }} className="hover:bg-gray-100">
                                            Dashboard
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-gray-200" />
                                        <DropdownMenuItem onSelect={() => {
                                            logout();
                                            setIsMobileMenuOpen(false);
                                        }} className="text-red-500 hover:bg-gray-100 focus:text-red-500 focus:bg-gray-100">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex flex-col space-y-2 w-full px-4">
                                    <Button asChild className="bg-blue-600 text-white hover:bg-blue-700 w-full">
                                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                                    </Button>
                                    <Button asChild className="bg-blue-600 text-white hover:bg-blue-700 w-full">
                                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                                    </Button>
                                </div>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;