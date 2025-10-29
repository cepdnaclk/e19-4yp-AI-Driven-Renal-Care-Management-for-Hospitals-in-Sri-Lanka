import React, { useState } from 'react';
import lang from '../../../utils/lang.json';
import { AddDialysisSessionModal } from '../../../components/AddDialysisSessionModal';
import dialysisSessionService from '../../../services/dialysisSessionService';
import { ProfileRole } from '../PatientProfile';

interface DialysisSessionTabProps {
  dialysisSessions: any[];
  dialysisSessionsLoading: boolean;
  dialysisSessionsError: string | null;
  role?: ProfileRole;
  patientId?: string;
  onLoadDialysisSessions?: () => void;
}

export const DialysisSessionTab: React.FC<DialysisSessionTabProps> = ({
  dialysisSessions,
  dialysisSessionsLoading,
  dialysisSessionsError,
  role,
  patientId,
  onLoadDialysisSessions,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleModalSubmit = async (formData: any) => {
    try {
      if (!patientId) {
        alert('Patient ID is required');
        return;
      }

      await dialysisSessionService.createSession(patientId, formData);
      setShowModal(false);
      if (onLoadDialysisSessions) {
        onLoadDialysisSessions();
      }
      alert('Dialysis session saved successfully');
    } catch (err) {
      console.error('Error saving dialysis session:', err);
      alert('Failed to save dialysis session');
    }
  };
  if (dialysisSessionsLoading) {
    return (
      <div className="loading-container">
        <div>{lang.patient_profile.dialysis_session.loading}</div>
      </div>
    );
  }

  if (dialysisSessionsError) {
    return (
      <div className="error-container">
        <div>{lang.error} {dialysisSessionsError}</div>
      </div>
    );
  }

  if (dialysisSessions.length > 0) {
    const latestSession = dialysisSessions[0];
    return (
      <div>
        {(role === 'doctor' || role === 'nurse') && patientId && (
          <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Add New Dialysis Session
            </button>
          </div>
        )}
        <div className="padding-30 border-primary border-radius-5">
          <div className="patient-row">
            <h3>{lang.patient_profile.dialysis_session.title} {new Date(latestSession.date).toLocaleDateString()}</h3>
            <span>{lang.patient_profile.dialysis_session.session_id} #{latestSession.sessionId}</span>
          </div>
          {latestSession.id && <p><strong>{lang.patient_profile.dialysis_session.session_id}:</strong> {latestSession.id}</p>}
          {latestSession.status && <p><strong>{lang.patient_profile.dialysis_session.status}:</strong> {latestSession.status}</p>}
          {latestSession.doctor && <p><strong>{lang.patient_profile.dialysis_session.attending_doctor}:</strong> {latestSession.doctor.name}</p>}
          {latestSession.nurse && <p><strong>{lang.patient_profile.dialysis_session.assigned_nurse}:</strong> {latestSession.nurse.name}</p>}
          {latestSession.date && <p><strong>{lang.patient_profile.dialysis_session.date_time}:</strong> {new Date(latestSession.date).toLocaleString()}</p>}
          {latestSession.notes && <p><strong>{lang.patient_profile.dialysis_session.notes}:</strong> {latestSession.notes}</p>}
          {latestSession.createdAt && <p><strong>{lang.patient_profile.dialysis_session.record_created}:</strong> {new Date(latestSession.createdAt).toLocaleString()}</p>}
          {latestSession.updatedAt && latestSession.updatedAt !== latestSession.createdAt && <p><strong>{lang.patient_profile.dialysis_session.last_updated}:</strong> {new Date(latestSession.updatedAt).toLocaleString()}</p>}
        </div>

        <AddDialysisSessionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
          patientId={patientId!}
        />
      </div>
    );
  }

  return (
    <div>
      {(role === 'doctor' || role === 'nurse') && patientId && (
        <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Add New Dialysis Session
          </button>
        </div>
      )}
      <div className="no-patients-message">
        <p>{lang.patient_profile.dialysis_session.no_data}</p>
      </div>

      <AddDialysisSessionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        patientId={patientId!}
      />
    </div>
  );
};