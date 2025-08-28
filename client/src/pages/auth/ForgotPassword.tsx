import React, { useState } from 'react';
// import './ForgotPassword.css'; // You might want a CSS file for this

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your logic to handle password reset request (e.g., API call)
    console.log('Password reset requested for:', email);
    setMessage('If an account with this email exists, a password reset link has been sent.');
    setEmail(''); // Clear the input
  };

  return (
    <div className="forgot-password-container" style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Forgot Your Password?</h2>
      <p>Enter your email address below and we'll send you a link to reset your password.</p>
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
        <button type="submit" style={{ padding: '10px 15px' }}>Send Reset Link</button>
      </form>
      {message && <p style={{ marginTop: '15px', color: 'green' }}>{message}</p>}
    </div>
  );
};

export default ForgotPasswordPage;