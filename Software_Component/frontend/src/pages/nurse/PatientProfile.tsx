import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HeadingLarge, HeadingMedium, HeadingSmall } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Tabs, Tab } from 'baseui/tabs-motion';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../../types';
import { fetchPatientById, fetchMonthlyInvestigations, fetchDialysisSessions } from '../patients/PatientService';

const NursePatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeKey, setActiveKey] = useState<string | number>('0');
  const navigate = useNavigate();

  // Monthly Investigations state
  const [monthlyInvestigations, setMonthlyInvestigations] = useState<any[]>([]);
  const [monthlyInvestigationsLoading, setMonthlyInvestigationsLoading] = useState<boolean>(false);
  const [monthlyInvestigationsError, setMonthlyInvestigationsError] = useState<string | null>(null);

  // Dialysis Sessions state  
  const [dialysisSessions, setDialysisSessions] = useState<any[]>([]);
  const [dialysisSessionsLoading, setDialysisSessionsLoading] = useState<boolean>(false);
  const [dialysisSessionsError, setDialysisSessionsError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPatientData();
    }
  }, [id]);

  const loadPatientData = async () => {
    if (!id) return;
    
    try {
      const patientData = await fetchPatientById("RHD_THP_003");
      setPatient(patientData);
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  // Load monthly investigations
  const loadMonthlyInvestigations = async (patientId: string) => {
    try {
      setMonthlyInvestigationsLoading(true);
      setMonthlyInvestigationsError(null);
      const investigations = await fetchMonthlyInvestigations(patientId);
      setMonthlyInvestigations(investigations);
    } catch (error: any) {
      console.error('Error loading monthly investigations:', error);
      if (error.message?.includes('Authentication failed') || error.message?.includes('No authentication token')) {
        setMonthlyInvestigationsError('Authentication failed. Please log in again.');
      } else {
        setMonthlyInvestigationsError('Failed to load monthly investigations. Please try again.');
      }
      setMonthlyInvestigations([]);
    } finally {
      setMonthlyInvestigationsLoading(false);
    }
  };

  // Load dialysis sessions
  const loadDialysisSessions = async (patientId: string) => {
    try {
      setDialysisSessionsLoading(true);
      setDialysisSessionsError(null);
      const sessions = await fetchDialysisSessions(patientId);
      setDialysisSessions(sessions);
    } catch (error: any) {
      console.error('Error loading dialysis sessions:', error);
      if (error.message?.includes('Authentication failed') || error.message?.includes('No authentication token')) {
        setDialysisSessionsError('Authentication failed. Please log in again.');
      } else {
        setDialysisSessionsError('Failed to load dialysis sessions. Please try again.');
      }
      setDialysisSessions([]);
    } finally {
      setDialysisSessionsLoading(false);
    }
  };

  function getFormattedMedicalHistory(medicalHistory: string | { renalDiagnosis: string; medicalProblems: Array<{ problem: string; diagnosedDate: string; status: string; }>; allergies: any[]; medications: any[]; }): React.ReactNode {
    if (typeof medicalHistory === 'string') {
      return medicalHistory;
    }
    
    if (medicalHistory && typeof medicalHistory === 'object') {
      return (
        <Block>
          {medicalHistory.renalDiagnosis && (
            <Block marginBottom="8px">
              <strong>Renal Diagnosis:</strong> {medicalHistory.renalDiagnosis}
            </Block>
          )}
          
          {medicalHistory.medicalProblems && medicalHistory.medicalProblems.length > 0 && (
            <Block marginBottom="8px">
              <strong>Medical Problems:</strong>
              {medicalHistory.medicalProblems.map((problem, index) => (
                <Block key={index} marginLeft="16px" marginTop="4px">
                  • {problem.problem} (Diagnosed: {problem.diagnosedDate}, Status: {problem.status})
                </Block>
              ))}
            </Block>
          )}
          
          {medicalHistory.allergies && medicalHistory.allergies.length > 0 && (
            <Block marginBottom="8px">
              <strong>Allergies:</strong> {medicalHistory.allergies.join(', ')}
            </Block>
          )}
          
          {medicalHistory.medications && medicalHistory.medications.length > 0 && (
            <Block marginBottom="8px">
              <strong>Current Medications:</strong>
              {medicalHistory.medications.map((medication: any, index: number) => (
                <Block key={index} marginLeft="16px" marginTop="4px">
                  • {medication.name} - {medication.dosage} ({medication.frequency})
                </Block>
              ))}
            </Block>
          )}
        </Block>
      );
    }
    
    return 'No medical history available';
  }

  function getFormattedAddress(address: string | { street: string; city: string; state: string; zipCode: string; country: string; }): string {
    if (typeof address === 'string') {
      return address;
    }
    
    if (address && typeof address === 'object') {
      return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
    }
    
    return 'No address available';
  }

  function getFormattedEmergencyContact(emergencyContact: string | { name: string; relationship: string; phone: string; }): string {
    if (typeof emergencyContact === 'string') {
      return emergencyContact;
    }
    
    if (emergencyContact && typeof emergencyContact === 'object') {
      return `${emergencyContact.name} (${emergencyContact.relationship}) - ${emergencyContact.phone}`;
    }
    
    return 'No emergency contact available';
  }

  if (!patient) {
    return (
      <Block>
        <HeadingLarge>Loading Patient Profile...</HeadingLarge>
      </Block>
    );
  }

  return (
    <Block>
      <HeadingLarge>Patient Profile</HeadingLarge>
      
      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
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
                  overrides={{
                    Block: {
                      style: {
                        borderRadius: '50%'
                      }
                    }
                  }}
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
                  <Block font="font500">
                    {typeof patient.assignedDoctor === 'string' ? 
                      patient.assignedDoctor : 
                      patient.assignedDoctor?.name || 'Not assigned'}
                  </Block>
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

              {patient.dialysisInfo && (
                <Block marginTop="16px">
                  <HeadingSmall marginTop="0" marginBottom="8px">
                    Dialysis Information
                  </HeadingSmall>
                  <Block font="font400" marginBottom="4px">
                    Type: {patient.dialysisInfo.dialysisType}
                  </Block>
                  <Block font="font400" marginBottom="4px">
                    Frequency: {patient.dialysisInfo.frequency.replace('_', ' ')}
                  </Block>
                  <Block font="font400" marginBottom="4px">
                    Access: {patient.dialysisInfo.accessType} ({patient.dialysisInfo.accessSite})
                  </Block>
                  <Block font="font400" marginBottom="4px">
                    Dry Weight: {patient.dialysisInfo.dryWeight} kg
                  </Block>
                  <Block font="font400">
                    Target UFR: {patient.dialysisInfo.targetUfr} ml/hr
                  </Block>
                </Block>
              )}

              <Block marginTop="24px">
                <Button 
                  onClick={() => navigate('/nurse/patients')}
                  overrides={{
                    BaseButton: {
                      style: {
                        width: '100%'
                      }
                    }
                  }}
                >
                  Back to Patients
                </Button>
              </Block>
            </StyledBody>
          </Card>
        </Cell>

        <Cell span={[4, 8, 8]}>
          <Card>
            <StyledBody>
              <Tabs
                activeKey={activeKey}
                onChange={({ activeKey }) => {
                  if (typeof activeKey === 'string' || typeof activeKey === 'number') {
                    setActiveKey(activeKey);
                    // Load dialysis sessions when Latest Dialysis Session tab (index 0) is clicked
                    if (activeKey === '0' && patient && dialysisSessions.length === 0) {
                      loadDialysisSessions(patient.patientId || patient.id);
                    }
                    // Load monthly investigations when Monthly Investigation tab (index 1) is clicked
                    if (activeKey === '1' && patient && monthlyInvestigations.length === 0) {
                      loadMonthlyInvestigations(patient.patientId || patient.id);
                    }
                  }
                }}
                activateOnFocus
              >
                <Tab title="Latest Dialysis Session">
                  <Block padding="16px">
                    <HeadingMedium marginTop="0">Latest Dialysis Session</HeadingMedium>
                    
                    {dialysisSessionsLoading ? (
                      <Block display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Block>Loading dialysis sessions...</Block>
                      </Block>
                    ) : dialysisSessionsError ? (
                      <Block display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Block color="negative">Error: {dialysisSessionsError}</Block>
                      </Block>
                    ) : dialysisSessions.length > 0 ? (
                      <Block>
                        {(() => {
                          // Get the latest session (first item in the array since API returns newest first)
                          const latestSession = dialysisSessions[0];
                          return (
                            <Block 
                              marginBottom="16px"
                              padding="16px"
                              backgroundColor="rgba(0, 0, 0, 0.03)"
                            >
                              <Block display="flex" justifyContent="space-between" marginBottom="8px">
                                <HeadingSmall marginTop="0" marginBottom="0">
                                  Session on {new Date(latestSession.date).toLocaleDateString()}
                                </HeadingSmall>
                                <Block>
                                  Session #{latestSession.sessionId}
                                </Block>
                              </Block>
                          
                              {latestSession.id && (
                                <Block marginBottom="8px">
                                  <strong>Session ID:</strong> {latestSession.id}
                                </Block>
                              )}

                              {latestSession.status && (
                                <Block marginBottom="8px">
                                  <strong>Status:</strong> {latestSession.status}
                                </Block>
                              )}

                              {latestSession.doctor && (
                                <Block marginBottom="8px">
                                  <strong>Attending Doctor:</strong> {latestSession.doctor.name}
                                </Block>
                              )}

                              {latestSession.nurse && (
                                <Block marginBottom="8px">
                                  <strong>Assigned Nurse:</strong> {latestSession.nurse.name}
                                </Block>
                              )}

                              {latestSession.date && (
                                <Block marginBottom="8px">
                                  <strong>Date & Time:</strong> {new Date(latestSession.date).toLocaleString()}
                                </Block>
                              )}
                          
                              {latestSession.notes && (
                                <Block marginBottom="8px">
                                  <strong>Notes:</strong> {latestSession.notes}
                                </Block>
                              )}

                              {latestSession.createdAt && (
                                <Block marginBottom="8px">
                                  <strong>Record Created:</strong> {new Date(latestSession.createdAt).toLocaleString()}
                                </Block>
                              )}

                              {latestSession.updatedAt && latestSession.updatedAt !== latestSession.createdAt && (
                                <Block marginBottom="8px">
                                  <strong>Last Updated:</strong> {new Date(latestSession.updatedAt).toLocaleString()}
                                </Block>
                              )}
                            </Block>
                          );
                        })()}
                      </Block>
                    ) : (
                      <Block padding="16px" backgroundColor="rgba(0, 0, 0, 0.03)">
                        <Block display="flex" justifyContent="center" color="contentTertiary">
                          No dialysis sessions recorded for this patient.
                        </Block>
                      </Block>
                    )}
                  </Block>
                </Tab>
                
                <Tab title="Monthly Investigation">
                  <Block padding="16px">
                    <HeadingMedium marginTop="0">Latest Monthly Investigation</HeadingMedium>
                    
                    {monthlyInvestigationsLoading ? (
                      <Block display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Block>Loading monthly investigations...</Block>
                      </Block>
                    ) : monthlyInvestigationsError ? (
                      <Block display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Block color="negative">Error: {monthlyInvestigationsError}</Block>
                      </Block>
                    ) : monthlyInvestigations.length > 0 ? (
                      <Block>
                        {(() => {
                          // Get the latest investigation (first item in the array since API returns newest first)
                          const latestInvestigation = monthlyInvestigations[0];
                          return (
                            <Block 
                              marginBottom="16px"
                              padding="16px"
                              backgroundColor="rgba(0, 0, 0, 0.03)"
                            >
                              <Block display="flex" justifyContent="space-between" marginBottom="8px">
                                <HeadingSmall marginTop="0" marginBottom="0">
                                  Investigation on {new Date(latestInvestigation.date).toLocaleDateString()}
                                </HeadingSmall>
                                <Block>ID: {latestInvestigation.investigationId}</Block>
                              </Block>
                              
                              <Block marginBottom="8px">
                                <strong>Renal Function:</strong> 
                                Creatinine Pre-HD: {latestInvestigation.scrPreHD?.toFixed(2)} mg/dL, 
                                Creatinine Post-HD: {latestInvestigation.scrPostHD?.toFixed(2)} mg/dL, 
                                BUN: {latestInvestigation.bu?.toFixed(2)} mg/dL
                              </Block>
                              
                              <Block marginBottom="8px">
                                <strong>CBC:</strong> 
                                Hemoglobin: {latestInvestigation.hb?.toFixed(2)} g/dL
                              </Block>
                              
                              <Block marginBottom="8px">
                                <strong>Electrolytes:</strong> 
                                Sodium Pre-HD: {latestInvestigation.serumNaPreHD?.toFixed(2)} mEq/L, 
                                Sodium Post-HD: {latestInvestigation.serumNaPostHD?.toFixed(2)} mEq/L, 
                                Potassium Pre-HD: {latestInvestigation.serumKPreHD?.toFixed(2)} mEq/L, 
                                Potassium Post-HD: {latestInvestigation.serumKPostHD?.toFixed(2)} mEq/L
                              </Block>
                              
                              <Block marginBottom="8px">
                                <strong>Bone & Mineral:</strong> 
                                Calcium: {latestInvestigation.sCa?.toFixed(2)} mg/dL, 
                                Phosphorus: {latestInvestigation.sPhosphate?.toFixed(2)} mg/dL, 
                                PTH: {latestInvestigation.pth?.toFixed(2)} pg/mL, 
                                Vitamin D: {latestInvestigation.vitD?.toFixed(2)} ng/mL
                              </Block>
                              
                              <Block marginBottom="8px">
                                <strong>Protein & Nutrition:</strong> 
                                Albumin: {latestInvestigation.albumin?.toFixed(2)} g/dL, 
                                Uric Acid: {latestInvestigation.ua?.toFixed(2)} mg/dL
                              </Block>
                              
                              <Block marginBottom="8px">
                                <strong>Iron Studies:</strong> 
                                Serum Iron: {latestInvestigation.serumIron?.toFixed(2)} μg/dL, 
                                Serum Ferritin: {latestInvestigation.serumFerritin?.toFixed(2)} ng/mL
                              </Block>
                              
                              <Block marginBottom="8px">
                                <strong>Other:</strong> 
                                HbA1C: {latestInvestigation.hbA1C?.toFixed(2)}%, 
                                Bicarbonate: {latestInvestigation.hco?.toFixed(2)} mEq/L, 
                                Alkaline Phosphatase: {latestInvestigation.al?.toFixed(2)} U/L
                              </Block>
                              
                              <Block marginBottom="8px">
                                <strong>Laboratory Info:</strong>
                                <Block marginLeft="16px" marginTop="4px">
                                  Requested by: {latestInvestigation.laboratoryInfo?.requestedBy?.name || 'N/A'}
                                </Block>
                                <Block marginLeft="16px">
                                  Performed by: {latestInvestigation.laboratoryInfo?.performedBy?.name || 'N/A'}
                                </Block>
                                <Block marginLeft="16px">
                                  Reported by: {latestInvestigation.laboratoryInfo?.reportedBy?.name || 'N/A'}
                                </Block>
                                <Block marginLeft="16px">
                                  Testing Method: {latestInvestigation.laboratoryInfo?.testingMethod || 'N/A'}
                                </Block>
                              </Block>
                              
                              <Block marginBottom="8px">
                                <strong>Status:</strong> {latestInvestigation.status}
                              </Block>
                              
                              {latestInvestigation.notes && (
                                <Block marginBottom="8px">
                                  <strong>Notes:</strong> {latestInvestigation.notes}
                                </Block>
                                )}
                              
                              <Block marginTop="16px" font="font300">
                                Total investigations available: {monthlyInvestigations.length}
                              </Block>
                            </Block>
                          );
                        })()}
                      </Block>
                    ) : (
                      <Block padding="16px" backgroundColor="rgba(0, 0, 0, 0.03)">
                        <Block display="flex" justifyContent="center" color="contentTertiary">
                          No monthly investigations recorded for this patient.
                        </Block>
                      </Block>
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
