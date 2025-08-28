import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import {
  CreditCard,
  Check,
  X,
  Calendar,
  DollarSign,
  Users,
  Star,
  Crown,
  Zap,
  AlertCircle
} from 'lucide-react';
import { stripePromise, SUBSCRIPTION_PLANS } from '../config/stripe';
import paymentService, { Subscription, Payment } from '../services/paymentService';

const plans = Object.values(SUBSCRIPTION_PLANS);

const CheckoutForm: React.FC<{ selectedPlan: string; onSuccess: () => void }> = ({ 
  selectedPlan, 
  onSuccess 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Crear método de pago
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw error;
      }

      // Crear suscripción usando el servicio
      await paymentService.createSubscription(selectedPlan, paymentMethod.id);
      
      toast.success('¡Suscripción creada exitosamente!');
      onSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Suscribirse
          </>
        )}
      </button>
    </form>
  );
};

const SubscriptionPage: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
    fetchPaymentHistory();
  }, []);

  const fetchSubscription = async () => {
    try {
      const subscription = await paymentService.getCurrentSubscription();
      setSubscription(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Error al cargar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const payments = await paymentService.getPaymentHistory();
      setPayments(payments);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error('Error al cargar el historial de pagos');
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar tu suscripción?')) {
      return;
    }

    try {
      setLoading(true);
      await paymentService.cancelSubscription();
      
      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: true
        });
      }
      
      toast.success('Suscripción cancelada. Se mantendrá activa hasta el final del período actual.');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Error al cancelar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowCheckout(true);
  };

  const handleSubscriptionSuccess = () => {
    setShowCheckout(false);
    setSelectedPlan('');
    fetchSubscription();
    fetchPaymentHistory();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Planes de Suscripción
          </h1>
          <p className="text-xl text-gray-600">
            Elige el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        {/* Estado actual de suscripción */}
        {subscription && (
          <div className="mb-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tu Suscripción Actual
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <Crown className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="text-lg font-semibold">{subscription.plan}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Próximo pago</p>
                  <p className="text-lg font-semibold">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <AlertCircle className={`w-8 h-8 mr-3 ${
                  subscription.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                }`} />
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="text-lg font-semibold">{subscription.status}</p>
                </div>
              </div>
            </div>
            
            {subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
              <div className="mt-6">
                <button
                  onClick={handleCancelSubscription}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Cancelar Suscripción
                </button>
              </div>
            )}

            {subscription.cancelAtPeriodEnd && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  Tu suscripción se cancelará al final del período actual ({new Date(subscription.currentPeriodEnd).toLocaleDateString()})
                </p>
              </div>
            )}
          </div>
        )}

        {/* Planes disponibles */}
        {(!subscription || subscription.status !== 'ACTIVE') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-purple-500 text-white text-center py-2 text-sm font-medium">
                    Más Popular
                  </div>
                )}
                
                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white ${
                  plan.popular ? 'pt-12' : ''
                }`}>
                  <div className="flex items-center justify-center mb-4">
                    <plan.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-center">{plan.name}</h3>
                  <div className="text-center mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-lg">/mes</span>
                  </div>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Seleccionar Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulario de checkout */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Completar Suscripción</h3>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-lg">
                  Plan seleccionado: <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong>
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  ${plans.find(p => p.id === selectedPlan)?.price}/mes
                </p>
              </div>

              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  selectedPlan={selectedPlan} 
                  onSuccess={handleSubscriptionSuccess}
                />
              </Elements>
            </div>
          </div>
        )}

        {/* Historial de pagos */}
        {payments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Historial de Pagos
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.paidAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.amount} {payment.currency.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'SUCCEEDED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;