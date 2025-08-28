import React, { useContext } from 'react';
// import { NotificationContext } from '../../contexts/NotificationContext'; // Assuming context
import NotificationItem from './NotificationItem.tsx';
// import './NotificationCenter.css'; // If you have specific styles

const NotificationCenter = () => {
  // const { notifications, dismissNotification } = useContext(NotificationContext); // Example usage
  
  // Dummy notifications if context is not set up yet
  const notifications = [
    { id: 1, message: 'Welcome to Trainfit!', type: 'info' },
    { id: 2, message: 'Your new workout plan is ready.', type: 'success' },
    { id: 3, message: 'Reminder: Leg day tomorrow!', type: 'warning' },
  ];
  const dismissNotification = (id) => console.log('Dismiss notification:', id);


  if (!notifications || notifications.length === 0) {
    return (
      <div className="notification-center empty" style={{ padding: '10px', textAlign: 'center', color: '#888' }}>
        No new notifications.
      </div>
    );
  }

  return (
    <div className="notification-center" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, width: '300px' }}>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationCenter;