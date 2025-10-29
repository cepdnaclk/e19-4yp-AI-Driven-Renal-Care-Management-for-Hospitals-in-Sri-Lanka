import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification, Patient } from '../../types';
import { fetchAllPatients, fetchNotifications } from '../patients/PatientService';
import { patientTableConfig } from '../patients/patientTableConfig';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
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
    <div className="dashboard-header">
      <h1 className="dashboard-title">
        <i className="bi bi-speedometer2"></i> Nurse Dashboard
      </h1>
      <p className="dashboard-subtitle">Welcome back! Here's an overview of your patients and notifications.</p>
    </div>      <div className="dashboard-content">
        <div className="dashboard-grid">
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
                  <LoadingSpinner message="Loading recent patients..." />
                ) : patientsError ? (
                  <div className="patient-search-error">
                    <span>Error loading patients</span>
                    <p>{patientsError}</p>
                  </div>
                ) : recentPatients.length > 0 ? (
                  <div id="table-container">
                    <table id="table" className="patient-table">
                      <thead>
                        <tr>
                          {patientTableConfig.nurse.map((col: any) => (
                            <th key={col.key}>{col.label}</th>
                          ))}
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPatients.map((patient: any) => (
                          <tr key={patient.id}>
                            {patientTableConfig.nurse.map((col: any) => (
                              <td key={col.key}>
                                {col.render ? col.render(patient) : (patient[col.key] ?? 'N/A')}
                              </td>
                            ))}
                            <td>
                              <button className="btn btn-blue" onClick={() => handlePatientClick(patient.patientId || patient.id)}>
                                <i className="bi bi-eye-fill"></i> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-patients-message">
                    <p>No recent patients found</p>
                    <span>Patients will appear here when registered</span>
                  </div>
                )}
                <div className="dashboard-card-actions">
                  <button className="btn btn-blue" onClick={() => navigate('/nurse/patients')}>
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
                  <button className="btn btn-blue" onClick={() => navigate('/nurse/patients')}>
                    <i className="bi bi-search"></i>
                    <span>Search Patients</span>
                  </button>
                  <button className="btn btn-blue" onClick={() => navigate('/nurse/submission-status')}>
                    <i className="bi bi-clipboard-check-fill"></i>
                    <span>View Submissions</span>
                  </button>
                  <button className="btn btn-blue" onClick={() => navigate('/nurse/notifications')}>
                    <i className="bi bi-bell-fill"></i>
                    <span>All Notifications</span>
                  </button>
                  <button className="btn btn-blue" onClick={() => navigate('/nurse/add-patient')}>
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
                  <LoadingSpinner message="Loading notifications..." />
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
                          className={`notification-card ${!isRead ? 'unread' : ''} ${notification.type.toLowerCase()} ${notification.priority.toLowerCase()}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-header">
                            <div className="notification-title">
                              <i className={`${style.icon} notification-icon`}></i>
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
                  <button className="btn btn-green" onClick={() => navigate('/nurse/notifications')}>
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
