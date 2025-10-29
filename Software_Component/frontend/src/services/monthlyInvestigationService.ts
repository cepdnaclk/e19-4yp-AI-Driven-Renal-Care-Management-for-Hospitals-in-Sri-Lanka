import apiClient from './apiConfig';

export interface MonthlyInvestigationData {
  id: string;
  patientId: string;
  date: string;
  scrPreHD?: number;
  scrPostHD?: number;
  bu_pre_hd?: number;
  bu_post_hd?: number;
  hb?: number;
  serumNaPreHD?: number;
  serumNaPostHD?: number;
  serumKPreHD?: number;
  serumKPostHD?: number;
  sCa?: number;
  sPhosphate?: number;
  albumin?: number;
  ua?: number;
  hco?: number;
  al?: number;
  hbA1C?: number;
  pth?: number;
  vitD?: number;
  serumIron?: number;
  serumFerritin?: number;
  notes?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyInvestigationResponse {
  investigations: MonthlyInvestigationData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class MonthlyInvestigationService {
  /**
   * Get all monthly investigations for a patient
   */
  async getPatientInvestigations(
    patientId: string,
    page: number = 1,
    limit: number = 50,
    startDate?: string,
    endDate?: string
  ): Promise<MonthlyInvestigationResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get(`/monthly-investigations/${patientId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly investigations:', error);
      throw error;
    }
  }

  /**
   * Get a specific monthly investigation by ID
   */
  async getInvestigationById(patientId: string, investigationId: string): Promise<MonthlyInvestigationData> {
    try {
      const response = await apiClient.get(`/monthly-investigations/${patientId}/${investigationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly investigation:', error);
      throw error;
    }
  }

  /**
   * Create a new monthly investigation
   */
  async createInvestigation(patientId: string, investigationData: Partial<MonthlyInvestigationData>): Promise<MonthlyInvestigationData> {
    try {
      const response = await apiClient.post(`/monthly-investigations/${patientId}`, investigationData);
      return response.data;
    } catch (error) {
      console.error('Error creating monthly investigation:', error);
      throw error;
    }
  }

  /**
   * Update a monthly investigation
   */
  async updateInvestigation(
    patientId: string,
    investigationId: string,
    investigationData: Partial<MonthlyInvestigationData>
  ): Promise<MonthlyInvestigationData> {
    try {
      const response = await apiClient.put(`/monthly-investigations/${patientId}/${investigationId}`, investigationData);
      return response.data;
    } catch (error) {
      console.error('Error updating monthly investigation:', error);
      throw error;
    }
  }

  /**
   * Delete a monthly investigation
   */
  async deleteInvestigation(patientId: string, investigationId: string): Promise<void> {
    try {
      await apiClient.delete(`/monthly-investigations/${patientId}/${investigationId}`);
    } catch (error) {
      console.error('Error deleting monthly investigation:', error);
      throw error;
    }
  }
}

const monthlyInvestigationService = new MonthlyInvestigationService();
export default monthlyInvestigationService;