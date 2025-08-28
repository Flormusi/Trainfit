// src/components/RedirectLogic.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Change this import
// import { useAuth, User } from '../context/AuthContext'; 
// To this (or the correct relative path to the plural 'contexts' version)
import { useAuth } from '../contexts/AuthContext'; 
// You might also need to adjust the User type import if it was specific to the old context

const RedirectLogic: React.FC = () => {
  // useAuth now returns the correctly typed object, including loading
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Espera a que el estado de autenticación termine de cargar
    if (loading) {
      console.log('RedirectLogic: Auth state is loading...');
      return; // No hagas nada mientras carga
    }

    // 'user' is already typed correctly from useAuth()

    if (!user) {
      console.log('RedirectLogic: No user found after loading, navigating to /login');
      navigate('/login', { replace: true });
      return;
    }

    // Si llegamos aquí, el usuario existe y la carga terminó
    console.log('RedirectLogic: User found, deciding redirection:', user);

    if (user.role === 'client') {
      // Check for hasCompletedOnboarding safely
      if (!user.hasCompletedOnboarding) {
        console.log('RedirectLogic: Client needs onboarding, navigating to /client/onboarding');
        navigate('/client/onboarding', { replace: true });
      } else {
        console.log(`RedirectLogic: Client onboarded, navigating to /client-dashboard/${user.id}`);
        navigate(`/client-dashboard/${user.id}`, { replace: true });
      }
    } else if (user.role === 'trainer') {
      console.log('RedirectLogic: Trainer detected, navigating to /trainer-dashboard');
      navigate('/trainer-dashboard', { replace: true });
    } else {
      // Caso inesperado
      console.log('RedirectLogic: Unknown user role, navigating to /login');
      navigate('/login', { replace: true });
    }
    // Dependencias: re-ejecutar si el usuario o el estado de carga cambian
  }, [user, loading, navigate]);

  // No renderizar nada visible, este componente solo redirige
  return null;
};

export default RedirectLogic;