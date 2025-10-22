// src/components/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOtp = () => {
    setError('');
    if (!phone) {
      setError('Please enter phone number.');
      return;
    }
    setLoading(true);

    // Simulate sending OTP
    setTimeout(() => {
      console.log(`🧪 Dev Mode OTP sent to ${phone}: 1234`);
      alert('OTP sent successfully! (Use 1234 for testing)');
      setOtpSent(true);
      setLoading(false);
    }, 800);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = () => {
    setError('');
    if (otp === '1234') {
      alert('✅ Login successful!');
      navigate('/biometric'); // Go to next step
    } else {
      setError('❌ Invalid OTP. Please try again.');
    }
  };

  // Step 3: Go to Register page
  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Step 2: Login (Phone + OTP) 📲</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+911234567890"
          required
          style={{ display: 'block', margin: '10px auto', padding: '8px', width: '250px' }}
        />
        <button
          onClick={handleSendOtp}
          disabled={loading || !phone}
          style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </div>

      {otpSent && (
        <div style={{ marginBottom: '20px' }}>
          <label>Enter OTP</label>
          <input
            type="number"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="1234"
            required
            style={{ display: 'block', margin: '10px auto', padding: '8px', width: '150px' }}
          />
          <button
            onClick={handleVerifyOtp}
            disabled={loading || !otp}
            style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Verify OTP
          </button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p style={{ marginTop: '30px' }}>
        New user?{' '}
        <button
          onClick={handleGoToRegister}
          style={{
            background: 'none',
            color: 'blue',
            textDecoration: 'underline',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Register here
        </button>
      </p>
    </div>
  );
};

export default LoginPage;
