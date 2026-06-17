import React from 'react';

const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Cargando...' }) => (
  <div style={{
    minHeight: '100dvh',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  }}>
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: 28, fontWeight: 900, color: '#dc2626', letterSpacing: 2 }}>TRAIN</span>
      <span style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', letterSpacing: 2 }}>FIT</span>
    </div>
    <div style={{
      width: 40,
      height: 40,
      border: '3px solid #2a2a2a',
      borderTop: '3px solid #dc2626',
      borderRadius: '50%',
      animation: 'trainfit-spin 0.8s linear infinite',
    }} />
    <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>{message}</p>
    <style>{`@keyframes trainfit-spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default LoadingScreen;
