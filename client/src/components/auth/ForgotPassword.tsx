import React, { useState } from 'react';
// import './ForgotPassword.css'; // If you have specific styles

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your password reset logic here (e.g., API call)
    console.log('Password reset requested for:', email);
    setMessage('If an account with that email exists, a password reset link has been sent.');
    setEmail(''); // Clear the input
  };

  return (
    <div className="forgot-password-container" style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email Address:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 15px' }}>
          Send Reset Link
        </button>
      </form>
      {message && <p style={{ marginTop: '15px' }}>{message}</p>}
    </div>
  );
};

export default ForgotPasswordForm;