import { useEffect, useState } from 'react';

// Token management functions (outside of hook for reuse)
const getAuthToken = (): string | null => {
  return localStorage.getItem('userToken');
};

const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('userToken', token);
  } else {
    localStorage.removeItem('userToken');
  }
};

const removeAuthToken = () => {
  localStorage.removeItem('userToken');
};

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check for existing token on component mount
    const existingToken = getAuthToken();
    if (existingToken) {
      setToken(existingToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (authToken: string) => {
    setAuthToken(authToken);
    setToken(authToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setIsAuthenticated(false);
  };

  const updateToken = (newToken: string) => {
    setAuthToken(newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  return {
    token,
    isAuthenticated,
    login,
    logout,
    updateToken
  };
};

// Helper function to manually set token (for use outside of components)
export const setUserToken = (token: string) => {
  setAuthToken(token);
};

// Helper function to manually remove token (for use outside of components)
export const clearUserToken = () => {
  removeAuthToken();
};
