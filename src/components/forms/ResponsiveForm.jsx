import React from 'react';
// import './ResponsiveForm.css'; // If you have specific styles

const ResponsiveForm = ({ onSubmit, children, title }) => {
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px', // Space between form elements
    padding: '20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
  };

  return (
    <form onSubmit={onSubmit} className="responsive-form" style={formStyle}>
      {title && <h2 style={{textAlign: 'center', marginTop: 0}}>{title}</h2>}
      {children}
      {/* Example: <button type="submit">Submit</button> could be passed as a child or added here */}
    </form>
  );
};

export default ResponsiveForm;