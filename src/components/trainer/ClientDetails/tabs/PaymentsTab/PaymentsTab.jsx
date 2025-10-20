import React, { useState } from 'react';
import { useClient } from '../../context/ClientContext';
import '../../styles/payments.css';

const PaymentsTab = () => {
  const { client, sendPaymentReminder } = useClient();
  const [activeSection, setActiveSection] = useState('history');
  
  return (
    <div className="payments-tab">
      <div className="payments-header">
        <h2>Pagos y Facturación</h2>
        <div className="payment-actions">
          <button 
            className="action-btn primary"
            onClick={() => sendPaymentReminder(client.id)}
          >
            Enviar Recordatorio
          </button>
          <button className="action-btn">
            Registrar Pago
          </button>
        </div>
      </div>
      
      <div className="payment-nav">
        <button 
          className={`nav-btn ${activeSection === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSection('history')}
        >
          Historial de Pagos
        </button>
        <button 
          className={`nav-btn ${activeSection === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveSection('plans')}
        >
          Planes y Suscripciones
        </button>
        <button 
          className={`nav-btn ${activeSection === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveSection('invoices')}
        >
          Facturas
        </button>
      </div>
      
      <div className="payment-status-card">
        <div className="status-header">
          <h3>Estado de Cuenta</h3>
          <span className={`status-badge ${client?.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
            {client?.paymentStatus === 'paid' ? 'Al día' : 'Pendiente'}
          </span>
        </div>
        <div className="status-details">
          <div className="status-item">
            <span className="status-label">Último Pago</span>
            <span className="status-value">
              {client?.lastPayment?.date 
                ? new Date(client.lastPayment.date).toLocaleDateString('es-ES')
                : 'N/A'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Monto</span>
            <span className="status-value">
              ${client?.lastPayment?.amount || 'N/A'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Próximo Pago</span>
            <span className="status-value">
              {client?.nextPayment?.date 
                ? new Date(client.nextPayment.date).toLocaleDateString('es-ES')
                : 'N/A'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Monto a Pagar</span>
            <span className="status-value">
              ${client?.nextPayment?.amount || 'N/A'}
            </span>
          </div>
        </div>
      </div>
      
      {activeSection === 'history' && <PaymentHistory client={client} />}
      {activeSection === 'plans' && <PaymentPlans client={client} />}
      {activeSection === 'invoices' && <PaymentInvoices client={client} />}
    </div>
  );
};

const PaymentHistory = ({ client }) => {
  const payments = client?.paymentHistory || [];
  
  return (
    <div className="payment-history">
      <h3>Historial de Pagos</h3>
      
      {payments.length === 0 ? (
        <div className="empty-state">
          <p>No hay pagos registrados.</p>
        </div>
      ) : (
        <div className="payment-table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Método</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index} className="payment-row">
                  <td>{new Date(payment.date).toLocaleDateString('es-ES')}</td>
                  <td>{payment.concept}</td>
                  <td>{payment.method}</td>
                  <td>${payment.amount}</td>
                  <td>
                    <span className={`payment-status ${payment.status}`}>
                      {payment.status === 'completed' ? 'Completado' : 
                       payment.status === 'pending' ? 'Pendiente' : 
                       payment.status === 'failed' ? 'Fallido' : payment.status}
                    </span>
                  </td>
                  <td>
                    <div className="payment-actions-cell">
                      <button className="view-payment-btn" title="Ver detalles">
                        <i className="icon-view"></i>
                      </button>
                      <button className="download-receipt-btn" title="Descargar recibo">
                        <i className="icon-download"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const PaymentPlans = ({ client }) => {
  const activePlan = client?.subscriptionPlan || null;
  const availablePlans = [
    { id: 'basic', name: 'Plan Básico', price: 2500, sessions: 8, features: ['8 sesiones mensuales', 'Acceso a rutinas básicas', 'Soporte por chat'] },
    { id: 'premium', name: 'Plan Premium', price: 4000, sessions: 12, features: ['12 sesiones mensuales', 'Rutinas personalizadas', 'Soporte prioritario', 'Plan nutricional básico'] },
    { id: 'elite', name: 'Plan Elite', price: 6000, sessions: 16, features: ['16 sesiones mensuales', 'Rutinas avanzadas personalizadas', 'Soporte 24/7', 'Plan nutricional completo', 'Seguimiento diario'] }
  ];
  
  return (
    <div className="payment-plans">
      <div className="active-plan-section">
        <h3>Plan Actual</h3>
        
        {activePlan ? (
          <div className="active-plan-card">
            <div className="plan-header">
              <h4>{activePlan.name}</h4>
              <span className="plan-price">${activePlan.price}/mes</span>
            </div>
            <div className="plan-details">
              <p className="plan-description">{activePlan.description}</p>
              <div className="plan-meta">
                <span className="plan-sessions">{activePlan.sessions} sesiones/mes</span>
                <span className="plan-renewal">Renovación: {new Date(activePlan.renewalDate).toLocaleDateString('es-ES')}</span>
              </div>
              <ul className="plan-features">
                {activePlan.features.map((feature, index) => (
                  <li key={index} className="feature-item">{feature}</li>
                ))}
              </ul>
            </div>
            <div className="plan-actions">
              <button className="change-plan-btn">
                Cambiar Plan
              </button>
              <button className="cancel-plan-btn">
                Cancelar Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>No hay plan activo.</p>
            <p className="empty-subtitle">Asigna un plan de suscripción al cliente.</p>
          </div>
        )}
      </div>
      
      <div className="available-plans-section">
        <h3>Planes Disponibles</h3>
        <div className="plans-grid">
          {availablePlans.map(plan => (
            <div key={plan.id} className={`plan-card ${activePlan?.id === plan.id ? 'active' : ''}`}>
              <div className="plan-header">
                <h4>{plan.name}</h4>
                <span className="plan-price">${plan.price}/mes</span>
              </div>
              <ul className="plan-features">
                {plan.features.map((feature, index) => (
                  <li key={index} className="feature-item">{feature}</li>
                ))}
              </ul>
              <button 
                className={`assign-plan-btn ${activePlan?.id === plan.id ? 'disabled' : ''}`}
                disabled={activePlan?.id === plan.id}
              >
                {activePlan?.id === plan.id ? 'Plan Actual' : 'Asignar Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PaymentInvoices = ({ client }) => {
  const invoices = client?.invoices || [];
  
  return (
    <div className="payment-invoices">
      <h3>Facturas</h3>
      
      {invoices.length === 0 ? (
        <div className="empty-state">
          <p>No hay facturas disponibles.</p>
        </div>
      ) : (
        <div className="invoices-table-container">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={index} className="invoice-row">
                  <td>{invoice.number}</td>
                  <td>{new Date(invoice.date).toLocaleDateString('es-ES')}</td>
                  <td>{invoice.concept}</td>
                  <td>${invoice.amount}</td>
                  <td>
                    <span className={`invoice-status ${invoice.status}`}>
                      {invoice.status === 'paid' ? 'Pagada' : 
                       invoice.status === 'pending' ? 'Pendiente' : 
                       invoice.status === 'overdue' ? 'Vencida' : invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="invoice-actions-cell">
                      <button className="view-invoice-btn" title="Ver factura">
                        <i className="icon-view"></i>
                      </button>
                      <button className="download-invoice-btn" title="Descargar factura">
                        <i className="icon-download"></i>
                      </button>
                      <button className="send-invoice-btn" title="Enviar factura">
                        <i className="icon-send"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;