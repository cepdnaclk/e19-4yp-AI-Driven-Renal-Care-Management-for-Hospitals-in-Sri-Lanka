import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HeadingLarge, HeadingMedium, HeadingSmall, ParagraphMedium } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Tabs, Tab } from 'baseui/tabs-motion';
import { useNavigate } from 'react-router-dom';
import { Patient, DialysisSession, MonthlyInvestigation } from '../../types';
import { fetchPatientById } from '../doctor/PatientService';

// Mock data
const mockPatients: Record<string, Patient> = {
  '101': {
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
  '102': {
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
  '103': {
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
  }
};

// Mock dialysis sessions
const mockDialysisSessions: Record<string, DialysisSession[]> = {
  '101': [
    {
      id: 'ds101',
      sessionId: '1',
      patientId: '101',
      date: '2025-05-29',
      startTime: '09:00',
      endTime: '13:00',
      duration: 240,
      status: 'COMPLETED',
      preDialysis: {
        weight: 82.5,
        bloodPressure: {
          systolic: 140,
          diastolic: 90
        },
        heartRate: 78,
        temperature: 36.8
      },
      postDialysis: {
        weight: 80.1,
        bloodPressure: {
          systolic: 130,
          diastolic: 85
        },
        heartRate: 72,
        temperature: 36.6
      },
      dialysisParameters: {
        ufGoal: 2.5,
        ufAchieved: 2.4,
        bloodFlow: 300,
        dialysateFlow: 500
      },
      adequacyParameters: {
        ktv: 1.3,
        urr: 68
      },
      vascularAccess: {
        type: 'AVF',
        site: 'Left forearm'
      },
      complications: [],
      qualityIndicators: {
        sessionCompleted: true,
        prescriptionAchieved: true
      },
      nurse: {
        _id: '1',
        name: 'Nurse Smith',
        email: 'nurse@example.com'
      },
      doctor: {
        _id: '2',
        name: 'Dr. Johnson',
        email: 'doctor@example.com'
      },
      notes: 'Patient tolerated session well.',
      createdAt: '2025-05-29T09:00:00Z',
      updatedAt: '2025-05-29T13:00:00Z'
    },
    {
      id: 'ds102',
      sessionId: '2',
      patientId: '101',
      date: '2025-05-26',
      startTime: '09:00',
      endTime: '13:00',
      duration: 240,
      status: 'COMPLETED',
      preDialysis: {
        weight: 83.2,
        bloodPressure: {
          systolic: 145,
          diastolic: 92
        },
        heartRate: 80,
        temperature: 36.7
      },
      postDialysis: {
        weight: 80.5,
        bloodPressure: {
          systolic: 135,
          diastolic: 88
        },
        heartRate: 74,
        temperature: 36.5
      },
      dialysisParameters: {
        ufGoal: 2.7,
        ufAchieved: 2.7,
        bloodFlow: 300,
        dialysateFlow: 500
      },
      adequacyParameters: {
        ktv: 1.2,
        urr: 65
      },
      vascularAccess: {
        type: 'AVF',
        site: 'Left forearm'
      },
      complications: [],
      qualityIndicators: {
        sessionCompleted: true,
        prescriptionAchieved: true
      },
      nurse: {
        _id: '1',
        name: 'Nurse Smith',
        email: 'nurse@example.com'
      },
      doctor: {
        _id: '2',
        name: 'Dr. Johnson',
        email: 'doctor@example.com'
      },
      notes: 'No complications during session.',
      createdAt: '2025-05-26T09:00:00Z',
      updatedAt: '2025-05-26T13:00:00Z'
    }
  ]
};

// Mock monthly investigations
const mockMonthlyInvestigations: Record<string, MonthlyInvestigation[]> = {
  '101': [
    {
      id: 'mi101',
      patientId: '101',
      date: '2025-05-15',
      hemoglobin: 11.2,
      hematocrit: 33.6,
      whiteBloodCellCount: 6.8,
      plateletCount: 210,
      sodium: 138,
      potassium: 4.5,
      chloride: 102,
      bicarbonate: 22,
      bun: 45,
      creatinine: 4.2,
      glucose: 110,
      calcium: 9.2,
      phosphorus: 5.1,
      albumin: 3.8,
      totalProtein: 6.9,
      alt: 25,
      ast: 28,
      alkalinePhosphatase: 95,
      notes: 'Potassium levels slightly elevated but within acceptable range.',
      nurseId: '1'
    },
    {
      id: 'mi102',
      patientId: '101',
      date: '2025-04-15',
      hemoglobin: 10.8,
      hematocrit: 32.4,
      whiteBloodCellCount: 7.1,
      plateletCount: 205,
      sodium: 139,
      potassium: 4.8,
      chloride: 103,
      bicarbonate: 21,
      bun: 48,
      creatinine: 4.5,
      glucose: 115,
      calcium: 9.0,
      phosphorus: 5.3,
      albumin: 3.7,
      totalProtein: 6.8,
      alt: 27,
      ast: 30,
      alkalinePhosphatase: 98,
      notes: 'Hemoglobin trending downward, may need ESA adjustment.',
      nurseId: '1'
    }
  ]
};

const NursePatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | number>('0');
  const [dialysisSessions, setDialysisSessions] = useState<DialysisSession[]>([]);
  const [monthlyInvestigations, setMonthlyInvestigations] = useState<MonthlyInvestigation[]>([]);
  const navigate = useNavigate();

  // Helper functions to format patient data
  const getFormattedAddress = (address: string | any): string => {
    if (typeof address === 'string') return address;
    if (address && typeof address === 'object') {
      return `${address.street}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}`;
    }
    return 'N/A';
  };

  const getFormattedEmergencyContact = (contact: string | any): string => {
    if (typeof contact === 'string') return contact;
    if (contact && typeof contact === 'object') {
      return `${contact.name} (${contact.relationship}) - ${contact.phone}`;
    }
    return 'N/A';
  };

  const getFormattedMedicalHistory = (history: string | any): string => {
    if (typeof history === 'string') return history;
    if (history && typeof history === 'object') {
      let formatted = `${history.renalDiagnosis}`;
      if (history.medicalProblems && history.medicalProblems.length > 0) {
        const problems = history.medicalProblems.map((p: any) => p.problem).join(', ');
        formatted += `\nOther conditions: ${problems}`;
      }
      return formatted;
    }
    return 'N/A';
  };

  const getAssignedDoctorName = (doctor: string | any): string => {
    if (typeof doctor === 'string') return doctor;
    if (doctor && typeof doctor === 'object') {
      return doctor.name;
    }
    return 'N/A';
  };

  useEffect(() => {
    const loadPatientData = async () => {
      if (id) {
        try {
          setLoading(true);
          setError(null);
          const patientData = await fetchPatientById(id);
          
          if (patientData) {
            setPatient(patientData);
            
            // For now, keep using mock data for dialysis sessions, investigations, etc.
            // These would be replaced with actual API calls later
            setDialysisSessions(mockDialysisSessions[id] || []);
            setMonthlyInvestigations(mockMonthlyInvestigations[id] || []);
          } else {
            setError('Patient not found');
          }
        } catch (error) {
          console.error('Error loading patient data:', error);
          setError('Failed to load patient data');
          setPatient(null);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPatientData();
  }, [id]);

  if (loading) {
    return (
      <Block display="flex" justifyContent="center" alignItems="center" height="400px">
        <Block>Loading patient data...</Block>
      </Block>
    );
  }

  if (error) {
    return (
      <Block display="flex" justifyContent="center" alignItems="center" height="400px">
        <Block>Error: {error}</Block>
      </Block>
    );
  }

  if (!patient) {
    return <Block>Patient not found</Block>
  }

  return (
    <Block>
      <HeadingLarge>Patient Profile</HeadingLarge>
      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
        {/* 1. Basic patient information displayed in a card format */}
        <Cell span={[4, 8, 4]}>
          <Card>
            <StyledBody>

              <Block display="flex" flexDirection="column" alignItems="center" marginBottom="16px">
                <Block
                  width="100px"
                  height="100px"
                  backgroundColor="primary200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="16px"
                >
                  <HeadingLarge marginTop="0" marginBottom="0">
                    {patient.name.charAt(0)}
                  </HeadingLarge>
                </Block>
                <HeadingMedium marginTop="0" marginBottom="8px">
                  {patient.name}
                </HeadingMedium>
                <Block font="font400" marginBottom="8px">
                  ID: {patient.patientId || patient.id}
                </Block>
              </Block>

              <Block>
                <Block display="flex" justifyContent="space-between" marginBottom="8px">
                  <Block font="font400">Age:</Block>
                  <Block font="font500">{patient.age}</Block>
                </Block>
                <Block display="flex" justifyContent="space-between" marginBottom="8px">
                  <Block font="font400">Gender:</Block>
                  <Block font="font500">{patient.gender}</Block>
                </Block>
                <Block display="flex" justifyContent="space-between" marginBottom="8px">
                  <Block font="font400">Blood Type:</Block>
                  <Block font="font500">{patient.bloodType}</Block>
                </Block>
                <Block display="flex" justifyContent="space-between" marginBottom="8px">
                  <Block font="font400">Contact:</Block>
                  <Block font="font500">{patient.contactNumber}</Block>
                </Block>
                <Block display="flex" justifyContent="space-between" marginBottom="8px">
                  <Block font="font400">Emergency Contact:</Block>
                  <Block font="font500">{getFormattedEmergencyContact(patient.emergencyContact)}</Block>
                </Block>
                <Block display="flex" justifyContent="space-between" marginBottom="8px">
                  <Block font="font400">Assigned Doctor:</Block>
                  <Block font="font500">{getAssignedDoctorName(patient.assignedDoctor)}</Block>
                </Block>
                <Block display="flex" justifyContent="space-between" marginBottom="8px">
                  <Block font="font400">Registration Date:</Block>
                  <Block font="font500">{new Date(patient.registrationDate).toLocaleDateString()}</Block>
                </Block>
              </Block>

              <Block marginTop="16px">
                <HeadingSmall marginTop="0" marginBottom="8px">
                  Address
                </HeadingSmall>
                <Block font="font400">{getFormattedAddress(patient.address)}</Block>
              </Block>

              <Block marginTop="16px">
                <HeadingSmall marginTop="0" marginBottom="8px">
                  Medical History
                </HeadingSmall>
                <Block font="font400" whiteSpace="pre-line">{getFormattedMedicalHistory(patient.medicalHistory)}</Block>
              </Block>
            </StyledBody>
          </Card>
        </Cell>

        {/* 2. Displaying the tabs for different sections of the patient profile */}
        <Cell span={[4, 8, 8]}>
          <Card>
            <StyledBody>
              <Tabs
                activeKey={activeKey}
                onChange={({ activeKey }) => setActiveKey(String(activeKey))}
                activateOnFocus
              >
                {/* Tab 1: Overview */}
                <Tab title="Overview">
                  <Block padding="16px">
                    <HeadingMedium marginTop="0">Patient Overview</HeadingMedium>

                    <Block marginBottom="24px">
                      <HeadingSmall marginTop="16px" marginBottom="8px">
                        Recent Dialysis Sessions
                      </HeadingSmall>
                      {dialysisSessions.length > 0 ? (
                        <Block>
                          <Block marginBottom="8px">
                            <strong>Last session:</strong> {new Date(dialysisSessions[0].date).toLocaleDateString()}
                          </Block>
                          <Block marginBottom="16px">
                            <ParagraphMedium>
                              Pre-weight: {dialysisSessions[0].preDialysis.weight} kg,
                              Post-weight: {dialysisSessions[0].postDialysis?.weight || 'N/A'} kg,
                              UF Goal: {dialysisSessions[0].dialysisParameters.ufGoal} L
                            </ParagraphMedium>
                          </Block>
                          <Button
                            onClick={() => navigate(`/nurse/patients/${patient.id}/dialysis-session`)}
                            size="compact"
                          >
                            New Dialysis Session
                          </Button>
                        </Block>
                      ) : (
                        <Block>
                          <ParagraphMedium>No recent dialysis sessions</ParagraphMedium>
                          <Button
                            onClick={() => navigate(`/nurse/patients/${patient.id}/dialysis-session`)}
                            size="compact"
                          >
                            New Dialysis Session
                          </Button>
                        </Block>
                      )}
                    </Block>

                    <Block marginBottom="24px">
                      <HeadingSmall marginTop="16px" marginBottom="8px">
                        Monthly Investigations
                      </HeadingSmall>
                      {monthlyInvestigations.length > 0 ? (
                        <Block>
                          <Block marginBottom="8px">
                            <strong>Last investigation:</strong> {monthlyInvestigations[0].date}
                          </Block>
                          <Block marginBottom="16px">
                            <ParagraphMedium>
                              Hemoglobin: {monthlyInvestigations[0].hemoglobin} g/dL,
                              Creatinine: {monthlyInvestigations[0].creatinine} mg/dL,
                              Potassium: {monthlyInvestigations[0].potassium} mEq/L
                            </ParagraphMedium>
                          </Block>
                          <Button
                            onClick={() => navigate(`/nurse/patients/${patient.id}/monthly-investigation`)}
                            size="compact"
                          >
                            New Monthly Investigation
                          </Button>
                        </Block>
                      ) : (
                        <Block>
                          <ParagraphMedium>No monthly investigations</ParagraphMedium>
                          <Button
                            onClick={() => navigate(`/nurse/patients/${patient.id}/monthly-investigation`)}
                            size="compact"
                          >
                            New Monthly Investigation
                          </Button>
                        </Block>
                      )}
                    </Block>

                    <Block>
                      <Button
                        onClick={() => navigate(`/nurse/trend-analysis/${patient.id}`)}
                      >
                        View Trend Analysis
                      </Button>
                    </Block>

                  </Block>
                </Tab>

                {/* Tab 2: Dialysis Sessions */}
                <Tab title="Dialysis Sessions">
                  <Block padding="16px">
                    <Block display="flex" justifyContent="space-between" alignItems="center" marginBottom="16px">
                      <HeadingMedium marginTop="0" marginBottom="0">
                        Dialysis Sessions
                      </HeadingMedium>
                      <Button
                        onClick={() => navigate(`/nurse/patients/${patient.id}/dialysis-session`)}
                      >
                        New Session
                      </Button>
                    </Block>

                    {dialysisSessions.length > 0 ? (
                      dialysisSessions.map(session => (
                        <Block
                          key={session.id}
                          marginBottom="16px"
                          padding="16px"
                          backgroundColor="rgba(0, 0, 0, 0.03)"
                        >
                          <Block display="flex" justifyContent="space-between" marginBottom="8px">
                            <HeadingSmall marginTop="0" marginBottom="0">
                              Session on {new Date(session.date).toLocaleDateString()}
                            </HeadingSmall>
                            <Block>
                              {session.startTime} - {session.endTime || 'In Progress'} 
                              <Block as="span" marginLeft="8px" font="font300">
                                ({session.status})
                              </Block>
                            </Block>
                          </Block>

                          <Block marginBottom="8px">
                            <strong>Weight:</strong> Pre: {session.preDialysis.weight} kg, 
                            Post: {session.postDialysis?.weight || 'N/A'} kg 
                            (UF Goal: {session.dialysisParameters.ufGoal} L, 
                            UF Achieved: {session.dialysisParameters.ufAchieved || 'N/A'} L)
                          </Block>

                          <Block marginBottom="8px">
                            <strong>Vitals:</strong> 
                            BP Pre: {session.preDialysis.bloodPressure.systolic}/{session.preDialysis.bloodPressure.diastolic}, 
                            BP Post: {session.postDialysis?.bloodPressure ? `${session.postDialysis.bloodPressure.systolic}/${session.postDialysis.bloodPressure.diastolic}` : 'N/A'},
                            HR Pre: {session.preDialysis.heartRate}, 
                            HR Post: {session.postDialysis?.heartRate || 'N/A'}
                          </Block>

                          <Block marginBottom="8px">
                            <strong>Dialysis Parameters:</strong> 
                            Blood Flow: {session.dialysisParameters.bloodFlow} mL/min, 
                            Dialysate Flow: {session.dialysisParameters.dialysateFlow} mL/min
                          </Block>

                          <Block marginBottom="8px">
                            <strong>Vascular Access:</strong> 
                            {session.vascularAccess.type} at {session.vascularAccess.site}
                          </Block>

                          {session.adequacyParameters && (
                            <Block marginBottom="8px">
                              <strong>Adequacy:</strong> 
                              Kt/V: {session.adequacyParameters.ktv || 'N/A'}, 
                              URR: {session.adequacyParameters.urr || 'N/A'}%
                            </Block>
                          )}

                          {session.complications && session.complications.length > 0 && (
                            <Block marginBottom="8px">
                              <strong>Complications:</strong> {session.complications.join(', ')}
                            </Block>
                          )}

                          <Block marginBottom="8px">
                            <strong>Nurse:</strong> {session.nurse.name}
                          </Block>

                          {session.notes && (
                            <Block marginBottom="8px">
                              <strong>Notes:</strong> {session.notes}
                            </Block>
                          )}

                          <Block marginBottom="8px">
                            <strong>Quality Indicators:</strong> 
                            Session Completed: {session.qualityIndicators.sessionCompleted ? 'Yes' : 'No'}, 
                            Prescription Achieved: {session.qualityIndicators.prescriptionAchieved ? 'Yes' : 'No'}
                          </Block>
                        </Block>
                      ))
                    ) : (
                      <Block>No dialysis sessions recorded</Block>
                    )}
                  </Block>
                </Tab>

                {/* Tab 3: Monthly Investigations */}
                <Tab title="Monthly Investigations">
                  <Block padding="16px">
                    <Block display="flex" justifyContent="space-between" alignItems="center" marginBottom="16px">
                      <HeadingMedium marginTop="0" marginBottom="0">
                        Monthly Investigations
                      </HeadingMedium>
                      <Button
                        onClick={() => navigate(`/nurse/patients/${patient.id}/monthly-investigation`)}
                      >
                        New Investigation
                      </Button>
                    </Block>

                    {monthlyInvestigations.length > 0 ? (
                      monthlyInvestigations.map(investigation => (
                        <Block
                          key={investigation.id}
                          marginBottom="16px"
                          padding="16px"
                          backgroundColor="rgba(0, 0, 0, 0.03)"
                        >
                          <Block display="flex" justifyContent="space-between" marginBottom="8px">
                            <HeadingSmall marginTop="0" marginBottom="0">
                              Investigation on {investigation.date}
                            </HeadingSmall>
                          </Block>

                          <Block marginBottom="8px">
                            <strong>CBC:</strong> Hemoglobin: {investigation.hemoglobin} g/dL,
                            Hematocrit: {investigation.hematocrit}%,
                            WBC: {investigation.whiteBloodCellCount} K/μL,
                            Platelets: {investigation.plateletCount} K/μL
                          </Block>

                          <Block marginBottom="8px">
                            <strong>Electrolytes:</strong> Sodium: {investigation.sodium} mEq/L,
                            Potassium: {investigation.potassium} mEq/L,
                            Chloride: {investigation.chloride} mEq/L,
                            Bicarbonate: {investigation.bicarbonate} mEq/L
                          </Block>

                          <Block marginBottom="8px">
                            <strong>Renal Function:</strong> BUN: {investigation.bun} mg/dL,
                            Creatinine: {investigation.creatinine} mg/dL,
                            Glucose: {investigation.glucose} mg/dL
                          </Block>

                          <Block marginBottom="8px">
                            <strong>Other:</strong> Calcium: {investigation.calcium} mg/dL,
                            Phosphorus: {investigation.phosphorus} mg/dL,
                            Albumin: {investigation.albumin} g/dL,
                            Total Protein: {investigation.totalProtein} g/dL
                          </Block>

                          <Block marginBottom="8px">
                            <strong>Liver Function:</strong> ALT: {investigation.alt} U/L,
                            AST: {investigation.ast} U/L,
                            Alkaline Phosphatase: {investigation.alkalinePhosphatase} U/L
                          </Block>

                          {investigation.notes && (
                            <Block marginBottom="8px">
                              <strong>Notes:</strong> {investigation.notes}
                            </Block>
                          )}
                        </Block>
                      ))
                    ) : (
                      <Block>No monthly investigations recorded</Block>
                    )}
                  </Block>
                </Tab>

              </Tabs>
            </StyledBody>
          </Card>
        </Cell>
      </Grid>
    </Block>
  );
};

export default NursePatientProfile;
