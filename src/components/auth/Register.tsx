import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { authService } from '../../services/authService'; // Se puede eliminar si no se usa en otro lado
import { toast } from 'react-hot-toast';
import './Register.css';
import { useAuth } from '../../contexts/AuthContext'; // Importar useAuth

// Define an interface for your form state to ensure type safety
interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'trainer'; // Specify that role can only be 'client' or 'trainer'
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client' as 'client' | 'trainer', // Asegurar el tipo aquí también
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth(); // Obtener la función register del contexto

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Llamar a la función register del AuthContext
      // Esta función maneja la llamada API, la actualización del estado y la navegación.
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      // AuthContext.register se encargará de mostrar el toast de éxito y la redirección.
      // Por lo tanto, las siguientes líneas ya no son necesarias aquí:
      // toast.success('¡Registro exitoso! Completa tus datos.');
      // navigate('/client/onboarding'); 

    } catch (error: any) {
      // AuthContext.register ya maneja los toasts de error.
      // Puedes dejar este console.error para debugging si lo deseas.
      console.error('Error en el componente Register durante el handleSubmit:', error);
      // toast.error(error.message || 'Error en el registro.'); // No es necesario duplicar el toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <img 
          src="/images/logo-trainfit.png" // Asegúrate que esta ruta es correcta
          alt="TrainFit Logo" 
          className="register-logo" 
        />
        <h2 className="register-title">Crear Cuenta</h2>

        <input
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="client">Alumno</option>
          <option value="trainer">Entrenador</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'REGISTRARSE'}
        </button>
        <p className="login-redirect">
          ¿Ya tenés cuenta? <span onClick={() => navigate('/login')}>Iniciar sesión</span>
        </p>
      </form>
    </div>
  );
};

export default Register;