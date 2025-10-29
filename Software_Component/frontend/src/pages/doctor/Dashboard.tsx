import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification, Patient } from '../../types';
import { fetchAllPatients, fetchNotifications } from '../patients/PatientService';
import '../../main.css';

const DoctorDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState<boolean>(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadRecentPatients = async () => {
    try {
      setPatientsLoading(true);
      setPatientsError(null);
      const allPatients = await fetchAllPatients();
      
      // Sort patients by registration date (most recent first) and take the first 2
      const sortedPatients = allPatients
        .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
        .slice(0, 2);
      
      setRecentPatients(sortedPatients);
    } catch (error: any) {
      console.error('Error loading recent patients:', error);
      if (error.message?.includes('Authentication failed') || error.message?.includes('No authentication token')) {
        setPatientsError('Authentication failed. Please log in again.');
      } else {
        setPatientsError('Failed to load recent patients. Please try again.');
      }
      setRecentPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      setNotificationsError(null);
      const notificationData = await fetchNotifications();
      
      if (notificationData && notificationData.notifications) {
        setNotifications(notificationData.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      if (error.message?.includes('Authentication failed') || error.message?.includes('No authentication token')) {
        setNotificationsError('Authentication failed. Please log in again.');
      } else {
        setNotificationsError('Failed to load notifications. Please try again.');
      }
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    // Load notifications and recent patients
    loadNotifications();
    loadRecentPatients();
  }, []);

  const handlePatientClick = (patientId: string) => {
    navigate(`/doctor/patients/${patientId}`);
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read (update local state)
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notification.id ? { 
          ...n, 
          recipients: n.recipients.map((recipient: any) => ({
            ...recipient,
            read: true
          }))
        } : n
      )
    );

    // In a real app, you might want to send a read receipt to the API here
    // await markNotificationAsRead(notification.id);

    // For now, we don't have specific patient navigation from notifications
    // but this could be enhanced based on notification data
  };

  return (
    <div id="container">
      <div id="header">
        <h1>Doctor Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's your overview for today</p>
      </div>

      <div id="sub_container">
        <div className="dashboard-content">
          <div className="dashboard-grid">
            <div className="dashboard-main">
              {/* Patients Requiring Review */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <i className="bi bi-person-check-fill"></i> Patients Requiring Review
                  </h2>
                  <div className="dashboard-card-badge">
                    {recentPatients.length} Pending
                  </div>
                </div>
                <div className="dashboard-card-body">
                  {patientsLoading ? (
                    <div id="table-data-loading">
                      <span>🔄 Loading recent patients...</span>
                    </div>
                  ) : patientsError ? (
                    <div id="table-data-error">
                      <span>❌ Error loading patients</span>
                      <p>{patientsError}</p>
                    </div>
                  ) : recentPatients.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {recentPatients.map(patient => (
                        <div key={patient.id} className="patient-card" onClick={() => handlePatientClick(patient.patientId || patient.id)}>
                          <div className="patient-card-content">
                            <div className="patient-name">
                              <i className="bi bi-person-circle"></i>
                              {patient.name}
                            </div>
                            <div className="patient-details">
                              <span className="patient-detail">
                                <i className="bi bi-upc-scan"></i> ID: {patient.patientId || patient.id}
                              </span>
                              <span className="patient-detail">
                                <i className="bi bi-calendar-check"></i> Registered: 25/04/2025
                              </span>
                              <span className="patient-status">
                                <i className="bi bi-exclamation-triangle-fill"></i> Recently added - requires review
                              </span>
                            </div>
                          </div>
                          <button
                            className="patient-action"
                            onClick={(e) => { e.stopPropagation(); handlePatientClick(patient.patientId || patient.id); }}
                          >
                            <i className="bi bi-eye-fill"></i> Review
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div id="no-data-message">
                      <p>👤 No recent patients found</p>
                      <span>Patients will appear here when registered</span>
                    </div>
                  )}
                  <div className="card-actions">
                    <button className="card-action-btn" onClick={() => navigate('/doctor/patients')}>
                      <i className="bi bi-people-fill"></i> View All Patients
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <i className="bi bi-lightning-charge-fill"></i> Quick Actions
                  </h2>
                  <div className="dashboard-card-badge">
                    2 Available
                  </div>
                </div>
                <div className="dashboard-card-body">
                  <div className="quick-actions-grid">
                    <div className="quick-action-card search" onClick={() => navigate('/doctor/patients')}>
                      <div className="quick-action-icon">🔍</div>
                      <h3 className="quick-action-title">Search Patients</h3>
                      <p className="quick-action-description">Find and review patient records quickly</p>
                      <button className="quick-action-btn">
                        <i className="bi bi-arrow-right-circle-fill"></i> Search Now
                      </button>
                    </div>
                    <div className="quick-action-card notifications" onClick={() => navigate('/doctor/notifications')}>
                      <div className="quick-action-icon">🔔</div>
                      <h3 className="quick-action-title">All Notifications</h3>
                      <p className="quick-action-description">View all system notifications and alerts</p>
                      <button className="quick-action-btn">
                        <i className="bi bi-arrow-right-circle-fill"></i> View All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-sidebar">
              {/* Quick Stats */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <i className="bi bi-bar-chart-fill"></i> Quick Stats
                  </h2>
                </div>
                <div className="dashboard-card-body">
                  <div className="stats-grid">
                    <div className="stat-card patients">
                      <div className="stat-icon">👥</div>
                      <div className="stat-content">
                        <div className="stat-value">{recentPatients.length}</div>
                        <div className="stat-label">Recent Patients</div>
                      </div>
                    </div>
                    <div className="stat-card notifications">
                      <div className="stat-icon">🔔</div>
                      <div className="stat-content">
                        <div className="stat-value">{notifications.length}</div>
                        <div className="stat-label">New Notifications</div>
                      </div>
                    </div>
                    <div className="stat-card actions">
                      <div className="stat-icon">⚡</div>
                      <div className="stat-content">
                        <div className="stat-value">2</div>
                        <div className="stat-label">Quick Actions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <i className="bi bi-bell-fill"></i> Notifications
                  </h2>
                  <div className="dashboard-card-badge">
                    {notifications.length} New
                  </div>
                </div>
                <div className="dashboard-card-body">
                  {notificationsLoading ? (
                    <div id="table-data-loading">
                      <span>🔄 Loading notifications...</span>
                    </div>
                  ) : notificationsError ? (
                    <div id="table-data-error">
                      <span>❌ Error loading notifications</span>
                      <p>{notificationsError}</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div id="no-data-message">
                      <p>🔔 No new notifications</p>
                      <span>You'll see updates here</span>
                    </div>
                  ) : (
                    <div className="notifications-list">
                      {notifications.map(notification => {
                        const isRead = notification.recipients && notification.recipients.length > 0
                          ? notification.recipients[0].read
                          : false;

                        const getNotificationStyle = (type: string, priority: string) => {
                          if (type === 'WARNING' || priority === 'HIGH') {
                            return 'high';
                          } else if (type === 'INFO' && priority === 'MEDIUM') {
                            return 'medium';
                          } else {
                            return 'low';
                          }
                        };

                        const getNotificationEmoji = (type: string, priority: string) => {
                          if (type === 'WARNING' || priority === 'HIGH') {
                            return '🚨';
                          } else if (type === 'INFO' && priority === 'MEDIUM') {
                            return 'ℹ️';
                          } else {
                            return '📝';
                          }
                        };

                        const getNotificationIcon = (type: string, priority: string) => {
                          if (type === 'WARNING' || priority === 'HIGH') {
                            return 'bi bi-exclamation-triangle-fill';
                          } else if (type === 'INFO' && priority === 'MEDIUM') {
                            return 'bi bi-info-circle-fill';
                          } else {
                            return 'bi bi-info-circle';
                          }
                        };

                        const style = getNotificationStyle(notification.type, notification.priority);
                        const emoji = getNotificationEmoji(notification.type, notification.priority);
                        const iconClass = getNotificationIcon(notification.type, notification.priority);

                        return (
                          <div
                            key={notification.id}
                            className={`notification-card ${style}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="notification-icon-container">
                              <span className="notification-emoji">{emoji}</span>
                            </div>
                            <div className="notification-content">
                              <div className="notification-header">
                                <div className="notification-title">
                                  <i className={iconClass}></i>
                                  {notification.title}
                                </div>
                                <div className="notification-priority">{notification.priority}</div>
                              </div>
                              <div className="notification-message">{notification.message}</div>
                              <div className="notification-footer">
                                <div className="notification-time">
                                  <i className="bi bi-clock"></i> {new Date(notification.createdAt).toLocaleString()}
                                </div>
                                <div className="notification-category">{notification.category}</div>
                              </div>
                            </div>
                            {!isRead && (
                              <div className="notification-unread-indicator"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="card-actions">
                    <button className="card-action-btn" onClick={() => navigate('/doctor/notifications')}>
                      <i className="bi bi-bell"></i> View All Notifications
                    </button>
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

export default DoctorDashboard;
