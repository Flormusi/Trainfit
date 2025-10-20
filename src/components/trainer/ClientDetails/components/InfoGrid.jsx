import React from 'react';
import '../styles/sections.css';

const InfoGrid = ({ items }) => {
  return (
    <div className="info-grid">
      {items.map((item, index) => (
        <div key={index} className="info-item">
          <span className="info-label">{item.label}</span>
          <span className="info-value">{item.value || 'N/A'}</span>
        </div>
      ))}
    </div>
  );
};

export default InfoGrid;