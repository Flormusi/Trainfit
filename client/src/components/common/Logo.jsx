import React from 'react';
import './Logo.css'; // Assuming Logo.css is in the same folder

const Logo = ({ size = 'medium' }) => {
  // You can use an <img> tag for an image file, or inline SVG, or text
  return (
    <div className={`logo-container logo-${size}`}>
      {/* Example: Using text as logo */}
      <span>TrainFit</span>
      {/* Example: Using an image - ensure you have logo.png in your public folder or import it */}
      {/* <img src="/logo.png" alt="TrainFit Logo" /> */}
    </div>
  );
};

export default Logo;