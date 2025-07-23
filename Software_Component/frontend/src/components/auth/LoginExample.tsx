import React, { useState } from 'react';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import { FormControl } from 'baseui/form-control';
import { Card, StyledBody } from 'baseui/card';
import { Block } from 'baseui/block';
import { HeadingMedium } from 'baseui/typography';
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
      <Card>
        <StyledBody>
          <HeadingMedium>Authenticated User</HeadingMedium>
          <Block marginBottom="16px">
            <strong>Status:</strong> ✅ Logged In
          </Block>
          <Block marginBottom="16px">
            <strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}
          </Block>
          <Button onClick={handleLogout} kind="secondary">
            Logout
          </Button>
        </StyledBody>
      </Card>
    );
  }

  return (
    <Card>
      <StyledBody>
        <HeadingMedium>Login</HeadingMedium>
        
        <Block marginBottom="16px">
          <FormControl label="Email">
            <Input
              value={email}
              onChange={e => setEmail(e.currentTarget.value)}
              placeholder="Enter your email"
              type="email"
            />
          </FormControl>
        </Block>

        <Block marginBottom="16px">
          <FormControl label="Password">
            <Input
              value={password}
              onChange={e => setPassword(e.currentTarget.value)}
              placeholder="Enter your password"
              type="password"
            />
          </FormControl>
        </Block>

        <Block display="flex" gridGap="16px">
          <Button 
            onClick={handleLogin} 
            disabled={loading || !email || !password}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          
          <Button 
            onClick={handleManualTokenSet} 
            kind="secondary"
          >
            Set Sample Token
          </Button>
        </Block>
      </StyledBody>
    </Card>
  );
};

export default LoginExample;
