import React, { useState } from 'react';
import './ForgotPassword.css'; // Descomentado: considera mover los estilos aquí

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el correo de restablecimiento de contraseña
    // try {
    //   // const response = await api.post('/auth/forgot-password', { email });
    //   // setMessage('Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.');
    // } catch (error) {
    //   // setMessage('Ocurrió un error. Por favor, inténtalo de nuevo.');
    // }
    setMessage(`Se enviarían instrucciones para restablecer la contraseña a ${email} (esto es un marcador de posición).`);
    console.log('Solicitud de olvido de contraseña para:', email);
  };

  // Estilos base inspirados en las imágenes (idealmente irían en ForgotPassword.css)
  const pageStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#000000', // Fondo negro como en las capturas
    color: '#FFFFFF',
    fontFamily: 'Arial, sans-serif', // O la fuente que estés usando
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#1E1E1E', // Un gris oscuro para el contenedor del formulario
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 15px',
    marginBottom: '20px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#2C2C2C',
    color: '#FFFFFF',
    fontSize: '16px',
    boxSizing: 'border-box',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 15px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#FF0000', // Rojo característico
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  };

  const titleStyle: React.CSSProperties = {
    marginBottom: '10px',
    fontSize: '28px',
    fontWeight: 'bold',
  };

  const paragraphStyle: React.CSSProperties = {
    marginBottom: '30px',
    fontSize: '16px',
    color: '#B0B0B0', // Un gris más claro para el texto secundario
  };

  const messageStyle: React.CSSProperties = {
    marginTop: '20px',
    color: message.includes('error') || message.includes('falló') ? '#FF6B6B' : '#A0D9A0', // Rojo claro para error, verde claro para éxito
    fontSize: '14px',
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle} className="forgot-password-container"> {/* className para CSS externo */}
        <h2 style={titleStyle}>Recuperar Contraseña</h2>
        <p style={paragraphStyle}>
          Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            {/* <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', textAlign: 'left' }}>
              Dirección de Correo Electrónico
            </label> */}
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            Enviar Enlace
          </button>
        </form>
        {message && <p style={messageStyle}>{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;