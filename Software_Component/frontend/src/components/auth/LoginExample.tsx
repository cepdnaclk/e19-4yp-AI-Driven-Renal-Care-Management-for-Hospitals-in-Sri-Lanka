import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const LoginExample: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout, isAuthenticated, token } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Simulate API call to login endpoint
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          // Use the auth hook to set the token
          login(data.token);
          alert('Login successful! Token has been set.');
        } else {
          alert('Login failed: Invalid credentials');
        }
      } else {
        alert('Login failed: Server error');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setEmail('');
    setPassword('');
    alert('Logged out successfully!');
  };

  const handleManualTokenSet = () => {
    // For testing - set a sample JWT token
    const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    login(sampleToken);
    alert('Sample token set for testing!');
  };

  if (isAuthenticated) {
    return (
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
        <h3>Authenticated User</h3>
        <div style={{ marginBottom: '16px' }}>
          <strong>Status:</strong> ✅ Logged In
        </div>
        <div style={{ marginBottom: '16px' }}>
          <strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}
        </div>
        <button onClick={handleLogout} style={{ backgroundColor: '#f0f0f0', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '4px' }}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
      <h3>Login</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button 
          onClick={handleLogin} 
          disabled={loading || !email || !password}
          style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: loading || !email || !password ? '#f0f0f0' : '#007bff', color: 'white' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <button 
          onClick={handleManualTokenSet} 
          style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f0f0f0' }}
        >
          Set Sample Token
        </button>
      </div>
    </div>
  );
};

export default LoginExample;
