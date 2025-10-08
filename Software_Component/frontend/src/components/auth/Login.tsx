import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types/index';
import data from "../../data.json";
import iconImage from '../../images/icon.png';
import { toast } from '../../utils/notify';
import axios from 'axios';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setThemeState] = React.useState(0); // dummy state to force re-render

  // Theme toggle helpers
  const isDarkTheme = () => document.body.classList.contains('dark-theme');
  const getThemeIcon = () => (isDarkTheme() ? 'bi bi-sun' : 'bi bi-moon');
  const toggleTheme = () => {
    document.body.classList.toggle('dark-theme');
    // Force update to re-render icon
    setTimeout(() => {
      const event = new Event('themechange');
      window.dispatchEvent(event);
    }, 0);
  };

  React.useEffect(() => {
    const handler = () => setThemeState((s) => s + 1);
    window.addEventListener('themechange', handler);
    return () => window.removeEventListener('themechange', handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = loginResponse.data;
      console.log('Login successful:', token);

      localStorage.setItem('userToken', token);

      const loggedInUser: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      onLogin(loggedInUser);
      toast.success('Welcome back! You have been successfully signed in.');
    } catch (error: any) {
      const errorMessage = 'Login credentials are wrong';
      setError(errorMessage);
      toast.error('Sign in failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Theme Toggle Button */}
        <button className="login-theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
          <i className={getThemeIcon()}></i>
        </button>

        <div className="login-header">
          <div className="login-logo">
            <img src={iconImage} alt="Hospital Logo" className="login-logo-image" />
          </div>
          <h1 className="login-title">{data.title}</h1>
          <p className="login-subtitle">{data.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <i className="bi bi-envelope-fill"></i>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.currentTarget.value })}
              placeholder="Enter your email address"
              className="form-input"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <i className="bi bi-lock-fill"></i>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.currentTarget.value })}
              placeholder="Enter your password"
              className="form-input"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Signing In...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Secure login for authorized healthcare personnel only</p>
        </div>
      </div>
    </div>
  );
};

export default Login;