import React, { createContext, useContext, useState, useEffect } from 'react';
import { trainerApi } from '../../../../../services/api.ts';

const ClientContext = createContext();

export function useClient() {
  return useContext(ClientContext);
}

export function ClientProvider({ children, clientId }) {
  const [client, setClient] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [progress, setProgress] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        
        // Fetch client details
        const clientResponse = await trainerApi.getClientDetails(clientId);
        setClient(clientResponse.data);
        
        // Fetch client routines
        const routinesResponse = await trainerApi.getClientRoutines(clientId);
        setRoutines(routinesResponse.data || []);
        
        // Fetch client progress
        const progressResponse = await trainerApi.getClientProgress(clientId);
        setProgress(progressResponse.data);
        
        // Set notes from client data
        if (clientResponse.data.notes) {
          setNotes(clientResponse.data.notes);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Failed to load client data. Please try again later.');
        setLoading(false);
      }
    };

    fetchClientData();
  }, [clientId]);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = async () => {
    try {
      await trainerApi.saveClientNotes(clientId, notes);
      return { success: true, message: '¡Notas guardadas exitosamente!' };
    } catch (err) {
      console.error('Error al guardar notas:', err);
      return { success: false, message: 'Error al guardar las notas. Por favor, intenta nuevamente.' };
    }
  };

  const handleSendPaymentReminder = async () => {
    try {
      await trainerApi.sendPaymentReminder(clientId);
      return { success: true, message: '¡Recordatorio de pago enviado exitosamente!' };
    } catch (err) {
      console.error('Error al enviar recordatorio de pago:', err);
      return { success: false, message: 'Error al enviar recordatorio de pago. Por favor, intenta nuevamente.' };
    }
  };

  const getProgressChartData = () => {
    if (!progress || !progress.metrics) return null;

    return {
      labels: progress.metrics.dates,
      datasets: [
        {
          label: 'Peso (kg)',
          data: progress.metrics.weight,
          borderColor: '#ff3b30',
          backgroundColor: 'rgba(255, 59, 48, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Grasa Corporal (%)',
          data: progress.metrics.bodyFat,
          borderColor: '#34c759',
          backgroundColor: 'rgba(52, 199, 89, 0.1)',
          tension: 0.4,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ddd'
        }
      },
      title: {
        display: true,
        text: 'Métricas de Progreso del Cliente',
        color: '#fff'
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ddd'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ddd'
        }
      }
    }
  };

  const value = {
    client,
    routines,
    progress,
    notes,
    loading,
    error,
    handleNotesChange,
    handleSaveNotes,
    handleSendPaymentReminder,
    getProgressChartData,
    chartOptions
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}