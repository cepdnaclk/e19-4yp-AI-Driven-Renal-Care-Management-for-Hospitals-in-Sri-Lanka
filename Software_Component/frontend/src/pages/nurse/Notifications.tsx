import React, { useState, useEffect } from 'react';
import { Notification } from '../../types';
import '../../main.css';

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
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

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
    if (window.confirm('Are you sure you want to mark all notifications as read?')) {
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read) ||
      (filter === 'critical' && notification.type === 'critical') ||
      (filter === 'warning' && notification.type === 'warning');

    const matchesSearch = searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div id="container">
      <div id="header">
        <h1>Notifications</h1>
      </div>

      <div className="dashboard-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '32px' }}>
          {/* Search and Filter Section */}
          <div className="dashboard-card" style={{ width: '100%' }}>
            <div className="dashboard-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Search Bar */}
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-search" style={{
                    position: 'absolute',
                    left: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6c757d',
                    fontSize: '1rem'
                  }}></i>
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 45px',
                      border: '2px solid #dee2e6',
                      borderRadius: '25px',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                    onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
                  />
                </div>

                {/* Filter Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#495057', marginRight: '8px' }}>Filter:</span>
                  {[
                    { key: 'all', label: 'All', count: notifications.length },
                    { key: 'unread', label: 'Unread', count: unreadCount },
                    { key: 'read', label: 'Read', count: notifications.filter(n => n.read).length },
                    { key: 'critical', label: 'Critical', count: notifications.filter(n => n.type === 'critical').length },
                    { key: 'warning', label: 'Warnings', count: notifications.filter(n => n.type === 'warning').length }
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={filter === key ? 'btn-primary' : 'btn-secondary'}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {label}
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.3)',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '0.8rem'
                      }}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-card" style={{ width: '100%' }}>
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">
                <i className="bi bi-bell-fill"></i> Notifications
                {filteredNotifications.filter(n => !n.read).length > 0 && (
                  <span className="status-high" style={{
                    marginLeft: '12px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {filteredNotifications.filter(n => !n.read).length} unread
                  </span>
                )}
              </h2>
              {unreadCount > 0 && (
                <div className="dashboard-card-actions">
                  <button className="btn-secondary" onClick={handleMarkAllAsRead}>
                    <i className="bi bi-check-all"></i> Mark All as Read
                  </button>
                </div>
              )}
            </div>
            <div className="dashboard-card-body">
              {filteredNotifications.length === 0 ? (
                <div className="no-patients-message" style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#6c757d'
                }}>
                  <i className="bi bi-bell-slash" style={{
                    fontSize: '3rem',
                    marginBottom: '16px',
                    display: 'block',
                    opacity: 0.5
                  }}></i>
                  <p style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' }}>
                    {notifications.length === 0 ? 'No notifications yet' : 'No notifications match your filters'}
                  </p>
                  <span>
                    {notifications.length === 0
                      ? "You'll receive updates here when there are new notifications"
                      : 'Try adjusting your search or filter criteria'
                    }
                  </span>
                </div>
              ) : (
                <div className="notifications-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {filteredNotifications.map(notification => {
                    const getNotificationStyle = (type: string) => {
                      if (type === 'critical') {
                        return {
                          background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                          border: '2px solid #e57373',
                          icon: 'bi bi-exclamation-triangle-fill',
                          iconColor: '#d32f2f',
                          hoverBorder: '#d32f2f'
                        };
                      } else if (type === 'warning') {
                        return {
                          background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                          border: '2px solid #ff9800',
                          icon: 'bi bi-exclamation-circle-fill',
                          iconColor: '#f57c00',
                          hoverBorder: '#f57c00'
                        };
                      } else {
                        return {
                          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                          border: '2px solid #dee2e6',
                          icon: 'bi bi-info-circle-fill',
                          iconColor: '#6c757d',
                          hoverBorder: '#6c757d'
                        };
                      }
                    };

                    const style = getNotificationStyle(notification.type);

                    return (
                      <div
                        key={notification.id}
                        className={`notification-card ${!notification.read ? 'unread' : ''}`}
                        style={{
                          background: style.background,
                          border: !notification.read ? style.border : 'none',
                          position: 'relative',
                          marginBottom: '16px',
                          padding: '20px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s ease',
                          cursor: !notification.read ? 'pointer' : 'default',
                          transform: 'translateY(0)'
                        }}
                        onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
                          if (!notification.read) {
                            e.currentTarget.style.border = `2px solid ${style.hoverBorder}`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                          if (!notification.read) {
                            e.currentTarget.style.border = style.border;
                          }
                        }}
                      >
                        <div className="notification-header" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div className="notification-title" style={{
                            fontWeight: '600',
                            fontSize: '1.1rem',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            flex: 1
                          }}>
                            <i className={style.icon} style={{
                              color: style.iconColor,
                              marginRight: '10px',
                              fontSize: '1.2rem'
                            }}></i>
                            {notification.title}
                          </div>
                          <div className="notification-priority" style={{
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background: 'rgba(255, 255, 255, 0.8)',
                            color: style.iconColor
                          }}>
                            {notification.type === 'critical' ? 'Critical' :
                             notification.type === 'warning' ? 'Warning' : 'Info'}
                          </div>
                        </div>
                        <div className="notification-message" style={{
                          fontSize: '0.95rem',
                          color: '#555',
                          marginBottom: '15px',
                          lineHeight: '1.5'
                        }}>
                          {notification.message}
                        </div>
                        <div className="notification-footer" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.85rem'
                        }}>
                          <div className="notification-time" style={{
                            color: style.iconColor,
                            fontWeight: '500'
                          }}>
                            {new Date(notification.date).toLocaleString()}
                          </div>
                          {notification.relatedPatientId && (
                            <div className="notification-category" style={{
                              color: style.iconColor,
                              fontWeight: '500'
                            }}>
                              Patient ID: {notification.relatedPatientId}
                            </div>
                          )}
                        </div>
                        {!notification.read && (
                          <div className="notification-unread-indicator" style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            color: style.iconColor,
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '4px 8px',
                            borderRadius: '10px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                          }}>
                            <i className="bi bi-circle-fill"></i> Unread
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Notification Statistics */}
          <div className="dashboard-card" style={{ width: '100%' }}>
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">
                <i className="bi bi-bar-chart-fill"></i> Notification Summary
              </h2>
            </div>
            <div className="dashboard-card-body">
              <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                <div
                  onClick={() => setFilter('critical')}
                  style={{
                    textAlign: 'center',
                    padding: '25px',
                    background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                    borderRadius: '15px',
                    border: '2px solid #e57373',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(211, 47, 47, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#d32f2f', marginBottom: '8px' }}>
                    {notifications.filter(n => n.type === 'critical').length}
                  </div>
                  <div style={{ fontSize: '1rem', color: '#d32f2f', fontWeight: '600' }}>
                    <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '5px' }}></i>
                    Critical
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#d32f2f', opacity: 0.8, marginTop: '4px' }}>
                    Click to filter
                  </div>
                </div>
                <div
                  onClick={() => setFilter('warning')}
                  style={{
                    textAlign: 'center',
                    padding: '25px',
                    background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                    borderRadius: '15px',
                    border: '2px solid #ff9800',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 124, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f57c00', marginBottom: '8px' }}>
                    {notifications.filter(n => n.type === 'warning').length}
                  </div>
                  <div style={{ fontSize: '1rem', color: '#f57c00', fontWeight: '600' }}>
                    <i className="bi bi-exclamation-circle-fill" style={{ marginRight: '5px' }}></i>
                    Warnings
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#f57c00', opacity: 0.8, marginTop: '4px' }}>
                    Click to filter
                  </div>
                </div>
                <div
                  onClick={() => setFilter('read')}
                  style={{
                    textAlign: 'center',
                    padding: '25px',
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                    borderRadius: '15px',
                    border: '2px solid #4caf50',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(46, 125, 50, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2e7d32', marginBottom: '8px' }}>
                    {notifications.filter(n => n.read).length}
                  </div>
                  <div style={{ fontSize: '1rem', color: '#2e7d32', fontWeight: '600' }}>
                    <i className="bi bi-check-circle-fill" style={{ marginRight: '5px' }}></i>
                    Read
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#2e7d32', opacity: 0.8, marginTop: '4px' }}>
                    Click to filter
                  </div>
                </div>
                <div
                  onClick={() => setFilter('unread')}
                  style={{
                    textAlign: 'center',
                    padding: '25px',
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    borderRadius: '15px',
                    border: '2px solid #2196f3',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(25, 118, 210, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1976d2', marginBottom: '8px' }}>
                    {unreadCount}
                  </div>
                  <div style={{ fontSize: '1rem', color: '#1976d2', fontWeight: '600' }}>
                    <i className="bi bi-envelope-fill" style={{ marginRight: '5px' }}></i>
                    Unread
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#1976d2', opacity: 0.8, marginTop: '4px' }}>
                    Click to filter
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

export default NurseNotifications;
