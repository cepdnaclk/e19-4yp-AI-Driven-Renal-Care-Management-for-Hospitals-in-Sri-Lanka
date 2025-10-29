import apiClient from './apiConfig';

export interface DialysisSessionData {
  id: string;
  sessionId: string;
  patientId: string;
  date: string;
  startTime: string;
  endTime?: string;
  hdDuration: number;
  dryWeight: number;
  preHDDryWeight: number;
  postHDDryWeight: number;
  puf: number;
  auf: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  bfr: number;
  tmp: number;
  ap: number;
  vp: number;
  vascularAccess: {
    type: string;
    site: string;
  };
  status?: string;
  nurse?: {
    name: string;
    email: string;
  };
  doctor?: {
    name: string;
    email: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DialysisSessionResponse {
  sessions: DialysisSessionData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class DialysisSessionService {
  /**
   * Get all dialysis sessions for a patient
   */
  async getPatientSessions(
    patientId: string,
    page: number = 1,
    limit: number = 50,
    startDate?: string,
    endDate?: string,
    status?: string
  ): Promise<DialysisSessionResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);

      const response = await apiClient.get(`/dialysis-sessions/${patientId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dialysis sessions:', error);
      throw error;
    }
  }

  /**
   * Get a specific dialysis session by ID
   */
  async getSessionById(patientId: string, sessionId: string): Promise<DialysisSessionData> {
    try {
      const response = await apiClient.get(`/dialysis-sessions/${patientId}/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dialysis session:', error);
      throw error;
    }
  }

  /**
   * Create a new dialysis session
   */
  async createSession(patientId: string, sessionData: Partial<DialysisSessionData>): Promise<DialysisSessionData> {
    try {
      const response = await apiClient.post(`/dialysis-sessions/${patientId}`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating dialysis session:', error);
      throw error;
    }
  }

  /**
   * Update a dialysis session
   */
  async updateSession(
    patientId: string,
    sessionId: string,
    sessionData: Partial<DialysisSessionData>
  ): Promise<DialysisSessionData> {
    try {
      const response = await apiClient.put(`/dialysis-sessions/${patientId}/${sessionId}`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Error updating dialysis session:', error);
      throw error;
    }
  }

  /**
   * Delete a dialysis session
   */
  async deleteSession(patientId: string, sessionId: string): Promise<void> {
    try {
      await apiClient.delete(`/dialysis-sessions/${patientId}/${sessionId}`);
    } catch (error) {
      console.error('Error deleting dialysis session:', error);
      throw error;
    }
  }
}

const dialysisSessionService = new DialysisSessionService();
export default dialysisSessionService;