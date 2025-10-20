import React from 'react';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import './GoogleCalendarIntegration.css';

interface GoogleCalendarIntegrationProps {
  trainingSchedule?: any[];
  onSyncComplete?: () => void;
}

const GoogleCalendarIntegration: React.FC<GoogleCalendarIntegrationProps> = ({
  trainingSchedule = [],
  onSyncComplete
}) => {
  const {
    isAuthenticated,
    isLoading,
    isSyncing,
    error,
    connectToGoogle,
    syncTrainings,
    disconnect
  } = useGoogleCalendar();

  const handleSync = async () => {
    if (trainingSchedule.length === 0) {
      alert('No hay entrenamientos programados para sincronizar');
      return;
    }

    await syncTrainings(trainingSchedule);
    onSyncComplete?.();
  };

  return (
    <div className="google-calendar-integration">
      <div className="integration-header">
        <div className="google-icon">📅</div>
        <h3 className="integration-title">Integración con Google Calendar</h3>
      </div>
      
      <div className={`connection-status ${isAuthenticated ? 'connected' : 'disconnected'}`}>
        <div className={`status-icon ${isAuthenticated ? 'connected' : 'disconnected'}`}>
          {isAuthenticated ? '✓' : '✕'}
        </div>
        <div className="status-info">
          <div className="status-text">
            {isAuthenticated ? 'Conectado a Google Calendar' : 'No conectado a Google Calendar'}
          </div>
          {isAuthenticated && (
            <div className="status-details">
              Tu cuenta está sincronizada y lista para crear eventos
            </div>
          )}
        </div>
      </div>
        
      {error && (
        <div className="error-message">
          <svg className="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
          {error}
        </div>
      )}

      <div className="integration-content">
        {!isAuthenticated ? (
          <div className="connect-section">
            <p className="description">
              Conecta tu cuenta de Google Calendar para sincronizar automáticamente tus entrenamientos.
            </p>
            <button 
              className="btn-connect"
              onClick={connectToGoogle}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Conectando...
                </>
              ) : (
                <>
                  <svg className="google-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Conectar con Google Calendar
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="connected-section">
            <div className="sync-info">
              <p className="sync-description">
                Tu cuenta está conectada. Puedes sincronizar tus entrenamientos programados.
              </p>
              {trainingSchedule.length > 0 && (
                <p className="training-count">
                  {trainingSchedule.length} entrenamientos listos para sincronizar
                </p>
              )}
            </div>
            
            <div className="action-buttons">
              <button 
                className="btn-sync"
                onClick={handleSync}
                disabled={isSyncing || trainingSchedule.length === 0}
              >
                {isSyncing ? (
                  <>
                    <div className="spinner"></div>
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <svg className="sync-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" fill="currentColor"/>
                    </svg>
                    Sincronizar Entrenamientos
                  </>
                )}
              </button>
              
              <button 
                className="btn-disconnect"
                onClick={disconnect}
                disabled={isSyncing}
              >
                Desconectar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleCalendarIntegration;