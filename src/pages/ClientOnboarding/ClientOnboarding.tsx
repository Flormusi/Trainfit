import React, { useState } from 'react';
import './ClientOnboarding.css'; // We'll create this CSS file next

const ClientOnboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  // Add state for onboarding data

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // Handle form submissions, data collection, etc.

  return (
    <div className="client-onboarding-container">
      <h1 className="onboarding-title">Client Onboarding - Step {step}</h1>
      {/* Based on the step, render different parts of the onboarding form */}
      {step === 1 && (
        <div>
          <p>Welcome! Let's get some basic information.</p>
          {/* Form fields for step 1 */}
        </div>
      )}
      {step === 2 && (
        <div>
          <p>Tell us about your fitness goals.</p>
          {/* Form fields for step 2 */}
        </div>
      )}
      {/* Add more steps as needed */}

      <div className="onboarding-navigation">
        {step > 1 && (
          <button onClick={prevStep} className="onboarding-button prev">
            Previous
          </button>
        )}
        {/* Conditionally render Next or Finish button */}
        <button onClick={nextStep} className="onboarding-button next">
          Next
        </button>
      </div>
    </div>
  );
};

export default ClientOnboarding;