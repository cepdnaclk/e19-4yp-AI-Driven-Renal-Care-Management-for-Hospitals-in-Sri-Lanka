// Table configuration for patient search columns based on the role

import { PatientCatalogue, Patient } from '../../types'

export const patientTableConfig = {
  doctor: [
    { key: 'patientId', label: 'Patient ID' },
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
    { key: 'bloodType', label: 'Blood Type' },
    { key: 'assignedDoctor', label: 'Assigned Doctor', render: (patient: PatientCatalogue | Patient) => {
      const doc = patient.assignedDoctor;
      if (!doc) return 'N/A';
      if (typeof doc === 'string') return doc;
      if ('name' in doc && typeof doc.name === 'string') return doc.name;
      return 'N/A';
    } },
  ],
  nurse: [
    { key: 'patientId', label: 'Patient ID' },
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
    { key: 'bloodType', label: 'Blood Type' },
    { key: 'contactNumber', label: 'Contact Number' },
    { key: 'assignedDoctor', label: 'Assigned Doctor', render: (patient: PatientCatalogue | Patient) => {
      const doc = patient.assignedDoctor;
      if (!doc) return 'N/A';
      if (typeof doc === 'string') return doc;
      if ('name' in doc && typeof doc.name === 'string') return doc.name;
      return 'N/A';
    } },
  ],
}