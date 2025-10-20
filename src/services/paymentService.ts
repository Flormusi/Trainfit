import api from './api';

export interface Subscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  paidAt: string;
}

export const paymentService = {
  // Crear una nueva suscripción
  createSubscription: async (planId: string, paymentMethodId: string) => {
    const response = await api.post('/payments/create-subscription', {
      plan: planId,
      paymentMethodId
    });
    return response.data;
  },

  // Obtener la suscripción actual del usuario
  getCurrentSubscription: async (): Promise<Subscription | null> => {
    try {
      const response = await api.get('/payments/subscription');
      return response.data.subscription;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Cancelar suscripción
  cancelSubscription: async () => {
    const response = await api.post('/payments/cancel-subscription');
    return response.data;
  },

  // Obtener historial de pagos
  getPaymentHistory: async (): Promise<Payment[]> => {
    const response = await api.get('/payments/history');
    return response.data.payments || [];
  },

  // Crear intent de pago para Stripe
  createPaymentIntent: async (planId: string) => {
    const response = await api.post('/payments/create-payment-intent', {
      planId
    });
    return response.data;
  }
};

export default paymentService;