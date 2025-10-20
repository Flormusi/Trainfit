import axios from 'axios';

export interface MembershipTier {
  id: number;
  name: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const API_URL = 'http://localhost:3001/api';

// This service will be used to fetch membership tiers from the backend
// For now, we'll use static data until the backend endpoint is implemented
export const membershipService = {
  async getMembershipTiers(): Promise<MembershipTier[]> {
    try {
      // When the backend endpoint is ready, uncomment this code
      // const response = await axios.get(`${API_URL}/membership-tiers`);
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