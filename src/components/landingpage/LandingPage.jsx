import React from 'react';
import './LandingPage.css'; // Specific styles for this landing page
// import Navbar from '../layout/Navbar'; // Example import
// import Footer from '../layout/Footer'; // Example import

const LandingPage = () => {
  return (
    <div className="landing-page-wrapper">
      {/* <Navbar /> */}
      <section className="landing-page-hero">
        <h1>Trainfit: Achieve Your Fitness Goals</h1>
        <p>Your personalized fitness journey starts here.</p>
        <button>Get Started</button>
      </section>

      <section className="landing-page-features">
        <h2>Features</h2>
        {/* Add feature descriptions here */}
        <div className="feature-item">
          <h3>Personalized Workouts</h3>
          <p>Tailored plans to fit your needs.</p>
        </div>
        <div className="feature-item">
          <h3>Track Your Progress</h3>
          <p>Monitor your gains and stay motivated.</p>
        </div>
      </section>
      {/* <Footer /> */}
    </div>
  );
};

export default LandingPage;