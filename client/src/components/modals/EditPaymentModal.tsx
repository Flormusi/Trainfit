import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './EditPaymentModal.css';

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { amount: number; dueDate: string; plan: string; status: string }) => void;
  initialData: {
    amount: string;
    dueDate: string;
    plan?: string;
    status?: string;
  };
  clientName?: string;
}

interface PaymentData {
  amount: number;
  dueDate: string;
  plan: string;
  status: string;
}

const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  clientName = 'Cliente'
}) => {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [plan, setPlan] = useState('monthly');
  const [status, setStatus] = useState('pending');
  const [loading, setSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Opciones de planes disponibles
  const planOptions = [
    { value: 'monthly', label: 'Plan Mensual' },
    { value: 'quarterly', label: 'Plan Trimestral' },
    { value: 'biannual', label: 'Plan Semestral' },
    { value: 'annual', label: 'Plan Anual' },
    { value: 'basic', label: 'Plan Básico' },
    { value: 'premium', label: 'Plan Premium' },
    { value: 'vip', label: 'Plan VIP' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'paid', label: 'Pagado' },
    { value: 'overdue', label: 'Vencido' }
  ];

  // Inicializar campos cuando se abre el modal
  useEffect(() => {
    if (isOpen && initialData) {
      setAmount(initialData.amount || '');
      setDueDate(initialData.dueDate || '');
      setPlan(initialData.plan || 'monthly');
      setStatus(initialData.status || 'pending');
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!dueDate) {
      newErrors.dueDate = 'La fecha de vencimiento es requerida';
    } else {
      const selectedDate = new Date(dueDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'La fecha de vencimiento no puede ser anterior a hoy';
      }
    }

    if (!plan) {
      newErrors.plan = 'Debe seleccionar un plan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      await onSave({
        amount: parseFloat(amount),
        dueDate,
        plan,
        status
      });
      toast.success('Información de pago actualizada correctamente');
      onClose();
    } catch (error) {
      console.error('Error saving payment:', error);
      toast.error('Error al actualizar la información de pago');
    } finally {
      setSaving(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!loading) {
      setErrors({});
      onClose();
    }
  };

  // Formatear fecha para input date
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="edit-payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Información de Pago</h2>
          <p className="modal-subtitle">Cliente: {clientName}</p>
          <button 
            className="modal-close-btn"
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="amount">Monto ($)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ingrese el monto"
              min="0"
              step="0.01"
              className={errors.amount ? 'error' : ''}
              disabled={loading}
            />
            {errors.amount && <span className="error-message">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Fecha de Vencimiento</label>
            <input
              type="date"
              id="dueDate"
              value={formatDateForInput(dueDate)}
              onChange={(e) => setDueDate(e.target.value)}
              className={errors.dueDate ? 'error' : ''}
              disabled={loading}
            />
            {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="plan">Plan de Suscripción</label>
            <select
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className={errors.plan ? 'error' : ''}
              disabled={loading}
            >
              {planOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.plan && <span className="error-message">{errors.plan}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="status">Estado del Pago</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPaymentModal;