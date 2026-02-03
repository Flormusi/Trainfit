import React, { useState } from 'react';
import { 
  CalendarIcon, 
  CloudArrowUpIcon, 
  CloudArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface GoogleCalendarIntegrationProps {
  onClose: () => void;
}

interface SyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  syncInProgress: boolean;
  error: string | null;
}

const GoogleCalendarIntegration: React.FC<GoogleCalendarIntegrationProps> = ({ onClose }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    lastSync: null,
    syncInProgress: false,
    error: null
  });

  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: 15, // minutos
    syncDirection: 'bidirectional', // 'import', 'export', 'bidirectional'
    calendarName: 'TrainFit - Rutinas'
  });

  const handleConnect = async () => {
    setSyncStatus(prev => ({ ...prev, syncInProgress: true, error: null }));
    
    try {
      // Simular conexión con Google Calendar API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSyncStatus({
        isConnected: true,
        lastSync: new Date(),
        syncInProgress: false,
        error: null
      });
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: 'Error al conectar con Google Calendar'
      }));
    }
  };

  const handleDisconnect = () => {
    setSyncStatus({
      isConnected: false,
      lastSync: null,
      syncInProgress: false,
      error: null
    });
  };

  const handleSync = async () => {
    if (!syncStatus.isConnected) return;
    
    setSyncStatus(prev => ({ ...prev, syncInProgress: true, error: null }));
    
    try {
      // Simular sincronización
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        syncInProgress: false
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: 'Error durante la sincronización'
      }));
    }
  };

  return (
    <div className="google-sync-content">
      <div className="sync-header">
        <div className="sync-title">
          <CalendarIcon className="sync-icon" />
          <h3>Sincronización con Google Calendar</h3>
        </div>
        <div className="sync-status">
          {syncStatus.isConnected ? (
            <div className="status-connected">
              <CheckCircleIcon className="status-icon" />
              <span>Conectado</span>
            </div>
          ) : (
            <div className="status-disconnected">
              <ExclamationTriangleIcon className="status-icon" />
              <span>Desconectado</span>
            </div>
          )}
        </div>
      </div>

      {syncStatus.error && (
        <div className="sync-error">
          <ExclamationTriangleIcon className="error-icon" />
          <span>{syncStatus.error}</span>
        </div>
      )}

      <div className="sync-info">
        <div className="info-item">
          <strong>Estado:</strong>
          <span>{syncStatus.isConnected ? 'Conectado' : 'Desconectado'}</span>
        </div>
        {syncStatus.lastSync && (
          <div className="info-item">
            <strong>Última sincronización:</strong>
            <span>{syncStatus.lastSync.toLocaleString('es-ES')}</span>
          </div>
        )}
      </div>

      {!syncStatus.isConnected ? (
        <div className="connect-section">
          <p>Conecta tu cuenta de Google para sincronizar automáticamente tus rutinas con Google Calendar.</p>
          <button 
            className="connect-btn"
            onClick={handleConnect}
            disabled={syncStatus.syncInProgress}
          >
            {syncStatus.syncInProgress ? (
              <>
                <div className="spinner-small"></div>
                Conectando...
              </>
            ) : (
              <>
                <CalendarIcon className="btn-icon" />
                Conectar con Google Calendar
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="connected-section">
          <div className="sync-settings">
            <h4>
              <Cog6ToothIcon className="settings-icon" />
              Configuración de Sincronización
            </h4>
            
            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={syncSettings.autoSync}
                  onChange={(e) => setSyncSettings(prev => ({ ...prev, autoSync: e.target.checked }))}
                />
                <span className="checkmark"></span>
                Sincronización automática
              </label>
            </div>

            <div className="setting-group">
              <label>Intervalo de sincronización:</label>
              <select
                value={syncSettings.syncInterval}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, syncInterval: parseInt(e.target.value) }))}
              >
                <option value={5}>5 minutos</option>
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Dirección de sincronización:</label>
              <select
                value={syncSettings.syncDirection}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, syncDirection: e.target.value }))}
              >
                <option value="import">Solo importar de Google Calendar</option>
                <option value="export">Solo exportar a Google Calendar</option>
                <option value="bidirectional">Sincronización bidireccional</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Nombre del calendario:</label>
              <input
                type="text"
                value={syncSettings.calendarName}
                onChange={(e) => setSyncSettings(prev => ({ ...prev, calendarName: e.target.value }))}
              />
            </div>
          </div>

          <div className="sync-actions">
            <button 
              className="sync-btn"
              onClick={handleSync}
              disabled={syncStatus.syncInProgress}
            >
              {syncStatus.syncInProgress ? (
                <>
                  <div className="spinner-small"></div>
                  Sincronizando...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="btn-icon" />
                  Sincronizar ahora
                </>
              )}
            </button>
            
            <button 
              className="disconnect-btn"
              onClick={handleDisconnect}
            >
              Desconectar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarIntegration;