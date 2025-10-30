import apiClient from '../../services/apiConfig'
import { Patient } from '../../types'

export const fetchPatientById = async (id: string): Promise<Patient | null> => {
  try {
    const response = await apiClient.get(`/patients/${id}`)
    if (response.data.success) {
      return response.data.patient
    } else {
      console.error('API responded without success')
      return null
    }
  } catch (error) {
    console.error('Error fetching patient:', error)
    return null
  }
}

export const fetchAllPatients = async (): Promise<Patient[]> => {
  try {
    const response = await apiClient.get('/patients')
    if (response.data.success) {
      return response.data.patients
    }
    else {
      console.error('API responded without success')
      return []
    }
  }
  catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('userToken')
      throw new Error('Authentication failed. Please log in again.')
    }
    console.error('Error fetching patients:', error)
    throw error // Re-throw to let the component handle it
  }
}

export const fetchMonthlyInvestigations = async (patientId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/monthly-investigations/${patientId}`)
    if (response.data.investigations) {
      return response.data.investigations
    } 
    else {
      console.error('API responded without investigations')
      return []
    }
  } 
  catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('userToken')
      throw new Error('Authentication failed. Please log in again.')
    }
    console.error('Error fetching monthly investigations:', error)
    throw error // Re-throw to let the component handle it
  }
}

export const fetchDialysisSessions = async (patientId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/dialysis-sessions/${patientId}`)
    if (response.data) {
      // Return the sessions array, assuming the API returns an array or object with sessions
      return response.data.sessions || response.data || []
    } 
    else {
      console.error('API responded without dialysis sessions')
      return []
    }
  } 
  catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('userToken')
      throw new Error('Authentication failed. Please log in again.')
    }
    console.error('Error fetching dialysis sessions:', error)
    throw error // Re-throw to let the component handle it
  }
}

export const fetchHemoglobinTrend = async (patientId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/trends/hb/${patientId}`)
    if (response.data) {
      return response.data
    }
    else {
      console.error('API responded without hemoglobin trend data')
      return null
    }
  } 
  catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('userToken')
      throw new Error('Authentication failed. Please log in again.')
    }
    console.error('Error fetching hemoglobin trend:', error)
    throw error // Re-throw to let the component handle it
  }
}

export const fetchNotifications = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/notifications')
    if (response.data) {
      return response.data
    }
    else {
      console.error('API responded without notifications data')
      return null
    }
  } 
  catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('userToken')
      throw new Error('Authentication failed. Please log in again.')
    }
    console.error('Error fetching notifications:', error)
    throw error // Re-throw to let the component handle it
  }
}

export const fetchAIPredictions = async (patientId: string): Promise<any> => {
  try {
    const [hbResponse, urrResponse, dryWeightResponse] = await Promise.allSettled([
      apiClient.get(`/ai-predictions/predict/hb/${patientId}`),
      apiClient.get(`/ai-predictions/predict/urr/${patientId}`),
      apiClient.get(`/ai-predictions/predict/dry-weight/${patientId}`)
    ]);

    const predictions: any = {};

    // Process HB prediction
    if (hbResponse.status === 'fulfilled' && hbResponse.value.data.success) {
      predictions.hb = hbResponse.value.data.prediction.prediction;
    } else {
      predictions.hbError = hbResponse.status === 'rejected' ? hbResponse.reason.message : 'HB prediction failed';
    }

    // Process URR prediction
    if (urrResponse.status === 'fulfilled' && urrResponse.value.data.success) {
      predictions.urr = urrResponse.value.data.prediction.prediction;
    } else {
      predictions.urrError = urrResponse.status === 'rejected' ? urrResponse.reason.message : 'URR prediction failed';
    }

    // Process Dry Weight prediction
    if (dryWeightResponse.status === 'fulfilled' && dryWeightResponse.value.data.success) {
      predictions.dryWeight = dryWeightResponse.value.data.prediction.prediction;
    } else {
      predictions.dryWeightError = dryWeightResponse.status === 'rejected' ? dryWeightResponse.reason.message : 'Dry weight prediction failed';
    }

    return predictions;
  } 
  catch (error: any) {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('userToken')
      throw new Error('Authentication failed. Please log in again.')
    }
    console.error('Error fetching AI predictions:', error)
    throw error // Re-throw to let the component handle it
  }
}

// Keep the old function for backward compatibility but deprecated
export const fetchAIPrediction = async (predictionData: any): Promise<any> => {
  console.warn('fetchAIPrediction is deprecated. Use fetchAIPredictions instead.');
  return fetchAIPredictions(predictionData.patient_id);
}