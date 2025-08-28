import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; // Asegúrate de crear este archivo CSS

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container-dark">
      <img 
        src="/images/logo-trainfit.png" 
        alt="TrainFit Logo" 
        className="landing-logo-dark" 
      />
      <h1 className="landing-welcome-text-dark">¡Bienvenid@s!</h1>
      <p className="landing-tagline-dark">
        Acá vas a encontrar tu rutina, tus avances y todo lo que necesitás para entrenar.
      </p>
      <div className="landing-buttons-dark">
        <button 
          onClick={() => navigate('/register')} 
          className="btn-dark btn-register-dark"
        >
          REGISTRARSE
        </button>
        <button 
          onClick={() => navigate('/login')} 
          className="btn-dark btn-login-dark"
        >
          INICIAR SESIÓN
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
