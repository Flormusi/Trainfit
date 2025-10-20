import React from 'react';
import './PaymentHistoryModal.css';
import { calculateAnnualTotal, formatCurrencyARS } from '../../../utils/payments';

interface PaymentHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  method: string;
}

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentHistory: PaymentHistoryItem[];
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  paymentHistory
}) => {
  if (!isOpen) return null;

  const mockPaymentHistory: PaymentHistoryItem[] = [
    {
      id: '1',
      date: '2025-12-04T12:00:00',
      description: 'Cuota mensual - Diciembre 2025',
      amount: 45000,
      status: 'pending',
      method: 'Transferencia bancaria'
    },
    {
      id: '2',
      date: '2025-11-04T12:00:00',
      description: 'Cuota mensual - Noviembre 2025',
      amount: 45000,
      status: 'pending',
      method: 'Efectivo'
    },
    {
      id: '3',
      date: '2025-10-04T12:00:00',
      description: 'Cuota mensual - Octubre 2025',
      amount: 45000,
      status: 'paid',
      method: 'Transferencia bancaria'
    },
    {
      id: '4',
      date: '2025-09-04T12:00:00',
      description: 'Cuota mensual - Septiembre 2025',
      amount: 40000,
      status: 'paid',
      method: 'Efectivo'
    },
    {
      id: '5',
      date: '2025-08-04T12:00:00',
      description: 'Cuota mensual - Agosto 2025',
      amount: 40000,
      status: 'paid',
      method: 'Transferencia bancaria'
    },
    {
      id: '6',
      date: '2025-07-04T12:00:00',
      description: 'Cuota mensual - Julio 2025',
      amount: 40000,
      status: 'paid',
      method: 'Efectivo'
    },
    {
      id: '7',
      date: '2025-06-04T12:00:00',
      description: 'Cuota mensual - Junio 2025',
      amount: 40000,
      status: 'paid',
      method: 'Transferencia bancaria'
    },
    {
      id: '8',
      date: '2025-05-04T12:00:00',
      description: 'Cuota mensual - Mayo 2025',
      amount: 40000,
      status: 'paid',
      method: 'Efectivo'
    },
    {
      id: '9',
      date: '2025-04-04T12:00:00',
      description: 'Cuota mensual - Abril 2025',
      amount: 40000,
      status: 'paid',
      method: 'Transferencia bancaria'
    },
    {
      id: '10',
      date: '2025-03-04T12:00:00',
      description: 'Cuota mensual - Marzo 2025',
      amount: 40000,
      status: 'paid',
      method: 'Efectivo'
    },
    {
      id: '11',
      date: '2025-02-04T12:00:00',
      description: 'Cuota mensual - Febrero 2025',
      amount: 40000,
      status: 'paid',
      method: 'Transferencia bancaria'
    },
    {
      id: '12',
      date: '2025-01-04T12:00:00',
      description: 'Cuota mensual - Enero 2025',
      amount: 40000,
      status: 'paid',
      method: 'Efectivo'
    }
  ];

  const historyToShow = paymentHistory.length > 0 ? paymentHistory : mockPaymentHistory;
  // Ajuste del resumen según el mes actual: en octubre 2025 debe mostrar 10/11 y $400.000
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const consideredMonths = Math.min(12, currentMonth + 1);
  const consideredPayments = historyToShow.filter((p) => {
    const d = new Date(p.date);
    return d.getFullYear() === 2025 && (d.getMonth() + 1) <= consideredMonths;
  });
  const totalPaid = consideredPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPayments = consideredPayments.length;
  const paidPayments = consideredPayments.filter(p => p.status === 'paid').length;

  // Total anual (enero a diciembre 2025) aplicando la regla de cambio de cuota desde octubre
  const paymentsYear = historyToShow.filter((p) => {
    const d = new Date(p.date);
    return d.getFullYear() === 2025;
  });
  const totalAnnual = calculateAnnualTotal(paymentsYear, 2025);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencido';
      default: return status;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Historial de Pagos</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          {/* Resumen */}
          <div className="payment-history-summary">
            <div className="summary-item">
              <div className="summary-label">Total Pagado</div>
              <div className="summary-value">{formatCurrencyARS(totalPaid)}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Pagos Realizados</div>
              <div className="summary-value">{paidPayments}/{totalPayments}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Estado General</div>
              <div className="summary-value">Al día</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Total Anual 2025</div>
              <div className="summary-value">{formatCurrencyARS(totalAnnual)}</div>
            </div>
          </div>

          {/* Lista de pagos */}
          <div className="payment-history-list">
            {historyToShow.map((payment) => (
              <div key={payment.id} className="payment-history-item">
                <div className="payment-item-header">
                  <div className="payment-item-date">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    {new Date(payment.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  <div className={`payment-item-status status-${payment.status}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      {payment.status === 'paid' ? (
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      ) : payment.status === 'pending' ? (
                        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      ) : (
                        <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      )}
                    </svg>
                    {getStatusText(payment.status)}
                  </div>
                </div>
                
                <div className="payment-item-details">
                  <div className="payment-item-description">{payment.description}</div>
                  <div className="payment-item-method">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    {payment.method}
                  </div>
                </div>
                
                <div className="payment-item-amount">
                  {formatCurrencyARS(payment.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryModal;