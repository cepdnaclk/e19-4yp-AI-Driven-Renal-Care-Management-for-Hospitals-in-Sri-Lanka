// services/patientService.ts
import apiClient from '../../services/apiConfig';
import axios from 'axios';
import { Patient } from '../../types';

export const fetchPatientById = async (id: string): Promise<Patient | null> => {
  try {
    const response = await apiClient.get(`/patients/${id}`);
    if (response.data.success) {
      return response.data.patient;
    } else {
      console.error('API responded without success');
      return null;
    }
  } catch (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
};

export const fetchAllPatients = async (): Promise<Patient[]> => {
  try {    
    const response = await apiClient.get('/patients');
    if (response.data.success) {
      return response.data.patients;
    } else {
      console.error('API responded without success');
      return [];
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('userToken');
      throw new Error('Authentication failed. Please log in again.');
    }
    console.error('Error fetching patients:', error);
    throw error; // Re-throw to let the component handle it
  }
};

export const fetchMonthlyInvestigations = async (patientId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/monthly-investigations/${patientId}`);
    if (response.data.investigations) {
      return response.data.investigations;
    } else {
      console.error('API responded without investigations');
      return [];
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('userToken');
      throw new Error('Authentication failed. Please log in again.');
    }
    console.error('Error fetching monthly investigations:', error);
    throw error; // Re-throw to let the component handle it
  }
};

export const fetchDialysisSessions = async (patientId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/dialysis-sessions/${patientId}`);
    if (response.data) {
      // Return the sessions array, assuming the API returns an array or object with sessions
      return response.data.sessions || response.data || [];
    } else {
      console.error('API responded without dialysis sessions');
      return [];
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('userToken');
      throw new Error('Authentication failed. Please log in again.');
    }
    console.error('Error fetching dialysis sessions:', error);
    throw error; // Re-throw to let the component handle it
  }
};

export const fetchHemoglobinTrend = async (patientId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/trends/hb/${patientId}`);
    if (response.data) {
      return response.data;
    } else {
      console.error('API responded without hemoglobin trend data');
      return null;
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('userToken');
      throw new Error('Authentication failed. Please log in again.');
    }
    console.error('Error fetching hemoglobin trend:', error);
    throw error; // Re-throw to let the component handle it
  }
};

export const fetchNotifications = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/notifications');
    if (response.data) {
      return response.data;
    } else {
      console.error('API responded without notifications data');
      return null;
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('userToken');
      throw new Error('Authentication failed. Please log in again.');
    }
    console.error('Error fetching notifications:', error);
    throw error; // Re-throw to let the component handle it
  }
};

export const fetchAIPrediction = async (predictionData: {
  patient_id: string;
  albumin: number;
  bu_post_hd: number;
  bu_pre_hd: number;
  s_ca: number;
  scr_post_hd: number;
  scr_pre_hd: number;
  serum_k_post_hd: number;
  serum_k_pre_hd: number;
  serum_na_pre_hd: number;
  ua: number;
  hb_diff: number;
  hb: number;
}): Promise<any> => {
  try {
    // Use axios directly for the ML API since it's on a different port
    const token = localStorage.getItem('userToken');
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await axios.post(
      'http://127.0.0.1:8001/api/ml/predict/hb/', 
      predictionData,
      { headers }
    );
    
    if (response.data) {
      return response.data;
    } else {
      console.error('AI prediction API responded without data');
      return null;
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('userToken');
      throw new Error('Authentication failed. Please log in again.');
    }
    console.error('Error fetching AI prediction:', error);
    throw error; // Re-throw to let the component handle it
  }
};
