import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types';
import submissionsService from '../../services/submissionsService';
import '../../main.css';

const NurseSubmissionStatus: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await submissionsService.getRecentSubmissions();
        setSubmissions(response.submissions);
        setPendingCount(response.pendingCount);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleViewPatient = (patientId: string) => {
    navigate(`/nurse/patients/${patientId}`);
  };

  return (
    <div id="container">
      <div id="header">
        <h1>Submission Status</h1>
      </div>

      <div className="dashboard-content" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        <div className="dashboard-grid-modern">
          <div className="dashboard-main">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <i className="bi bi-clipboard-check-fill"></i> Recent Submissions
                  {pendingCount > 0 && (
                    <span className="status-high" style={{
                      marginLeft: '12px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {pendingCount} pending review
                    </span>
                  )}
                </h2>
              </div>
              <div className="dashboard-card-body">
                {loading ? (
                  <div className="no-patients-message">
                    <p>Loading submissions...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="no-patients-message">
                    <p>No submissions found</p>
                    <span>Submissions will appear here when patients submit data</span>
                  </div>
                ) : (
                  <div className="data-table">
                    <table>
                      <thead>
                        <tr>
                          <th><i className="bi bi-hash"></i> ID</th>
                          <th><i className="bi bi-person-fill"></i> Patient</th>
                          <th><i className="bi bi-tag-fill"></i> Type</th>
                          <th><i className="bi bi-calendar-date"></i> Date</th>
                          <th><i className="bi bi-check-circle-fill"></i> Status</th>
                          <th><i className="bi bi-person-check"></i> Reviewed By</th>
                          <th><i className="bi bi-calendar-check"></i> Review Date</th>
                          <th><i className="bi bi-gear-fill"></i> Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map(submission => (
                          <tr key={submission.id}>
                            <td>{submission.id}</td>
                            <td>
                              <div style={{ fontWeight: '600', color: 'var(--color-primary)' }}>
                                {submission.patientName}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                ID: {submission.patientId}
                              </div>
                            </td>
                            <td>
                              <span style={{
                                background: submission.type === 'Dialysis Session' ?
                                  'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' :
                                  'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                                color: submission.type === 'Dialysis Session' ? '#1976d2' : '#7b1fa2',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>
                                {submission.type}
                              </span>
                            </td>
                            <td>{new Date(submission.date).toLocaleDateString()}</td>
                            <td>
                              <span className={
                                submission.status === 'Completed' ? 'status-normal' :
                                submission.status === 'Pending Review' ? 'status-high' : 'status-low'
                              }>
                                {submission.status}
                              </span>
                            </td>
                            <td>{submission.reviewedBy || '-'}</td>
                            <td>{submission.reviewDate ? new Date(submission.reviewDate).toLocaleDateString() : '-'}</td>
                            <td>
                              <button
                                className="btn-primary"
                                onClick={() => handleViewPatient(submission.patientId)}
                                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                              >
                                <i className="bi bi-eye-fill"></i> View Patient
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <i className="bi bi-bar-chart-fill"></i> Submission Summary
                </h2>
              </div>
              <div className="dashboard-card-body">
                <div className="stats-grid">
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                    borderRadius: '12px',
                    border: '2px solid #4caf50'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2e7d32' }}>
                      {submissions.filter(s => s.status === 'Completed').length}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#2e7d32', fontWeight: '600' }}>
                      Completed
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                    borderRadius: '12px',
                    border: '2px solid #ff9800'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f57c00' }}>
                      {pendingCount}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#f57c00', fontWeight: '600' }}>
                      Pending Review
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    borderRadius: '12px',
                    border: '2px solid #2196f3'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1976d2' }}>
                      {submissions.length}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#1976d2', fontWeight: '600' }}>
                      Total Submissions
                    </div>
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

export default NurseSubmissionStatus;
