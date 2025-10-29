import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types';
import notificationService from '../../services/notificationService';
import userService from '../../services/userService';

const AdminDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userStats, setUserStats] = useState({
    totalDoctors: 0,
    totalNurses: 0,
    pendingApprovals: 0,
    recentlyActive: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch notifications
        const notificationResponse = await notificationService.getNotifications({ limit: 10 });
        setNotifications(notificationResponse.data.notifications);

        // Fetch user statistics
        const userStatsResponse = await userService.getUserStats();
        const stats = userStatsResponse.stats;

        // Calculate stats for dashboard display
        const totalDoctors = stats.usersByRole.find(role => role._id === 'doctor')?.count || 0;
        const totalNurses = stats.usersByRole.find(role => role._id === 'nurse')?.count || 0;
        const pendingApprovals = stats.inactiveUsers; // Assuming inactive users need approval
        const recentlyActive = stats.activeUsers;

        setUserStats({
          totalDoctors,
          totalNurses,
          pendingApprovals,
          recentlyActive,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((prevNotifications) =>
          prevNotifications.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  return (
    <div id='container'>
      <div id="header">
        <h1>Admin Dashboard</h1>
        <p className="heading3 color-secondary-text">Welcome back! Here's an overview of your system.</p>
        <div className="color-primary bold">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid-modern">
          <div className="dashboard-main">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <i className="bi bi-bar-chart-line"></i> User Statistics
                </h2>
              </div>
              <div className="dashboard-card-body">
                {loading ? (
                  <div className="loading-stats">
                    <i className="bi bi-arrow-repeat"></i>
                    <span>Loading statistics...</span>
                  </div>
                ) : (
                  <div className="stats-grid">
                    {[
                      {
                        label: 'Total Doctors',
                        value: userStats.totalDoctors,
                        icon: 'bi bi-person-badge',
                        color: '#4CAF50',
                      },
                      {
                        label: 'Total Nurses',
                        value: userStats.totalNurses,
                        icon: 'bi bi-heart-pulse',
                        color: '#2196F3',
                      },
                      {
                        label: 'Pending Approvals',
                        value: userStats.pendingApprovals,
                        icon: 'bi bi-clock',
                        color: userStats.pendingApprovals > 0 ? '#FF9800' : '#4CAF50',
                      },
                      {
                        label: 'Recently Active Users',
                        value: userStats.recentlyActive,
                        icon: 'bi bi-activity',
                        color: '#9C27B0',
                      },
                    ].map(({ label, value, icon, color }) => (
                      <div key={label} className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
                        <div className="stat-icon">
                          <i className={icon} style={{ color }}></i>
                        </div>
                        <div className="stat-content">
                          <div className="stat-label">{label}</div>
                          <div className="stat-value" style={{ color }}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="dashboard-card-actions">
                  <button className="btn btn-primary" onClick={() => navigate('/admin/user-management')}>
                    <i className="bi bi-people"></i> Manage Users
                  </button>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <i className="bi bi-lightning"></i> Quick Actions
                </h2>
              </div>
              <div className="dashboard-card-body">
                <div className="quick-actions-grid">
                  <button className="action-btn" onClick={() => navigate('/admin/user-management')}>
                    <i className="bi bi-person-plus"></i>
                    <span>User Management</span>
                  </button>
                  <button className="action-btn" onClick={() => navigate('/admin/reports')}>
                    <i className="bi bi-file-earmark-text"></i>
                    <span>Reports</span>
                  </button>
                  <button className="action-btn" onClick={() => navigate('/admin/settings')}>
                    <i className="bi bi-gear"></i>
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <i className="bi bi-bell-fill"></i> Recent Notifications
                </h2>
              </div>
              <div className="dashboard-card-body">
                {loading ? (
                  <div className="loading-notifications">
                    <i className="bi bi-arrow-repeat"></i>
                    <span>Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="no-notifications">
                    <i className="bi bi-check-circle"></i>
                    <span>No new notifications</span>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`notification-item ${!notification.isRead ? 'unread' : ''} ${notification.type}`}
                      >
                        <div className="notification-icon">
                          <i className={`bi ${
                            notification.type === 'CRITICAL' ? 'bi-exclamation-triangle-fill' :
                            notification.type === 'WARNING' ? 'bi-exclamation-circle-fill' :
                            'bi-info-circle-fill'
                          }`}></i>
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">
                            {new Date(notification.createdAt).toLocaleString()}
                          </div>
                        </div>
                        {!notification.isRead && <div className="notification-unread-indicator"></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <i className="bi bi-graph-up"></i> System Health
                </h2>
              </div>
              <div className="dashboard-card-body">
                <div className="health-status">
                  <div className="health-item">
                    <span className="health-label">Server Status</span>
                    <span className="health-value status-good">Online</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Database</span>
                    <span className="health-value status-good">Healthy</span>
                  </div>
                  <div className="health-item">
                    <span className="health-label">Last Backup</span>
                    <span className="health-value">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;