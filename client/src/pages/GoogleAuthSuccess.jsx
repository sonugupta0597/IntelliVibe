import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      // Store token in localStorage (or context)
      localStorage.setItem('userInfo', JSON.stringify({ token }));
      // Optionally, decode token to get user role and redirect accordingly
      // For now, just redirect to dashboard
      navigate('/candidate/dashboard', { replace: true });
    } else {
      // If no token, redirect to login
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg font-semibold">Signing you in with Google...</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess; 