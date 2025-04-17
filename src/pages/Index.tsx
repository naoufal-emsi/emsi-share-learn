
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If authenticated, redirect to dashboard, otherwise to landing
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/landing');
    }
  }, [isAuthenticated, navigate]);

  // This component will not render anything as it will redirect immediately
  return null;
};

export default Index;
