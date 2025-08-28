import React, { useState } from 'react';
import Logo from '../ui/logo/logo.tsx'; // o simplemente './logo' si funciona sin extensión // Assuming logo component path
// import './ResponsiveNavbar.css'; // If you have specific styles

const ResponsiveNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="responsive-navbar" style={{ backgroundColor: '#333', color: 'white', padding: '10px 20px' }}>
      <div className="navbar-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo text="TrainFit" /> {/* Or pass an image src */}
        <div className="menu-icon md:hidden" onClick={toggleMenu} style={{ cursor: 'pointer' }}>
          {/* Basic hamburger icon */}
          <div style={{ width: '25px', height: '3px', backgroundColor: 'white', margin: '5px 0' }}></div>
          <div style={{ width: '25px', height: '3px', backgroundColor: 'white', margin: '5px 0' }}></div>
          <div style={{ width: '25px', height: '3px', backgroundColor: 'white', margin: '5px 0' }}></div>
        </div>
        <ul className={`nav-links ${isOpen ? 'block' : 'hidden'} md:flex`} style={{ listStyle: 'none', padding: 0 }}>
          {/* Add NavLink or Link from react-router-dom here */}
          <li style={{ margin: '0 10px' }}><a href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</a></li>
          <li style={{ margin: '0 10px' }}><a href="/profile" style={{ color: 'white', textDecoration: 'none' }}>Profile</a></li>
          <li style={{ margin: '0 10px' }}><a href="/logout" style={{ color: 'white', textDecoration: 'none' }}>Logout</a></li>
        </ul>
      </div>
      {/* Mobile menu items, shown when isOpen is true */}
      {isOpen && (
        <ul className="mobile-nav-links md:hidden" style={{ listStyle: 'none', padding: '10px 0', backgroundColor: '#444' }}>
          <li style={{ margin: '10px 0', textAlign: 'center' }}><a href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</a></li>
          <li style={{ margin: '10px 0', textAlign: 'center' }}><a href="/profile" style={{ color: 'white', textDecoration: 'none' }}>Profile</a></li>
          <li style={{ margin: '10px 0', textAlign: 'center' }}><a href="/logout" style={{ color: 'white', textDecoration: 'none' }}>Logout</a></li>
        </ul>
      )}
    </nav>
  );
};

export default ResponsiveNavbar;