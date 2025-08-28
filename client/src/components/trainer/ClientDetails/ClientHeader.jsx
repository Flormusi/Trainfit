import React from 'react';
import { Link } from 'react-router-dom';
import './styles/header.css';

const ClientHeader = () => {
  return (
    <div className="client-header">
      <div className="trainfit-logo">
        <h2>TRAINFIT</h2>
      </div>
      <Link to="/trainer/clients" className="back-link">
        &larr; Volver a la lista de clientes
      </Link>
    </div>
  );
};

export default ClientHeader;