import apiClient from './apiConfig';

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Array<{
    _id: string;
    count: number;
  }>;
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
}

export interface UserStatsResponse {
  success: boolean;
  stats: UserStats;
}

class UserService {
  // Get user statistics overview
  async getUserStats(): Promise<UserStatsResponse> {
    try {
      const response = await apiClient.get('/users/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }
}

export default new UserService();