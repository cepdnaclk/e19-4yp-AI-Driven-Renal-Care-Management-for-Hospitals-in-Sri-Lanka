import React from 'react';
import PatientProfile from '../patients/PatientProfile';

const DoctorPatientProfile: React.FC = () => (
  <PatientProfile role="doctor" backTo="/doctor/patients" />
);

export default DoctorPatientProfile;