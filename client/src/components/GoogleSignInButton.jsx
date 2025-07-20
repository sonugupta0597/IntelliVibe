import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const GoogleSignInButton = ({ text = 'Sign in with Google', className = '', role = 'candidate' }) => {
  const handleSuccess = async (credentialResponse) => {
    try {
      // Send credential and role to backend for verification and JWT issuance
      const { data } = await axios.post(`${API_URL}/api/auth/google/popup`, {
        credential: credentialResponse.credential,
        role,
      });
      // Save JWT and redirect
      localStorage.setItem('userInfo', JSON.stringify(data));
      // Optionally decode and redirect based on role
      if (data.role === 'employer') {
        window.location.href = '/employer/dashboard';
      } else {
        window.location.href = '/candidate/dashboard';
      }
    } catch (error) {
      alert('Google sign-in failed.');
    }
  };

  return (
    <div className={className}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => alert('Google sign-in failed.')}
        width="100%"
        text={text.includes('Sign up') ? 'signup_with' : 'signin_with'}
        shape="pill"
        size="large"
        useOneTap
      />
    </div>
  );
};

export default GoogleSignInButton; 