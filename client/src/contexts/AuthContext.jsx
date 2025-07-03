import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    // On initial load, check localStorage for existing user info
    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUserInfo(userData);
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUserInfo(null);
        // Redirect to login page after logout for a better UX
        navigate('/login');
    };

    const value = {
        userInfo,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create a custom hook for easy access to the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};