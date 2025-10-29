import apiClient from './apiConfig';

export interface Submission {
  id: string;
  patientId: string;
  patientName: string;
  type: 'Dialysis Session' | 'Monthly Investigation';
  date: string;
  status: 'Completed' | 'Pending Review' | 'In Progress';
  reviewedBy?: string;
  reviewDate?: string;
  entityId: string; // The actual ID of the session or investigation
}

export interface SubmissionsResponse {
  success: boolean;
  submissions: Submission[];
  pendingCount: number;
}

class SubmissionsService {
  // Get recent submissions (dialysis sessions and monthly investigations)
  async getRecentSubmissions(limit: number = 20): Promise<SubmissionsResponse> {
    try {
      // Fetch recent dialysis sessions and monthly investigations
      // Since we don't have a specific submissions endpoint, we'll simulate this
      // by fetching recent data from available endpoints

      // For now, return empty array until backend endpoints are available
      // In a real implementation, this would fetch from dedicated submissions endpoints
      const submissions: Submission[] = [];

      // TODO: Implement when backend provides submissions endpoints
      // const [sessionsResponse, investigationsResponse] = await Promise.all([
      //   apiClient.get('/dialysis-sessions/recent'),
      //   apiClient.get('/monthly-investigations/recent')
      // ]);

      return {
        success: true,
        submissions: submissions,
        pendingCount: 0
      };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }
}

export default new SubmissionsService();