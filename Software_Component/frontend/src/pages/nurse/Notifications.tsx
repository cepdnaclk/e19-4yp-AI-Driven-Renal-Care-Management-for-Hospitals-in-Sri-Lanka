import React, { useState, useEffect } from 'react';
import { HeadingLarge, HeadingMedium } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Table } from 'baseui/table-semantic';
import { Notification } from '../../types';

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'New Patient Assigned',
    message: 'Patient John Doe has been assigned to you for dialysis session today.',
    date: '2025-05-31T08:00:00',
    read: false,
    type: 'info',
    relatedPatientId: '101'
  },
  {
    id: '2',
    userId: '1',
    title: 'Monthly Investigation Due',
    message: 'Monthly investigation for patient Sarah Smith is due tomorrow.',
    date: '2025-05-30T14:30:00',
    read: true,
    type: 'warning',
    relatedPatientId: '102'
  },
  {
    id: '3',
    userId: '1',
    title: 'Critical Lab Result',
    message: 'Patient Michael Johnson has abnormal potassium levels that require immediate attention.',
    date: '2025-05-30T09:15:00',
    read: false,
    type: 'critical',
    relatedPatientId: '103'
  },
  {
    id: '4',
    userId: '1',
    title: 'System Maintenance',
    message: 'The system will be down for maintenance on Sunday, June 1st, from 2:00 AM to 4:00 AM.',
    date: '2025-05-29T16:45:00',
    read: true,
    type: 'info'
  },
  {
    id: '5',
    userId: '1',
    title: 'Training Session',
    message: 'New training session on updated dialysis protocols scheduled for next Monday at 10:00 AM.',
    date: '2025-05-28T11:20:00',
    read: true,
    type: 'info'
  }
];

const NurseNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // In a real app, this would fetch from an API
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  return (
    <Block>
      <HeadingLarge>Notifications</HeadingLarge>

      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
        <Cell span={12}>
          <Card>
            <StyledBody>
              <Block display="flex" justifyContent="space-between" alignItems="center" marginBottom="16px">
                <HeadingMedium marginTop="0" marginBottom="0">
                  All Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                </HeadingMedium>
                {unreadCount > 0 && (
                  <Block onClick={handleMarkAllAsRead} style={{ cursor: 'pointer' }}>
                    Mark all as read
                  </Block>

                )}
              </Block>

              {notifications.length === 0 ? (
                <Block padding="16px" font="font300">
                  No notifications
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
                  >
                    <Block display="flex" justifyContent="space-between" alignItems="center">
                      <Block font="font500">{notification.title}</Block>
                      <Block color="primary400" font="font300">
                        {new Date(notification.date).toLocaleString()}
                      </Block>
                    </Block>
                    <Block font="font300" marginTop="8px">{notification.message}</Block>
                    {!notification.read && (
                      <Block
                        marginTop="8px"
                        color="primary"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as read
                      </Block>
                    )}
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

export default NurseNotifications;
