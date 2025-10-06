import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification, Patient } from '../../types';
import { fetchAllPatients, fetchNotifications } from '../patients/PatientService';
import '../../main.css';

const NurseDashboard: React.FC = () => {
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
      
      // Sort patients by registration date (most recent first) and take the first 5
      const sortedPatients = allPatients
        .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
        .slice(0, 5);
      
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
    navigate(`/nurse/patients/${patientId}`);
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

    // Navigate to related patient if available
    if (notification.relatedPatientId || notification.patientId) {
      navigate(`/nurse/patients/${notification.relatedPatientId || notification.patientId}`);
    }
  };

  return (
    <div id="container">
      <div id="header">
        <h1>Nurse Dashboard</h1>
      </div>

      <div className="dashboard-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        <div className="dashboard-grid-modern">
          <div className="dashboard-main">
            {/* Recent Patients */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <i className="bi bi-person-check-fill"></i> Recent Patients
                </h2>
              </div>
              <div className="dashboard-card-body">
                {patientsLoading ? (
                  <div className="patient-search-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading recent patients...</span>
                  </div>
                ) : patientsError ? (
                  <div className="patient-search-error">
                    <span>Error loading patients</span>
                    <p>{patientsError}</p>
                  </div>
                ) : recentPatients.length > 0 ? (
                  <div className="patients-review-list">
                    {recentPatients.map(patient => (
                      <div key={patient.id} className="patient-review-card">
                        <div className="patient-review-info">
                          <div className="patient-review-name">{patient.name}</div>
                          <div className="patient-review-details">
                            <span className="patient-id">ID: {patient.patientId || patient.id}</span>
                            <span className="patient-date">Age: {patient.age}, Gender: {patient.gender}</span>
                            <span className="patient-status">Blood Type: {patient.bloodType}</span>
                          </div>
                        </div>
                        <button
                          className="patient-action-btn"
                          onClick={() => handlePatientClick(patient.patientId || patient.id)}
                        >
                          <i className="bi bi-eye-fill"></i> View Profile
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-patients-message">
                    <p>No recent patients found</p>
                    <span>Patients will appear here when registered</span>
                  </div>
                )}
                <div className="dashboard-card-actions">
                  <button className="btn-primary" onClick={() => navigate('/nurse/patients')}>
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
              </div>
              <div className="dashboard-card-body">
                <div className="quick-actions-grid">
                  <button className="quick-action-btn" onClick={() => navigate('/nurse/patients')}>
                    <i className="bi bi-search"></i>
                    <span>Search Patients</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => navigate('/nurse/submission-status')}>
                    <i className="bi bi-clipboard-check-fill"></i>
                    <span>View Submissions</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => navigate('/nurse/notifications')}>
                    <i className="bi bi-bell-fill"></i>
                    <span>All Notifications</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => navigate('/nurse/add-patient')}>
                    <i className="bi bi-person-plus-fill"></i>
                    <span>Add New Patient</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-sidebar">
            {/* Notifications */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <i className="bi bi-bell-fill"></i> Notifications
                </h2>
              </div>
              <div className="dashboard-card-body">
                {notificationsLoading ? (
                  <div className="patient-search-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading notifications...</span>
                  </div>
                ) : notificationsError ? (
                  <div className="patient-search-error">
                    <span>Error loading notifications</span>
                    <p>{notificationsError}</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="no-patients-message">
                    <p>No new notifications</p>
                    <span>You'll see updates here</span>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {notifications.map(notification => {
                      const isRead = notification.recipients && notification.recipients.length > 0
                        ? notification.recipients[0].read
                        : false;

                      const getNotificationStyle = (type: string, priority: string) => {
                        if (type === 'WARNING' || priority === 'HIGH' || type === 'critical' || priority === 'high') {
                          return {
                            background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                            border: '2px solid #e57373',
                            icon: 'bi bi-exclamation-triangle-fill',
                            iconColor: '#d32f2f'
                          };
                        } else if (type === 'INFO' && priority === 'MEDIUM' || type === 'warning' || priority === 'medium') {
                          return {
                            background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                            border: '2px solid #ff9800',
                            icon: 'bi bi-info-circle-fill',
                            iconColor: '#f57c00'
                          };
                        } else {
                          return {
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            border: '2px solid #dee2e6',
                            icon: 'bi bi-info-circle',
                            iconColor: '#6c757d'
                          };
                        }
                      };

                      const style = getNotificationStyle(notification.type, notification.priority);

                      return (
                        <div
                          key={notification.id}
                          className={`notification-card ${!isRead ? 'unread' : ''}`}
                          style={{
                            background: style.background,
                            border: isRead ? 'none' : style.border,
                          }}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-header">
                            <div className="notification-title">
                              <i className={style.icon} style={{ color: style.iconColor, marginRight: '8px' }}></i>
                              {notification.title}
                            </div>
                            <div className="notification-priority">
                              {notification.type === 'critical' || notification.priority === 'high' ? 'High' : 
                               notification.type === 'warning' || notification.priority === 'medium' ? 'Medium' : 'Low'}
                            </div>
                          </div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-footer">
                            <div className="notification-time">
                              {notification.date ? new Date(notification.date).toLocaleString() : 
                               notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 
                               'No date available'}
                            </div>
                            <div className="notification-category">{notification.category || 'General'}</div>
                          </div>
                          {!isRead && (
                            <div className="notification-unread-indicator">
                              <i className="bi bi-circle-fill"></i> Unread
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="dashboard-card-actions">
                  <button className="btn-secondary" onClick={() => navigate('/nurse/notifications')}>
                    <i className="bi bi-bell"></i> View All Notifications
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
