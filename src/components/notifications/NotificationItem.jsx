import React from 'react';
// import './NotificationItem.css'; // Descomentá si tenés estilos

const NotificationItem = ({ notification, onDismiss }) => {
  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success': return '#d4edda';
      case 'error': return '#f8d7da';
      case 'warning': return '#fff3cd';
      case 'info':
      default:
        return '#d1ecf1';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success': return '#155724';
      case 'error': return '#721c24';
      case 'warning': return '#856404';
      case 'info':
      default:
        return '#0c5460';
    }
  };

  const itemStyle = {
    backgroundColor: getBackgroundColor(notification.type),
    color: getTextColor(notification.type),
    padding: '10px 15px',
    marginBottom: '10px',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'relative',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '5px',
    right: '10px',
    border: 'none',
    background: 'transparent',
    color: getTextColor(notification.type),
    cursor: 'pointer',
    fontSize: '16px',
  };

  return (
    <div style={itemStyle}>
      {notification.message}
      <button style={closeButtonStyle} onClick={() => onDismiss(notification.id)}>
        ×
      </button>
    </div>
  );
};

export default NotificationItem;