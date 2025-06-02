import React, { useState, useEffect } from 'react';
import { HeadingLarge, HeadingMedium } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { useNavigate } from 'react-router-dom';
import { Input } from 'baseui/input';
import { FormControl } from 'baseui/form-control';
import { Select } from 'baseui/select';
import { Table } from 'baseui/table-semantic';
import { Patient } from '../../types';

// Mock data
const mockPatients: Patient[] = [
  {
    id: '101',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    bloodType: 'A+',
    contactNumber: '555-123-4567',
    address: '123 Main St, Anytown, USA',
    emergencyContact: '555-987-6543',
    medicalHistory: 'Hypertension, Diabetes',
    assignedDoctor: 'Dr. Smith',
    registrationDate: '2024-01-15'
  },
  {
    id: '102',
    name: 'Sarah Smith',
    age: 38,
    gender: 'Female',
    bloodType: 'O-',
    contactNumber: '555-234-5678',
    address: '456 Oak Ave, Somewhere, USA',
    emergencyContact: '555-876-5432',
    medicalHistory: 'Chronic Kidney Disease',
    assignedDoctor: 'Dr. Johnson',
    registrationDate: '2024-02-20'
  },
  {
    id: '103',
    name: 'Michael Johnson',
    age: 52,
    gender: 'Male',
    bloodType: 'B+',
    contactNumber: '555-345-6789',
    address: '789 Pine Rd, Elsewhere, USA',
    emergencyContact: '555-765-4321',
    medicalHistory: 'Hypertension, Coronary Artery Disease',
    assignedDoctor: 'Dr. Williams',
    registrationDate: '2024-03-10'
  },
  {
    id: '104',
    name: 'Emily Davis',
    age: 29,
    gender: 'Female',
    bloodType: 'AB+',
    contactNumber: '555-456-7890',
    address: '101 Elm St, Nowhere, USA',
    emergencyContact: '555-654-3210',
    medicalHistory: 'Lupus Nephritis',
    assignedDoctor: 'Dr. Smith',
    registrationDate: '2024-04-05'
  },
  {
    id: '105',
    name: 'Robert Wilson',
    age: 67,
    gender: 'Male',
    bloodType: 'A-',
    contactNumber: '555-567-8901',
    address: '202 Maple Dr, Anyplace, USA',
    emergencyContact: '555-543-2109',
    medicalHistory: 'Diabetes, End-Stage Renal Disease',
    assignedDoctor: 'Dr. Johnson',
    registrationDate: '2024-05-12'
  }
];

const NursePatientSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [sortDirection, setSortDirection] = useState<[string, string]>(['id', 'ASC']);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, this would fetch from an API
    setPatients(mockPatients);
    setFilteredPatients(mockPatients);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(
        patient => 
          patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const handleViewPatient = (patientId: string) => {
    navigate(`/nurse/patients/${patientId}`);
  };

  const handleAddNewPatient = () => {
    // In a real app, this would navigate to a form or open a modal
    alert('Add new patient functionality would be implemented here');
  };

  return (
    <Block>
      <HeadingLarge>Patient Search</HeadingLarge>
      
      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
        <Cell span={12}>
          <Card
            overrides={{
              Root: {
                style: {
                  marginBottom: '20px'
                }
              }
            }}
          >
            <StyledBody>
              <Block display="flex" justifyContent="space-between" alignItems="flex-end" marginBottom="16px">
                <FormControl label="Search Patients">
                  <Input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.currentTarget.value)}
                    placeholder="Search by Patient ID or Name"
                    clearable
                    clearOnEscape
                  />
                </FormControl>
                <Button onClick={handleAddNewPatient}>Add New Patient</Button>
              </Block>
              
              <Table
                columns={['ID', 'Name', 'Age', 'Gender', 'Blood Type', 'Assigned Doctor', 'Actions']}
                data={filteredPatients.map(patient => [
                  patient.id,
                  patient.name,
                  patient.age,
                  patient.gender,
                  patient.bloodType,
                  patient.assignedDoctor,
                  <Button 
                    key={patient.id}
                    size="compact"
                    onClick={() => handleViewPatient(patient.id)}
                  >
                    View
                  </Button>
                ])}
                emptyMessage="No patients found"
              />
            </StyledBody>
          </Card>
        </Cell>
      </Grid>
    </Block>
  );
};

export default NursePatientSearch;
