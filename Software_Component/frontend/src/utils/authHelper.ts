// Temporary authentication helper for testing
import apiClient from '../services/apiConfig';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const testLogin = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // Make login request without token (this endpoint shouldn't require auth)
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });

    if (response.data.success && response.data.token) {
      // Store the token
      localStorage.setItem('userToken', response.data.token);
      console.log('Login successful, token stored');
      return response.data;
    } else {
      throw new Error('Login failed: No token received');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

// For testing - you can call this with test credentials
export const quickLogin = async () => {
  try {
    // Try with common test credentials
    const testCredentials = [
      { email: 'admin@test.com', password: 'password' },
      { email: 'doctor@test.com', password: 'password' },
      { email: 'admin@renalcare.com', password: 'admin123' },
      { email: 'doctor@renalcare.com', password: 'doctor123' }
    ];

    for (const creds of testCredentials) {
      try {
        console.log(`Trying login with ${creds.email}`);
        const result = await testLogin(creds.email, creds.password);
        console.log('Login successful with:', creds.email);
        return result;
      } catch (error) {
        console.log(`Failed with ${creds.email}:`, error);
        continue;
      }
    }
    
    throw new Error('All test credentials failed');
  } catch (error) {
    console.error('Quick login failed:', error);
    throw error;
  }
};
