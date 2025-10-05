import React from 'react';
import PatientProfilePage from '../patients/PatientProfile';

const NursePatientProfile: React.FC = () => (
  <PatientProfilePage role="nurse" backTo="/nurse/patients" />
);

export default NursePatientProfile;

