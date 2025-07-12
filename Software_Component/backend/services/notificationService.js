const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

class NotificationService {
  /**
   * Create a new notification
   * @param {Object} notificationData - The notification data
   * @returns {Promise<Object>} - The created notification
   */
  static async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();

      // Emit real-time notification
      const io = getIO();
      io.to(`user_${notificationData.userId}`).emit('new_notification', notification);

      return notification;
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Create notifications for multiple users
   * @param {Array} userIds - Array of user IDs
   * @param {Object} notificationData - The notification data (without userId)
   * @returns {Promise<Array>} - Array of created notifications
   */
  static async createBulkNotifications(userIds, notificationData) {
    try {
      const notifications = userIds.map(userId => ({
        ...notificationData,
        userId
      }));

      const createdNotifications = await Notification.insertMany(notifications);

      // Emit real-time notifications
      const io = getIO();
      createdNotifications.forEach(notification => {
        io.to(`user_${notification.userId}`).emit('new_notification', notification);
      });

      return createdNotifications;
    } catch (error) {
      throw new Error(`Failed to create bulk notifications: ${error.message}`);
    }
  }

  /**
   * Create system notification
   * @param {string} userId - User ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} priority - Priority level (low, medium, high, urgent)
   * @returns {Promise<Object>} - Created notification
   */
  static async createSystemNotification(userId, title, message, priority = 'medium') {
    return this.createNotification({
      userId,
      title,
      message,
      type: 'info',
      category: 'system',
      priority
    });
  }

  /**
   * Create patient-related notification
   * @param {string} userId - User ID
   * @param {string} patientId - Patient ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   * @param {string} priority - Priority level
   * @returns {Promise<Object>} - Created notification
   */
  static async createPatientNotification(userId, patientId, title, message, type = 'info', priority = 'medium') {
    return this.createNotification({
      userId,
      title,
      message,
      type,
      category: 'patient',
      priority,
      relatedEntity: {
        entityType: 'patient',
        entityId: patientId
      }
    });
  }

  /**
   * Create dialysis session notification
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID
   * @param {string} patientId - Patient ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   * @param {string} priority - Priority level
   * @returns {Promise<Object>} - Created notification
   */
  static async createSessionNotification(userId, sessionId, patientId, title, message, type = 'info', priority = 'medium') {
    return this.createNotification({
      userId,
      title,
      message,
      type,
      category: 'appointment',
      priority,
      relatedEntity: {
        entityType: 'dialysis_session',
        entityId: sessionId
      }
    });
  }

  /**
   * Create clinical decision notification
   * @param {string} userId - User ID
   * @param {string} decisionId - Decision ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} priority - Priority level
   * @returns {Promise<Object>} - Created notification
   */
  static async createDecisionNotification(userId, decisionId, title, message, priority = 'medium') {
    return this.createNotification({
      userId,
      title,
      message,
      type: 'warning',
      category: 'decision',
      priority,
      actionRequired: true,
      relatedEntity: {
        entityType: 'decision',
        entityId: decisionId
      }
    });
  }

  /**
   * Create AI prediction notification
   * @param {string} userId - User ID
   * @param {string} predictionId - Prediction ID
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} priority - Priority level
   * @returns {Promise<Object>} - Created notification
   */
  static async createPredictionNotification(userId, predictionId, title, message, priority = 'medium') {
    return this.createNotification({
      userId,
      title,
      message,
      type: 'info',
      category: 'ai_prediction',
      priority,
      relatedEntity: {
        entityType: 'ai_prediction',
        entityId: predictionId
      }
    });
  }

  /**
   * Clean up expired notifications
   * @returns {Promise<number>} - Number of deleted notifications
   */
  static async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      return result.deletedCount;
    } catch (error) {
      throw new Error(`Failed to cleanup expired notifications: ${error.message}`);
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Updated notification
   */
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      // Emit real-time update
      const io = getIO();
      io.to(`user_${userId}`).emit('notification_read', { notificationId });

      return notification;
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Number of updated notifications
   */
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, read: false },
        { read: true, readAt: new Date() }
      );

      // Emit real-time update
      const io = getIO();
      io.to(`user_${userId}`).emit('all_notifications_read');

      return result.modifiedCount;
    } catch (error) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  }

  /**
   * Get unread notification count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Unread notification count
   */
  static async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({ userId, read: false });
    } catch (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }
}

module.exports = NotificationService;
