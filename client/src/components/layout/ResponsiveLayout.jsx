import React from 'react';
// import Sidebar from './Sidebar'; // Example
// import ResponsiveNavbar from './ResponsiveNavbar'; // Example
// import './ResponsiveLayout.css'; // If you have specific styles

const ResponsiveLayout = ({ children }) => {
  return (
    <div className="responsive-layout">
      {/* <ResponsiveNavbar /> */}
      <div className="layout-main-container" style={{ display: 'flex' }}>
        {/* <Sidebar /> */}
        <main className="layout-content" style={{ flexGrow: 1, padding: '20px' }}>
          {children}
        </main>
      </div>
      {/* Optional Footer */}
      {/* <footer style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #eee' }}>
        <p>&copy; {new Date().getFullYear()} Trainfit</p>
      </footer> */}
    </div>
  );
};

export default ResponsiveLayout;