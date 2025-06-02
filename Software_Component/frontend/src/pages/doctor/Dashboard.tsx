import React, { useState, useEffect } from 'react';
import { HeadingLarge, HeadingMedium } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types';

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '2',
    title: 'New Patient Assigned',
    message: 'Patient John Doe has been assigned to you for review.',
    date: '2025-05-31T08:00:00',
    read: false,
    type: 'info',
    relatedPatientId: '101',
  },
  {
    id: '2',
    userId: '2',
    title: 'Critical Lab Result',
    message:
      'Patient Sarah Smith has abnormal potassium levels that require immediate attention.',
    date: '2025-05-30T14:30:00',
    read: false,
    type: 'critical',
    relatedPatientId: '102',
  },
  {
    id: '3',
    userId: '2',
    title: 'AI Prediction Alert',
    message:
      'AI system has detected potential risk of anemia for patient Michael Johnson.',
    date: '2025-05-30T09:15:00',
    read: false,
    type: 'warning',
    relatedPatientId: '103',
  },
];

// Mock recent patients
const recentPatients = [
  { id: '101', name: 'John Doe', lastSession: '2025-05-29', pendingReview: true },
  { id: '102', name: 'Sarah Smith', lastSession: '2025-05-28', pendingReview: true },
  { id: '103', name: 'Michael Johnson', lastSession: '2025-05-30', pendingReview: false },
];

const DoctorDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, fetch notifications here
    setNotifications(mockNotifications);
  }, []);

  const handlePatientClick = (patientId: string) => {
    navigate(`/doctor/patients/${patientId}`);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    // Navigate to related patient if available
    if (notification.relatedPatientId) {
      navigate(`/doctor/patients/${notification.relatedPatientId}`);
    }
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
              {recentPatients
                .filter(p => p.pendingReview)
                .map(patient => (
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
                        Last session: {patient.lastSession}
                      </Block>
                      <Block color="warning" font="font300">
                        Pending review
                      </Block>
                    </Block>
                    <Button onClick={() => handlePatientClick(patient.id)} size="compact">
                      Review
                    </Button>
                  </Block>
                ))}
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
                      notification.type === 'critical'
                        ? 'rgba(255, 0, 0, 0.1)'
                        : notification.type === 'warning'
                          ? 'rgba(255, 165, 0, 0.1)'
                          : 'rgba(0, 0, 0, 0.03)'
                    }
                    style={{
                      border: notification.read ? 'none' : '2px solid rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Block font="font500">{notification.title}</Block>
                    <Block font="font300">{notification.message}</Block>
                    <Block color="primary400" font="font300" marginTop="8px">
                      {new Date(notification.date).toLocaleString()}
                    </Block>
                  </Block>
                ))
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
