import React from 'react';
import '../styles/sections.css';

const SummaryCard = ({ title, children }) => {
  return (
    <div className="summary-section">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default SummaryCard;