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
    <div className="general-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1 className="general-h1">Doctor Dashboard</h1>
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div>
          <div className="patient-display">
            <h2 style={{ fontFamily: 'var(--font-heading2)', fontSize: 'var(--size-heading2)', color: 'var(--color-primary)', marginBottom: 16 }}>Patients Requiring Review</h2>
            {patientsLoading ? (
              <div className="patient-search-loading"><span>Loading recent patients...</span></div>
            ) : patientsError ? (
              <div className="patient-search-error"><span>Error: {patientsError}</span></div>
            ) : recentPatients.length > 0 ? (
              recentPatients.map(patient => (
                <div key={patient.id} style={{ marginBottom: 16, padding: 16, background: 'rgba(255, 165, 0, 0.1)', borderRadius: 'var(--border-radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{patient.name}</div>
                    <div style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>
                      Patient ID: {patient.patientId || patient.id}
                    </div>
                    <div style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>
                      Registered: {'25/04/2025'}
                    </div>
                    <div style={{ color: 'orange', fontSize: '1rem' }}>
                      Recently added - requires review
                    </div>
                  </div>
                  <button className="btn btn-blue" style={{ minWidth: 80 }} onClick={() => handlePatientClick(patient.patientId || patient.id)}>
                    Review
                  </button>
                </div>
              ))
            ) : (
              <div className="no-patients">No recent patients found</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <button className="btn btn-blue" onClick={() => navigate('/doctor/patients')}>
                View All Patients
              </button>
            </div>
          </div>

          <div className="general-container" style={{ marginTop: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-heading2)', fontSize: 'var(--size-heading2)', color: 'var(--color-primary)', marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button className="btn btn-blue" onClick={() => navigate('/doctor/patients')}>Search Patients</button>
              <button className="btn btn-blue" onClick={() => navigate('/doctor/notifications')}>
                All Notifications
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="general-container">
            <h2 style={{ fontFamily: 'var(--font-heading2)', fontSize: 'var(--size-heading2)', color: 'var(--color-primary)', marginBottom: 16 }}>Notifications</h2>
            {notificationsLoading ? (
              <div className="patient-search-loading"><span>Loading notifications...</span></div>
            ) : notificationsError ? (
              <div className="patient-search-error"><span>Error: {notificationsError}</span></div>
            ) : notifications.length === 0 ? (
              <div className="no-patients">No new notifications</div>
            ) : (
              notifications.map(notification => {
                const isRead = notification.recipients && notification.recipients.length > 0 
                  ? notification.recipients[0].read 
                  : false;
                const getBackgroundColor = (type: string, priority: string) => {
                  if (type === 'WARNING' || priority === 'HIGH') {
                    return 'rgba(255, 0, 0, 0.1)';
                  } else if (type === 'INFO' && priority === 'MEDIUM') {
                    return 'rgba(255, 165, 0, 0.1)';
                  } else {
                    return 'rgba(0, 0, 0, 0.03)';
                  }
                };
                return (
                  <div
                    key={notification.id}
                    style={{
                      marginBottom: 16,
                      padding: 16,
                      background: getBackgroundColor(notification.type, notification.priority),
                      borderRadius: 'var(--border-radius)',
                      border: isRead ? 'none' : '2px solid rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontWeight: 500 }}>{notification.title}</div>
                      <div style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>
                        {notification.priority}
                      </div>
                    </div>
                    <div style={{ fontSize: '1rem', marginBottom: 8 }}>
                      {notification.message}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>
                        {notification.category}
                      </div>
                    </div>
                    {!isRead && (
                      <div style={{ marginTop: 8, fontSize: '1rem', color: 'orange', display: 'flex', alignItems: 'center' }}>
                        • Unread
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <button className="btn btn-blue" onClick={() => navigate('/doctor/notifications')}>
                View All Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
