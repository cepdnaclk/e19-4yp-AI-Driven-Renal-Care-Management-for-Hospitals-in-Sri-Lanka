import apiClient from './apiConfig';
import { Notification } from '../types';

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  category?: 'PATIENT_ALERT' | 'LAB_RESULT' | 'APPOINTMENT_REMINDER' | 'DIALYSIS_ALERT' | 'AI_PREDICTION' | 'SYSTEM_ALERT';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead?: boolean;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}

class NotificationService {
  // Get notifications for the authenticated user
  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());

      const response = await apiClient.get(`/notifications?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Get single notification by ID
  async getNotificationById(id: string): Promise<{ success: boolean; message: string; data: Notification }> {
    try {
      const response = await apiClient.get(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<{ success: boolean; message: string; data: Notification }> {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ success: boolean; message: string; data: { modifiedCount: number } }> {
    try {
      const response = await apiClient.patch('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(id: string): Promise<{ success: boolean; message: string; data: Notification }> {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Delete all notifications
  async deleteAllNotifications(): Promise<{ success: boolean; message: string; data: { deletedCount: number } }> {
    try {
      const response = await apiClient.delete('/notifications/clear-all');
      return response.data;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }
}

export default new NotificationService();