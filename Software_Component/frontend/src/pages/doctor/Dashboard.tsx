import React, { useState, useEffect } from 'react';
import { HeadingLarge, HeadingMedium } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { useNavigate } from 'react-router-dom';
import { Notification, Patient } from '../../types';
import { fetchAllPatients, fetchNotifications } from './PatientService';

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
    <Block>
      <HeadingLarge>Doctor Dashboard</HeadingLarge>

      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
        <Cell span={[4, 8, 8]}>
          <Card
            overrides={{
              Root: {
                style: {
                  marginBottom: '20px',
                },
              },
            }}
          >
            <StyledBody>
              <HeadingMedium>Patients Requiring Review</HeadingMedium>
              {patientsLoading ? (
                <Block display="flex" justifyContent="center" alignItems="center" height="100px">
                  <Block>Loading recent patients...</Block>
                </Block>
              ) : patientsError ? (
                <Block display="flex" justifyContent="center" alignItems="center" height="100px">
                  <Block color="negative">Error: {patientsError}</Block>
                </Block>
              ) : recentPatients.length > 0 ? (
                recentPatients.map(patient => (
                  <Block
                    key={patient.id}
                    marginBottom="16px"
                    padding="16px"
                    backgroundColor="rgba(255, 165, 0, 0.1)"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Block>
                      <Block font="font500">{patient.name}</Block>
                      <Block color="primary400" font="font300">
                        Patient ID: {patient.patientId || patient.id}
                      </Block>
                      <Block color="primary400" font="font300">
                        Registered: {'25/04/2025'}
                      </Block>
                      <Block color="warning" font="font300">
                        Recently added - requires review
                      </Block>
                    </Block>
                    <Button onClick={() => handlePatientClick(patient.patientId || patient.id)} size="compact">
                      Review
                    </Button>
                  </Block>
                ))
              ) : (
                <Block padding="16px" font="font300">
                  No recent patients found
                </Block>
              )}
              <Block display="flex" justifyContent="center" marginTop="16px">
                <Button onClick={() => navigate('/doctor/patients')}>
                  View All Patients
                </Button>
              </Block>
            </StyledBody>
          </Card>

          <Card>
            <StyledBody>
              <HeadingMedium>Quick Actions</HeadingMedium>
              <Block
                display="flex"
                flexWrap={true}
                style={{ gap: '16px' }}
              >
                <Button onClick={() => navigate('/doctor/patients')}>Search Patients</Button>
                <Button onClick={() => navigate('/doctor/notifications')}>
                  All Notifications
                </Button>
              </Block>
            </StyledBody>
          </Card>
        </Cell>

        <Cell span={[4, 8, 4]}>
          <Card>
            <StyledBody>
              <HeadingMedium>Notifications</HeadingMedium>
              {notificationsLoading ? (
                <Block display="flex" justifyContent="center" alignItems="center" height="100px">
                  <Block>Loading notifications...</Block>
                </Block>
              ) : notificationsError ? (
                <Block display="flex" justifyContent="center" alignItems="center" height="100px">
                  <Block color="negative">Error: {notificationsError}</Block>
                </Block>
              ) : notifications.length === 0 ? (
                <Block padding="16px" font="font300">
                  No new notifications
                </Block>
              ) : (
                notifications.map(notification => {
                  // Get the first recipient's read status (assuming current user is first recipient)
                  const isRead = notification.recipients && notification.recipients.length > 0 
                    ? notification.recipients[0].read 
                    : false;
                  
                  // Map notification type to background color
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
                    <Block
                      key={notification.id}
                      marginBottom="16px"
                      padding="16px"
                      backgroundColor={getBackgroundColor(notification.type, notification.priority)}
                      style={{
                        border: isRead ? 'none' : '2px solid rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <Block display="flex" justifyContent="space-between" marginBottom="4px">
                        <Block font="font500">{notification.title}</Block>
                        <Block font="font300" color="primary400">
                          {notification.priority}
                        </Block>
                      </Block>
                      <Block font="font300" marginBottom="8px">
                        {notification.message}
                      </Block>
                      <Block display="flex" justifyContent="space-between" alignItems="center">
                        <Block color="primary400" font="font300">
                          {new Date(notification.createdAt).toLocaleString()}
                        </Block>
                        <Block font="font300" color="primary500">
                          {notification.category}
                        </Block>
                      </Block>
                      {!isRead && (
                        <Block 
                          marginTop="8px" 
                          font="font300" 
                          color="warning"
                          display="flex"
                          alignItems="center"
                        >
                          • Unread
                        </Block>
                      )}
                    </Block>
                  );
                })
              )}
              <Block display="flex" justifyContent="center" marginTop="16px">
                <Button onClick={() => navigate('/doctor/notifications')}>
                  View All Notifications
                </Button>
              </Block>
            </StyledBody>
          </Card>
        </Cell>
      </Grid>
    </Block>
  );
};

export default DoctorDashboard;
