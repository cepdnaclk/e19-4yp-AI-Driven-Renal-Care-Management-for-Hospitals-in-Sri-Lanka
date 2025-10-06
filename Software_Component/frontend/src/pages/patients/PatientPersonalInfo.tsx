import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Patient } from '../../types';
import lang from '../../utils/lang.json';

export interface PersonalInfoProps {
  patient: Patient;
  backTo?: string; // optional route to go back
  leftActions?: React.ReactNode; // optional extra actions rendered at bottom
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ patient, backTo, leftActions }) => {
  const navigate = useNavigate();

  const getFormattedAddress = (address: string | any): string => {
    if (typeof address === 'string') return address;
    if (address && typeof address === 'object') {
      return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
    }
    return 'No address available';
  };

  const getFormattedEmergencyContact = (emergencyContact: string | any): string => {
    if (typeof emergencyContact === 'string') return emergencyContact;
    if (emergencyContact && typeof emergencyContact === 'object') {
      return `${emergencyContact.name} (${emergencyContact.relationship}) - ${emergencyContact.phone}`;
    }
    return 'No emergency contact available';
  };

  function getFormattedMedicalHistory(medicalHistory: any): React.ReactNode {
    if (typeof medicalHistory === 'string') {
      return medicalHistory;
    }

    if (medicalHistory && typeof medicalHistory === 'object') {
      return (
        <div className="background-gray padding-10 border-radius-5">
          {medicalHistory.renalDiagnosis && (
            <div className="patient-section" style={{ marginBottom: 8 }}>
              <strong>Renal Diagnosis:</strong> {medicalHistory.renalDiagnosis}
            </div>
          )}

          {medicalHistory.medicalProblems && medicalHistory.medicalProblems.length > 0 && (
            <div className="patient-section" style={{ marginBottom: 8 }}>
              <strong>Medical Problems:</strong>
              {medicalHistory.medicalProblems.map((problem: any, index: number) => (
                <div key={index} style={{ marginLeft: 16, marginTop: 4 }}>
                  • {problem.problem} (Diagnosed: {problem.diagnosedDate}, Status: {problem.status})
                </div>
              ))}
            </div>
          )}

          {medicalHistory.allergies && medicalHistory.allergies.length > 0 && (
            <div className="patient-section" style={{ marginBottom: 8 }}>
              <strong>Allergies:</strong> {medicalHistory.allergies.join(', ')}
            </div>
          )}

          {medicalHistory.medications && medicalHistory.medications.length > 0 && (
            <div className="patient-section" style={{ marginBottom: 8 }}>
              <strong>Current Medications:</strong>
              {medicalHistory.medications.map((medication: any, index: number) => (
                <div key={index} style={{ marginLeft: 16, marginTop: 4 }}>
                  • {medication.name} - {medication.dosage} ({medication.frequency})
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return 'No medical history available';
  }

  return (
    <div className='background-primary border-radius-5 padding-30 grey-box-shadow border-primary'>
      {backTo && (
          <button className="btn btn-gray" onClick={() => navigate(backTo)}>{lang.buttons.back}</button>
      )}
      <div className="text-align-center">
        <div className="patient-avatar" aria-hidden>
          {patient.name ? patient.name.charAt(0) : ''}
        </div>
        <h3 className='margin-top-bottom-10'>{patient.name}</h3>
        <div className="color-primary bold text-small">ID: {patient.patientId}</div>
      </div>

      <div className='margin-top-10'>
        <div className="patient-row padding-top-bottom-10">
          <div className="bold text-normal color-text">Age:</div>
          <div className="text-normal color-secondary-text">{patient.age}</div>
        </div>
        <div className="patient-row padding-top-bottom-10">
          <div className="bold text-normal color-text">Gender:</div>
          <div className="text-normal color-secondary-text">{patient.gender}</div>
        </div>
        <div className="patient-row padding-top-bottom-10">
          <div className="bold text-normal color-text">Blood Type:</div>
          <div className="text-normal color-secondary-text">{patient.bloodType}</div>
        </div>
        <div className="patient-row padding-top-bottom-10">
          <div className="bold text-normal color-text">Contact:</div>
          <div className="text-normal color-secondary-text">{patient.contactNumber}</div>
        </div>
        <div className="patient-row padding-top-bottom-10">
          <div className="bold text-normal color-text">Emergency Contact:</div>
          <div className="text-normal color-secondary-text">{getFormattedEmergencyContact(patient.emergencyContact)}</div>
        </div>
        <div className="patient-row padding-top-bottom-10">
          <div className="bold text-normal color-text">Assigned Doctor:</div>
          <div className="text-normal color-secondary-text">{typeof patient.assignedDoctor === 'string' ? patient.assignedDoctor : patient.assignedDoctor?.name || 'Not assigned'}</div>
        </div>
        <div className="patient-row padding-top-bottom-10">
          <div className="bold text-normal color-text">Registration Date:</div>
          <div className="text-normal color-secondary-text">{patient.registrationDate ? new Date(patient.registrationDate).toLocaleDateString() : 'N/A'}</div>
        </div>
      </div>

      <div>
        <div className='heading3 color-primary bold margin-top-bottom-10'>Address</div>
        <div>{getFormattedAddress(patient.address)}</div>
      </div>

      <div>
        <div className='heading3 color-primary bold margin-top-bottom-10'>Medical History</div>
        <div>{getFormattedMedicalHistory(patient.medicalHistory)}</div>
      </div>

      {patient.dialysisInfo && (
        <div>
          <div className='heading3 color-primary bold margin-top-bottom-10'>Dialysis Information</div>
          <div className="background-gray padding-10 border-radius-5">
            <div className="margin-bottom-10">
              <strong>Type:</strong> {patient.dialysisInfo.dialysisType}
            </div>
            <div className="margin-bottom-10">
              <strong>Frequency:</strong> {patient.dialysisInfo.frequency?.replace('_', ' ')}
            </div>
            <div className="margin-bottom-10">
              <strong>Access:</strong> {patient.dialysisInfo.accessType} ({patient.dialysisInfo.accessSite})
            </div>
            <div className="margin-bottom-10">
              <strong>Dry Weight:</strong> {patient.dialysisInfo.dryWeight} kg
            </div>
            <div>
              <strong>Target UFR:</strong> {patient.dialysisInfo.targetUfr} ml/hr
            </div>
          </div>
        </div>
      )}

      <div className="patient-actions" style={{ marginTop: 24 }}>
        {backTo ? (
          <button className="btn" onClick={() => navigate(backTo)}>Back</button>
        ) : null}

        {leftActions}
      </div>
    </div>
  );
};