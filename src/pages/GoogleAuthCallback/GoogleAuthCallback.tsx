import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';

const GoogleAuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleAuthCallback } = useGoogleCalendar();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (code) {
      handleAuthCallback(code).then(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        navigate('/client-dashboard/' + (user.id || ''), { replace: true });
      }).catch(() => {
        navigate(-1);
      });
    } else {
      navigate(-1);
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>📅</div>
        <p>Conectando con Google Calendar...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
