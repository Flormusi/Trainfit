import React from 'react';
import './PaymentHistoryModal.css';

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
      date: '2024-01-15',
      description: 'Cuota mensual - Enero 2024',
      amount: 15000,
      status: 'paid',
      method: 'Transferencia bancaria'
    },
    {
      id: '2',
      date: '2023-12-15',
      description: 'Cuota mensual - Diciembre 2023',
      amount: 15000,
      status: 'paid',
      method: 'Efectivo'
    },
    {
      id: '3',
      date: '2023-11-15',
      description: 'Cuota mensual - Noviembre 2023',
      amount: 15000,
      status: 'paid',
      method: 'Transferencia bancaria'
    },
    {
      id: '4',
      date: '2023-10-15',
      description: 'Cuota mensual - Octubre 2023',
      amount: 15000,
      status: 'paid',
      method: 'Efectivo'
    },
    {
      id: '5',
      date: '2023-09-15',
      description: 'Cuota mensual - Septiembre 2023',
      amount: 15000,
      status: 'paid',
      method: 'Transferencia bancaria'
    },
    {
      id: '6',
      date: '2023-08-15',
      description: 'Cuota mensual - Agosto 2023',
      amount: 15000,
      status: 'paid',
      method: 'Efectivo'
    },
    {
      id: '7',
      date: '2023-07-15',
      description: 'Cuota mensual - Julio 2023',
      amount: 15000,
      status: 'paid',
      method: 'Transferencia bancaria'
    },
    {
      id: '8',
      date: '2023-06-15',
      description: 'Cuota mensual - Junio 2023',
      amount: 15000,
      status: 'paid',
      method: 'Efectivo'
    },
    {
      id: '9',
      date: '2023-05-15',
      description: 'Cuota mensual - Mayo 2023',
      amount: 15000,
      status: 'paid',
      method: 'Transferencia bancaria'
    },
    {
      id: '10',
      date: '2023-04-15',
      description: 'Cuota mensual - Abril 2023',
      amount: 15000,
      status: 'paid',
      method: 'Efectivo'
    },
    {
      id: '11',
      date: '2023-03-15',
      description: 'Cuota mensual - Marzo 2023',
      amount: 15000,
      status: 'paid',
      method: 'Transferencia bancaria'
    }
  ];

  const historyToShow = paymentHistory.length > 0 ? paymentHistory : mockPaymentHistory;
  const totalPaid = historyToShow.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPayments = historyToShow.length;
  const paidPayments = historyToShow.filter(p => p.status === 'paid').length;

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
              <div className="summary-value">${totalPaid.toLocaleString()}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Pagos Realizados</div>
              <div className="summary-value">{paidPayments}/{totalPayments}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Estado General</div>
              <div className="summary-value">Al día</div>
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
                  ${payment.amount.toLocaleString()}
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