import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

type MembershipTier = 'basic' | 'gold' | 'platinum';

interface TierColors {
  [key: string]: string;
}

const MembershipIndicator = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'client' || !user.membershipTier) {
    return null;
  }

  const tierColors: TierColors = {
    basic: 'bg-gray-500',
    gold: 'bg-yellow-500',
    platinum: 'bg-purple-500'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${tierColors[user.membershipTier]}`} />
      <span className="text-sm font-medium capitalize">{user.membershipTier}</span>
    </div>
  );
};

export default MembershipIndicator;