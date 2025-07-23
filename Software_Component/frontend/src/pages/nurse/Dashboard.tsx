import React, { useState, useEffect } from 'react';
import { HeadingLarge, HeadingMedium } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { useNavigate } from 'react-router-dom';
import { Notification, Patient } from '../../types';
import { fetchAllPatients, fetchNotifications } from '../doctor/PatientService';

const NurseDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load patients and notifications in parallel
      const [patientsData, notificationsData] = await Promise.all([
        fetchAllPatients(),
        fetchNotifications()
      ]);

      // Set recent patients (first 5)
      setRecentPatients(patientsData.slice(0, 5));
      
      // Set notifications
      if (notificationsData && notificationsData.notifications) {
        setNotifications(notificationsData.notifications.slice(0, 5)); // Show latest 5
      } else if (Array.isArray(notificationsData)) {
        setNotifications(notificationsData.slice(0, 5));
      } else {
        setNotifications([]);
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      if (error.message?.includes('Authentication failed')) {
        setError('Authentication failed. Please log in again.');
        // Could redirect to login here
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = (patientId: string) => {
    navigate(`/nurse/patients/${patientId}`);
  };

  const handleNotificationClick = (notification: any) => {
    // Navigate to related patient if available
    if (notification.relatedPatientId || notification.patientId) {
      navigate(`/nurse/patients/${notification.relatedPatientId || notification.patientId}`);
    }
  };

  if (loading) {
    return (
      <Block>
        <HeadingLarge>Nurse Dashboard</HeadingLarge>
        <Block display="flex" justifyContent="center" alignItems="center" height="200px">
          <Block>Loading dashboard data...</Block>
        </Block>
      </Block>
    );
  }

  if (error) {
    return (
      <Block>
        <HeadingLarge>Nurse Dashboard</HeadingLarge>
        <Block display="flex" justifyContent="center" alignItems="center" height="200px">
          <Block color="negative">Error: {error}</Block>
        </Block>
        <Block display="flex" justifyContent="center" marginTop="16px">
          <Button onClick={loadDashboardData}>Retry</Button>
        </Block>
      </Block>
    );
  }

  return (
    <Block>
      <HeadingLarge>Nurse Dashboard</HeadingLarge>

      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
        <Cell span={[4, 8, 8]}>
          <Card
            overrides={{
              Root: {
                style: {
                  marginBottom: '20px'
                }
              }
            }}
          >
            <StyledBody>
              <HeadingMedium>Recent Patients</HeadingMedium>
              {recentPatients.length === 0 ? (
                <Block padding="16px" font="font300">
                  No patients available
                </Block>
              ) : (
                recentPatients.map(patient => (
                  <Block
                    key={patient.id || patient.patientId}
                    marginBottom="16px"
                    padding="16px"
                    backgroundColor="rgba(0, 0, 0, 0.03)"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Block>
                      <Block font="font500">{patient.name}</Block>
                      <Block color="primary400" font="font300">
                        Age: {patient.age}, Gender: {patient.gender}
                      </Block>
                      <Block color="primary400" font="font300">
                        Blood Type: {patient.bloodType}
                      </Block>
                      <Block color="primary400" font="font300">
                        Doctor: {typeof patient.assignedDoctor === 'string' ? 
                          patient.assignedDoctor : 
                          patient.assignedDoctor?.name || 'Not assigned'}
                      </Block>
                    </Block>
                    <Button
                      onClick={() => handlePatientClick(patient.id || patient.patientId || '')}
                      size="compact"
                    >
                      View
                    </Button>
                  </Block>
                ))
              )}
              <Block display="flex" justifyContent="center" marginTop="16px">
                <Button onClick={() => navigate('/nurse/patients')}>
                  View All Patients
                </Button>
              </Block>
            </StyledBody>
          </Card>

          <Card>
            <StyledBody>
              <HeadingMedium>Quick Actions</HeadingMedium>
              <Block display="flex" flexWrap={true} style={{ gap: '16px' }}>
                <Button onClick={() => navigate('/nurse/patients')}>
                  Search Patients
                </Button>
                <Button onClick={() => navigate('/nurse/submission-status')}>
                  View Submissions
                </Button>
                <Button onClick={() => navigate('/nurse/notifications')}>
                  All Notifications
                </Button>
                <Button onClick={() => navigate('/nurse/add-patient')}>
                  Add New Patient
                </Button>
              </Block>
            </StyledBody>
          </Card>
        </Cell>

        <Cell span={[4, 8, 4]}>
          <Card>
            <StyledBody>
              <HeadingMedium>Notifications</HeadingMedium>
              {notifications.length === 0 ? (
                <Block padding="16px" font="font300">
                  No new notifications
                </Block>
              ) : (
                notifications.map(notification => (
                  <Block
                    key={notification.id}
                    marginBottom="16px"
                    padding="16px"
                    backgroundColor={
                      notification.type === 'critical' || notification.priority === 'high'
                        ? 'rgba(255, 0, 0, 0.1)'
                        : notification.type === 'warning' || notification.priority === 'medium'
                          ? 'rgba(255, 165, 0, 0.1)'
                          : 'rgba(0, 0, 0, 0.03)'
                    }
                    style={{
                      border: notification.read ? 'none' : '2px solid rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Block font="font500">{notification.title}</Block>
                    <Block font="font300">{notification.message}</Block>
                    <Block color="primary400" font="font300" marginTop="8px">
                      {notification.date ? new Date(notification.date).toLocaleString() : 
                       notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 
                       'No date available'}
                    </Block>
                  </Block>
                ))
              )}
            </StyledBody>
          </Card>
        </Cell>
      </Grid>
    </Block>
  );
};

export default NurseDashboard;
