import React from 'react';
import './logo.css'; // Asegurate de tener este archivo en la misma carpeta

interface LogoProps {
  src?: string;
  altText?: string;
  text?: string;
}

const Logo: React.FC<LogoProps> = ({ src, altText = "Trainfit Logo", text }) => {
  return (
    <div className="logo-container" style={{ display: 'flex', alignItems: 'center' }}>
      {src && <img src={src} alt={altText} className="logo-image" />}
      {text && <span className="logo-text">{text}</span>}
      {!src && !text && <span className="logo-text">TrainFit</span>}
    </div>
  );
};

export default Logo;