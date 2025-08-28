import React from 'react';
// import './ResponsiveCard.css'; // If you have specific styles

const ResponsiveCard = ({ title, children, className }) => {
  const cardStyle = {
    border: 'none',
    borderRadius: '8px',
    padding: '20px',
    margin: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
  };

  return (
    <div className={`responsive-card ${className || ''}`} style={cardStyle}>
      {title && <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: 'none', paddingBottom: '10px' }}>{title}</h3>}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveCard;