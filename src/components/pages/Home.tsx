import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LandingPage from './LandingPage';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === 'trainer') {
        navigate('/trainer/dashboard');
      } else if (user.role === 'client') {
        navigate('/client/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // If user is not authenticated, show the LandingPage
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // This will only be shown briefly during the redirect
  return <div>Redirecting...</div>;
};

export default Home;