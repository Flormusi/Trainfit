import React from 'react';
import { useNavigate } from 'react-router-dom'; // Asumiendo que usas React Router para la navegación
import './LandingPage.css';
// import Logo from '../../components/common/Logo'; // Si tienes un componente Logo separado

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/register'); // Ajusta la ruta según tu configuración de enrutamiento
  };

  const handleLogin = () => {
    navigate('/login'); // Ajusta la ruta según tu configuración de enrutamiento
  };

  return (
    <div className="landing-container">
      <header className="landing-header">
        <img src="/images/logo-trainfit.png" alt="TrainFit Logo" className="landing-logo-image" />
      </header>
      <main className="landing-main-content">
        <h2 className="landing-welcome-title">¡Bienvenid@s!</h2>
        <p className="landing-subtitle">
          Acá vas a encontrar tu rutina, tus avances y todo lo que necesitás para entrenar.
        </p>
        <div className="landing-actions">
          <button className="landing-button primary" onClick={handleRegister}>
            REGISTRARSE
          </button>
          <button className="landing-button secondary" onClick={handleLogin}>
            INICIAR SESIÓN
          </button>
        </div>
      </main>
      {/* <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} TrainFit. Todos los derechos reservados.</p>
      </footer> */}
    </div>
  );
};

export default LandingPage;