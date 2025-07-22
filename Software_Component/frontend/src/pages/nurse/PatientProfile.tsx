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
import { toaster } from 'baseui/toast'

import axios from 'axios'

const NursePatientProfile: React.FC = () => {
  const token = localStorage.getItem('userToken')
  const navigate = useNavigate()

  // Take the Patient ID from the URL parameters. This is used to fetch the specific patient's data
  const { id } = useParams<{ id: string }>()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [activeKey, setActiveKey] = useState<string | number>('0')
  const [dialysisSessions, setDialysisSessions] = useState<DialysisSession[]>([])
  const [monthlyInvestigations, setMonthlyInvestigations] = useState<MonthlyInvestigation[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch dialysis sessions for the patient
  const fetchDialysisSessions = async (patientId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/dialysis-sessions/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Fetched dialysis sessions:', response.data);
      setDialysisSessions(response.data.sessions || []);
    } catch (error: any) {
      console.error('Error fetching dialysis sessions:', error);
      toaster.negative('Failed to fetch dialysis sessions', { autoHideDuration: 3000 });
    }
  };

  // Fetch monthly investigations for the patient
  const fetchMonthlyInvestigations = async (patientId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/monthly-investigations/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Fetched monthly investigations:', response.data);
      setMonthlyInvestigations(response.data.investigations || []);
    } catch (error: any) {
      console.error('Error fetching monthly investigations:', error);
      toaster.negative('Failed to fetch monthly investigations', { autoHideDuration: 3000 });
    }
  };

  // Fetch patient data by id
  const fetchPatientById = async (patientId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/patients/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedPatient = response.data.patient;
      console.log('Fetched patient:', fetchedPatient);

      // Set main patient info
      setPatient({
        id: fetchedPatient._id,
        name: fetchedPatient.name,
        age: fetchedPatient.age,
        gender: fetchedPatient.gender,
        bloodType: fetchedPatient.bloodType,
        contactNumber: fetchedPatient.contactNumber,
        address: fetchedPatient.fullAddress ||
          `${fetchedPatient.address?.street || ''}, ${fetchedPatient.address?.city || ''}, ${fetchedPatient.address?.state || ''}, ${fetchedPatient.address?.zipCode || ''}, ${fetchedPatient.address?.country || ''}`,
        emergencyContact: fetchedPatient.emergencyContact?.name && fetchedPatient.emergencyContact?.phone
          ? `${fetchedPatient.emergencyContact.name} (${fetchedPatient.emergencyContact.relationship}) - ${fetchedPatient.emergencyContact.phone}`
          : 'N/A',
        medicalHistory: fetchedPatient.medicalHistory?.renalDiagnosis ||
          (fetchedPatient.medicalHistory?.medicalProblems?.length > 0
            ? fetchedPatient.medicalHistory.medicalProblems.join(', ')
            : 'N/A'),
        assignedDoctor: fetchedPatient.assignedDoctor?.name || 'N/A',
        registrationDate: new Date(fetchedPatient.registrationDate).toLocaleDateString(),
      })

    } catch (error: any) {
      toaster.negative('Failed to fetch the Patient data', { autoHideDuration: 3000 });
    }
  }

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        setLoading(true);
        await fetchPatientById(id);
        await fetchDialysisSessions(id);
        await fetchMonthlyInvestigations(id);
        setLoading(false);
      };
      loadData();
    }
  }, [id])

  if (loading) {
    return (
      <Block display="flex" justifyContent="center" alignItems="center" height="200px">
        <Block>Loading patient data...</Block>
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
                  Patient ID: {patient.id}
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
                  <Block font="font500">{patient.emergencyContact}</Block>
                </Block>
                <Block display="flex" justifyContent="space-between" marginBottom="8px">
                  <Block font="font400">Assigned Doctor:</Block>
                  <Block font="font500">{patient.assignedDoctor}</Block>
                </Block>
                <Block display="flex" justifyContent="space-between" marginBottom="8px">
                  <Block font="font400">Registration Date:</Block>
                  <Block font="font500">{patient.registrationDate}</Block>
                </Block>
              </Block>

              <Block marginTop="16px">
                <HeadingSmall marginTop="0" marginBottom="8px">
                  Address
                </HeadingSmall>
                <Block font="font400">{patient.address}</Block>
              </Block>

              <Block marginTop="16px">
                <HeadingSmall marginTop="0" marginBottom="8px">
                  Medical History
                </HeadingSmall>
                <Block font="font400">{patient.medicalHistory}</Block>
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
