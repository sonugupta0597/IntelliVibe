import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * A component to protect routes based on user authentication and role.
 * @param {object} props
 * @param {string} props.requiredRole - The role required to access the route (e.g., 'employer', 'candidate').
 */
const ProtectedRoute = ({ requiredRole }) => {
    // 1. Get user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // 2. Check if the user is logged in
    if (!userInfo) {
        // If not logged in, redirect to the login page.
        // `replace` prevents the user from going back to the protected page via the browser's back button.
        return <Navigate to="/login" replace />;
    }

    // 3. Check if the user has the required role
    if (requiredRole && userInfo.role !== requiredRole) {
        // If logged in but wrong role, redirect to the homepage (or an "unauthorized" page).
        // This prevents a candidate from accessing the employer dashboard and vice-versa.
        return <Navigate to="/" replace />;
    }

    // 4. If all checks pass, render the child component
    // <Outlet /> is a placeholder from react-router-dom that renders the matched child route.
    return <Outlet />;
};

export default ProtectedRoute;