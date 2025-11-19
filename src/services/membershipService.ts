import axios from './axiosConfig';

export interface MembershipTier {
  id: number;
  name: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
}

// Base URL gestionada por axiosConfig (VITE_API_URL en producción, '/api' en dev)
// const API_URL = import.meta.env.VITE_API_URL || '/api';

// This service will be used to fetch membership tiers from the backend
// For now, we'll use static data until the backend endpoint is implemented
export const membershipService = {
  async getMembershipTiers(): Promise<MembershipTier[]> {
    try {
      // When the backend endpoint is ready, uncomment this code
      // const response = await axios.get('/membership-tiers');
      // return response.data;
      
      // For now, return static data
      return [
        {
          id: 1,
          name: 'Basic',
          price: 9.99,
          description: 'Perfect for beginners',
          features: [
            'Access to workout tracking',
            'Basic exercise library',
            'Connect with 1 trainer',
            'Weekly progress reports',
          ],
        },
        {
          id: 2,
          name: 'Gold',
          price: 19.99,
          description: 'Most popular choice',
          features: [
            'Everything in Basic',
            'Expanded exercise library',
            'Connect with up to 3 trainers',
            'Daily progress reports',
            'Nutrition tracking',
          ],
          isPopular: true,
        },
        {
          id: 3,
          name: 'Platinum',
          price: 29.99,
          description: 'For serious athletes',
          features: [
            'Everything in Gold',
            'Premium exercise library',
            'Unlimited trainer connections',
            'Real-time progress tracking',
            'Advanced analytics',
            'Priority support',
          ],
        },
      ];
    } catch (error) {
      console.error('Error fetching membership tiers:', error);
      throw error;
    }
  },
};