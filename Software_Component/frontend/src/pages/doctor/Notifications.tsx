import React, { useState, useEffect } from 'react';
import { Notification, NotificationFilters } from '../../types';
import notificationService from '../../services/notificationService';
import '../../main.css';

const DoctorNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalNotifications, setTotalNotifications] = useState<number>(0);

  const filters: NotificationFilters = {
    page: currentPage,
    limit: 20,
    type: filter === 'critical' ? 'CRITICAL' :
          filter === 'warning' ? 'WARNING' :
          filter === 'success' ? 'SUCCESS' : undefined,
    isRead: filter === 'unread' ? false :
            filter === 'read' ? true : undefined
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [currentPage, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications(filters);
      setNotifications(response.data.notifications);
      setTotalPages(response.data.pagination.pages);
      setTotalNotifications(response.data.pagination.total);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (window.confirm('Are you sure you want to mark all notifications as read?')) {
      try {
        await notificationService.markAllAsRead();
        setNotifications(prevNotifications =>
          prevNotifications.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
      } catch (err) {
        console.error('Error marking all notifications as read:', err);
        setError('Failed to mark all notifications as read.');
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getNotificationStyle = (type: string, priority: string) => {
    const isHighPriority = priority === 'HIGH' || priority === 'URGENT';

    if (type === 'CRITICAL') {
      return {
        background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
        border: isHighPriority ? '3px solid #e57373' : '2px solid #e57373',
        icon: 'bi bi-exclamation-triangle-fill',
        iconColor: '#d32f2f',
        hoverBorder: '#d32f2f'
      };
    } else if (type === 'WARNING') {
      return {
        background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
        border: isHighPriority ? '3px solid #ff9800' : '2px solid #ff9800',
        icon: 'bi bi-exclamation-circle-fill',
        iconColor: '#f57c00',
        hoverBorder: '#f57c00'
      };
    } else if (type === 'SUCCESS') {
      return {
        background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
        border: '2px solid #4caf50',
        icon: 'bi bi-check-circle-fill',
        iconColor: '#2e7d32',
        hoverBorder: '#4caf50'
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

  const getPriorityBadge = (priority: string) => {
    const priorityStyles = {
      URGENT: { color: '#d32f2f', bg: 'rgba(211, 47, 47, 0.1)', text: 'URGENT' },
      HIGH: { color: '#f57c00', bg: 'rgba(245, 124, 0, 0.1)', text: 'HIGH' },
      MEDIUM: { color: '#1976d2', bg: 'rgba(25, 118, 210, 0.1)', text: 'MEDIUM' },
      LOW: { color: '#666', bg: 'rgba(102, 102, 102, 0.1)', text: 'LOW' }
    };

    const style = priorityStyles[priority as keyof typeof priorityStyles] || priorityStyles.MEDIUM;

    return (
      <span style={{
        fontSize: '0.7rem',
        fontWeight: '700',
        padding: '2px 6px',
        borderRadius: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        background: style.bg,
        color: style.color,
        marginLeft: '8px'
      }}>
        {style.text}
      </span>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <div id="container">
        <div id="header">
          <h1>Notifications</h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="container">
      <div id="header">
        <h1>Notifications</h1>
      </div>

      <div className="dashboard-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '32px' }}>
          {/* Error Message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i> {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

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
                    { key: 'all', label: 'All', count: totalNotifications },
                    { key: 'unread', label: 'Unread', count: unreadCount },
                    { key: 'read', label: 'Read', count: totalNotifications - unreadCount },
                    { key: 'critical', label: 'Critical', count: notifications.filter(n => n.type === 'CRITICAL').length },
                    { key: 'warning', label: 'Warnings', count: notifications.filter(n => n.type === 'WARNING').length },
                    { key: 'success', label: 'Success', count: notifications.filter(n => n.type === 'SUCCESS').length }
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
                {unreadCount > 0 && (
                  <span className="status-high" style={{
                    marginLeft: '12px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {unreadCount} unread
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
                    {loading ? 'Loading notifications...' : totalNotifications === 0 ? 'No notifications yet' : 'No notifications match your filters'}
                  </p>
                  <span>
                    {totalNotifications === 0
                      ? "You'll receive updates here when there are new notifications"
                      : 'Try adjusting your search or filter criteria'
                    }
                  </span>
                </div>
              ) : (
                <div className="notifications-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {filteredNotifications.map(notification => {
                    const style = getNotificationStyle(notification.type, notification.priority);

                    return (
                      <div
                        key={notification.id}
                        className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                        style={{
                          background: style.background,
                          border: !notification.isRead ? style.border : 'none',
                          position: 'relative',
                          marginBottom: '16px',
                          padding: '20px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s ease',
                          cursor: !notification.isRead ? 'pointer' : 'default',
                          transform: 'translateY(0)'
                        }}
                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
                          if (!notification.isRead) {
                            e.currentTarget.style.border = `2px solid ${style.hoverBorder}`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                          if (!notification.isRead) {
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
                            {getPriorityBadge(notification.priority)}
                          </div>
                          <div className="notification-category" style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background: 'rgba(255, 255, 255, 0.8)',
                            color: style.iconColor
                          }}>
                            {notification.category.replace('_', ' ')}
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

                        {/* Additional Data Display */}
                        {notification.data && (
                          <div className="notification-data" style={{
                            marginBottom: '15px',
                            padding: '10px',
                            background: 'rgba(255, 255, 255, 0.5)',
                            borderRadius: '8px'
                          }}>
                            {notification.data.labValue && (
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Lab Result:</strong> {notification.data.labValue.parameter} = {notification.data.labValue.value}
                                (Normal: {notification.data.labValue.normalRange}) - {notification.data.labValue.flag}
                              </div>
                            )}
                            {notification.data.appointmentDate && (
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Appointment:</strong> {new Date(notification.data.appointmentDate).toLocaleDateString()}
                                {notification.data.appointmentType && ` - ${notification.data.appointmentType}`}
                              </div>
                            )}
                            {notification.data.actionRequired && (
                              <div style={{ color: style.iconColor, fontWeight: '600' }}>
                                <i className="bi bi-exclamation-circle"></i> Action Required
                              </div>
                            )}
                          </div>
                        )}

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
                            {new Date(notification.createdAt).toLocaleString()}
                          </div>
                          {notification.relatedEntity && (
                            <div className="notification-category" style={{
                              color: style.iconColor,
                              fontWeight: '500'
                            }}>
                              Related: {notification.relatedEntity.entityType} ID: {notification.relatedEntity.entityId}
                            </div>
                          )}
                        </div>
                        {!notification.isRead && (
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '20px',
                  padding: '20px'
                }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                    style={{ padding: '8px 16px' }}
                  >
                    <i className="bi bi-chevron-left"></i> Previous
                  </button>

                  <span style={{
                    fontWeight: '600',
                    color: '#495057',
                    padding: '8px 16px'
                  }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    className="btn-secondary"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                    style={{ padding: '8px 16px' }}
                  >
                    Next <i className="bi bi-chevron-right"></i>
                  </button>
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
                    {notifications.filter(n => n.type === 'CRITICAL').length}
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
                    {notifications.filter(n => n.type === 'WARNING').length}
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
                    {notifications.filter(n => n.isRead).length}
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

export default DoctorNotifications;