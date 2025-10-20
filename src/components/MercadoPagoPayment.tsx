import React, { useState } from 'react';
import api from '../services/api';

interface MercadoPagoPaymentProps {
  clientId: string;
  amount: number;
  description: string;
  planType: string;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: any) => void;
}

const MercadoPagoPayment: React.FC<MercadoPagoPaymentProps> = ({
  clientId,
  amount,
  description,
  planType,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;



  const createPaymentPreference = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/payments/create-preference', {
        clientId,
        amount,
        description,
        planType
      });

      if (response.data.success) {
        setPreferenceId(response.data.preferenceId);
      } else {
        throw new Error(response.data.message || 'Error al crear la preferencia de pago');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al procesar el pago';
      setError(errorMessage);
      onPaymentError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Pago exitoso:', paymentData);
    onPaymentSuccess?.(paymentData);
  };

  const handlePaymentError = (error: any) => {
    console.error('Error en el pago:', error);
    setError('Error al procesar el pago');
    onPaymentError?.(error);
  };

  return (
    <div className="mercadopago-payment">
      <div className="payment-info mb-4">
        <h3 className="text-lg font-semibold mb-2">Información del Pago</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>Descripción:</strong> {description}</p>
          <p><strong>Plan:</strong> {planType}</p>
          <p><strong>Monto:</strong> ${amount.toFixed(2)}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {!preferenceId ? (
        <button
          onClick={createPaymentPreference}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Procesando...
            </div>
          ) : (
            'Proceder al Pago'
          )}
        </button>
      ) : (
        <div className="mercadopago-wallet">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>✅ Preferencia de pago creada exitosamente</p>
            <p><strong>ID de Preferencia:</strong> {preferenceId}</p>
          </div>
          <button
            onClick={() => {
              // Redirigir a Mercado Pago usando la URL de sandbox
              const checkoutUrl = `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;
              window.open(checkoutUrl, '_blank');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            💳 Pagar con Mercado Pago
          </button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>🔒 Pago seguro procesado por Mercado Pago</p>
        <p>💳 Aceptamos todas las tarjetas de crédito y débito</p>
      </div>
    </div>
  );
};

export default MercadoPagoPayment;