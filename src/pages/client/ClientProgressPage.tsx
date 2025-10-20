import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import './ClientProgressPage.css';

interface Routine {
  id: string;
  name: string;
  description: string;
  assignedDate: string;
  status: 'active' | 'completed' | 'pending';
  progress: number;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  completed: boolean;
}

interface PaymentStatus {
  isUpToDate: boolean;
  lastPaymentDate: string;
  nextPaymentDue: string;
  amount: number;
}

const ClientProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned routines
      const routinesResponse = await clientApi.getAssignedRoutines();
      setRoutines(routinesResponse.data || []);
      
      // Fetch payment status
      const paymentResponse = await clientApi.getPaymentStatus();
      setPaymentStatus(paymentResponse.data);
      
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError('Error al cargar los datos de progreso');
      
      // Mock data for development
      setRoutines([
        {
          id: '1',
          name: 'Rutina de Fuerza - Enero',
          description: 'Rutina enfocada en desarrollo de fuerza muscular',
          assignedDate: '2024-01-01',
          status: 'active',
          progress: 75,
          exercises: [
            { id: '1', name: 'Sentadillas', sets: 4, reps: 12, completed: true },
            { id: '2', name: 'Press de banca', sets: 4, reps: 10, completed: true },
            { id: '3', name: 'Peso muerto', sets: 3, reps: 8, completed: false }
          ]
        },
        {
          id: '2',
          name: 'Rutina Cardio - Diciembre',
          description: 'Rutina cardiovascular para resistencia',
          assignedDate: '2023-12-01',
          status: 'completed',
          progress: 100,
          exercises: [
            { id: '4', name: 'Correr', sets: 1, reps: 30, completed: true },
            { id: '5', name: 'Burpees', sets: 3, reps: 15, completed: true }
          ]
        }
      ]);
      
      setPaymentStatus({
        isUpToDate: true,
        lastPaymentDate: '2024-01-15',
        nextPaymentDue: '2024-02-15',
        amount: 150
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMonthlyRoutine = async (routineId: string) => {
    try {
      setSendingEmail(true);
      await clientApi.sendMonthlyRoutineEmail(routineId);
      toast.success('Rutina enviada por correo electrónico exitosamente');
    } catch (err) {
      console.error('Error sending email:', err);
      toast.error('Error al enviar la rutina por correo');
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { text: 'Activa', className: 'status-active' },
      completed: { text: 'Completada', className: 'status-completed' },
      pending: { text: 'Pendiente', className: 'status-pending' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <span className={`status-badge ${config.className}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="client-progress-page">
        <div className="progress-header">
          <button className="back-button" onClick={() => navigate(`/client-dashboard/${user?.id}`)}>
          ← Volver al Dashboard
        </button>
          <h1>Cargando progreso...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="client-progress-page">
      <div className="progress-header">
        <button className="back-button" onClick={() => navigate(`/client-dashboard/${user?.id}`)}>
          ← Volver al Dashboard
        </button>
        <h1>Mi Progreso</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Payment Status Section */}
      <div className="payment-status-section">
        <h2>Estado de Cuotas</h2>
        <div className="payment-card">
          {paymentStatus ? (
            <>
              <div className={`payment-indicator ${paymentStatus.isUpToDate ? 'up-to-date' : 'overdue'}`}>
                {paymentStatus.isUpToDate ? '✓ Al día' : '⚠ Atrasado'}
              </div>
              <div className="payment-details">
                <div className="payment-item">
                  <span className="label">Último pago:</span>
                  <span className="value">{new Date(paymentStatus.lastPaymentDate).toLocaleDateString()}</span>
                </div>
                <div className="payment-item">
                  <span className="label">Próximo vencimiento:</span>
                  <span className="value">{new Date(paymentStatus.nextPaymentDue).toLocaleDateString()}</span>
                </div>
                <div className="payment-item">
                  <span className="label">Monto mensual:</span>
                  <span className="value">${paymentStatus.amount}</span>
                </div>
              </div>
            </>
          ) : (
            <p>No se pudo cargar el estado de pagos</p>
          )}
        </div>
      </div>

      {/* Assigned Routines Section */}
      <div className="routines-section">
        <h2>Rutinas Asignadas</h2>
        {routines.length === 0 ? (
          <div className="no-routines">
            <p>No tienes rutinas asignadas actualmente.</p>
          </div>
        ) : (
          <div className="routines-grid">
            {routines.map((routine) => (
              <div key={routine.id} className="routine-card">
                <div className="routine-header">
                  <h3>{routine.name}</h3>
                  {getStatusBadge(routine.status)}
                </div>
                
                <p className="routine-description">{routine.description}</p>
                
                <div className="routine-meta">
                  <div className="meta-item">
                    <span className="label">Asignada:</span>
                    <span className="value">{new Date(routine.assignedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Progreso:</span>
                    <span className="value">{routine.progress}%</span>
                  </div>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${routine.progress}%` }}
                  ></div>
                </div>
                
                <div className="exercises-summary">
                  <h4>Ejercicios ({routine.exercises.length})</h4>
                  <div className="exercises-list">
                    {routine.exercises.map((exercise) => (
                      <div key={exercise.id} className="exercise-item">
                        <span className={`exercise-name ${exercise.completed ? 'completed' : ''}`}>
                          {exercise.completed ? '✓' : '○'} {exercise.name}
                        </span>
                        <span className="exercise-details">
                          {exercise.sets} x {exercise.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="routine-actions">
                  <button 
                    className="email-button"
                    onClick={() => handleSendMonthlyRoutine(routine.id)}
                    disabled={sendingEmail}
                  >
                    {sendingEmail ? 'Enviando...' : '📧 Enviar por Email'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProgressPage;