import React from 'react';
import './SkeletonCard.css'; // Crearemos este CSS

const SkeletonCard: React.FC = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-title"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
      <div className="skeleton-button"></div>
    </div>
  );
};

export default SkeletonCard;