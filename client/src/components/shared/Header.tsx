import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MembershipIndicator from './MembershipIndicator';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Comentamos el return para que no renderice el header problemático
  /*
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img 
              src="/images/logo-trainfit.png" 
              alt="TrainFit Logo" 
              className="h-10 md:h-12 w-auto" // Mantenemos las clases de Tailwind por si se resuelve el problema o para referencia
              style={{ height: '40px', width: 'auto' }} // Estilo en línea para asegurar el tamaño
            />
            <MembershipIndicator />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
  */

  // Alternativamente, simplemente retorna null si este Header no debe mostrar nada
  return null; 
};

export default Header;