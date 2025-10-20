import { loadStripe } from '@stripe/stripe-js';
import { Star, Crown, Zap } from 'lucide-react';

// Clave pública de Stripe (reemplaza con tu clave real)
const stripePublishableKey = 'pk_test_51234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

// Inicializar Stripe
export const stripePromise = loadStripe(stripePublishableKey);

// Configuración de planes
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'BASIC',
    name: 'Básico',
    price: 29.99,
    priceId: 'price_basic_monthly',
    icon: Star,
    color: 'from-blue-500 to-blue-600',
    popular: false,
    features: [
      'Hasta 10 clientes',
      'Rutinas básicas',
      'Seguimiento de progreso',
      'Soporte por email'
    ]
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    price: 49.99,
    priceId: 'price_premium_monthly',
    icon: Crown,
    color: 'from-purple-500 to-purple-600',
    popular: true,
    features: [
      'Hasta 50 clientes',
      'Rutinas avanzadas',
      'Análisis detallado',
      'Planes de nutrición',
      'Soporte prioritario'
    ]
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'Profesional',
    price: 99.99,
    priceId: 'price_professional_monthly',
    icon: Zap,
    color: 'from-gold-500 to-gold-600',
    popular: false,
    features: [
      'Clientes ilimitados',
      'Todas las funciones',
      'API personalizada',
      'Reportes avanzados',
      'Soporte 24/7'
    ]
  }
};