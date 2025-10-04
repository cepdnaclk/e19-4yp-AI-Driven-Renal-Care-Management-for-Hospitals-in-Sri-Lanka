import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HeadingLarge, HeadingMedium, HeadingSmall } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Tabs, Tab } from 'baseui/tabs-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Patient, DialysisSession, MonthlyInvestigation, AIPrediction, ClinicalDecision } from '../../types';
import { fetchPatientById, fetchMonthlyInvestigations, fetchDialysisSessions, fetchHemoglobinTrend, fetchAIPrediction } from '../patients/PatientService';

// Mock clinical decisions - to be replaced with API integration later
const mockClinicalDecisions: Record<string, ClinicalDecision[]> = {
  '101': [
    {
      id: 'cd101',
      patientId: '101',
      date: '2025-05-15',
      notes: 'Patient showing signs of anemia. Hemoglobin trending downward.',
      prescription: 'Increase ESA dose to 100mcg weekly. Continue iron supplementation.',
      followUpDate: '2025-05-29',
      doctorId: '2',
      aiSuggestions: ['Consider ESA dose adjustment', 'Monitor iron levels closely'],
      aiSuggestionsAcknowledged: true,
      aiSuggestionsOverridden: false
    },
    {
      id: 'cd102',
      patientId: '101',
      date: '2025-04-15',
      notes: 'Patient reports increased fatigue. Lab values stable.',
      prescription: 'Continue current medications. Add multivitamin daily.',
      followUpDate: '2025-05-15',
      doctorId: '2',
      aiSuggestions: ['Consider sleep study', 'Evaluate for depression'],
      aiSuggestionsAcknowledged: true,
      aiSuggestionsOverridden: true,
      aiOverrideReason: 'Patient recently screened for depression with negative results. Sleep patterns normal per patient report.'
    }
  ]
};

const DoctorPatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | number>('0');
  const [dialysisSessions, setDialysisSessions] = useState<any[]>([]);
  const [dialysisSessionsLoading, setDialysisSessionsLoading] = useState<boolean>(false);
  const [dialysisSessionsError, setDialysisSessionsError] = useState<string | null>(null);
  const [monthlyInvestigations, setMonthlyInvestigations] = useState<any[]>([]);
  const [monthlyInvestigationsLoading, setMonthlyInvestigationsLoading] = useState<boolean>(false);
  const [monthlyInvestigationsError, setMonthlyInvestigationsError] = useState<string | null>(null);
  const [hemoglobinTrend, setHemoglobinTrend] = useState<any>(null);
  const [hemoglobinTrendLoading, setHemoglobinTrendLoading] = useState<boolean>(false);
  const [hemoglobinTrendError, setHemoglobinTrendError] = useState<string | null>(null);
  const [aiPredictions, setAIPredictions] = useState<any>(null);
  const [aiPredictionsLoading, setAIPredictionsLoading] = useState<boolean>(false);
  const [aiPredictionsError, setAIPredictionsError] = useState<string | null>(null);
  const [clinicalDecisions, setClinicalDecisions] = useState<ClinicalDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPatientData = async () => {
      if (id) {
        try {
          setLoading(true);
          setError(null);
          const patientData = await fetchPatientById(id);
          
          if (patientData) {
            setPatient(patientData);
            
            // For now, keep using mock data for clinical decisions
            // AI predictions will be loaded when the tab is clicked
            setClinicalDecisions(mockClinicalDecisions[id] || []);
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

  // Real API implementation for loading AI predictions
  const loadAIPredictions = async (patientId: string) => {
    try {
      setAIPredictionsLoading(true);
      setAIPredictionsError(null);
      
      // Get the latest monthly investigation data to use for AI prediction
      const investigations = await fetchMonthlyInvestigations(patientId);
      
      if (investigations && investigations.length > 0) {
        const latestInvestigation = investigations[0]; // Assuming the first is the latest
        
        // Prepare the prediction request data using the correct field names from the API
        const predictionData = {
          patient_id: patientId,
          albumin: latestInvestigation.albumin || 35.2, // Default fallback
          bu_post_hd: latestInvestigation.bu || 8.5, // BUN value (using same for both pre/post)
          bu_pre_hd: latestInvestigation.bu || 25.3, // BUN value
          s_ca: latestInvestigation.sCa || 2.3, // Serum Calcium
          scr_post_hd: latestInvestigation.scrPostHD || 450, // Serum Creatinine Post-HD
          scr_pre_hd: latestInvestigation.scrPreHD || 890, // Serum Creatinine Pre-HD
          serum_k_post_hd: latestInvestigation.serumKPostHD || 3.8, // Serum Potassium Post-HD
          serum_k_pre_hd: latestInvestigation.serumKPreHD || 5.2, // Serum Potassium Pre-HD
          serum_na_pre_hd: latestInvestigation.serumNaPreHD || 138, // Serum Sodium Pre-HD
          ua: latestInvestigation.ua || 400, // Uric Acid
          hb_diff: -0.5, // Default value - could be calculated from trend if available
          hb: latestInvestigation.hb || 9 // Hemoglobin
        };
        
        console.log('Sending AI prediction request with data:', predictionData);
        
        const prediction = await fetchAIPrediction(predictionData);
        setAIPredictions(prediction);
      } else {
        setAIPredictionsError('No investigation data available for AI prediction');
        setAIPredictions(null);
      }
    } catch (error: any) {
      console.error('Error loading AI predictions:', error);
      if (error.message?.includes('Authentication failed') || error.message?.includes('No authentication token')) {
        setAIPredictionsError('Authentication failed. Please log in again.');
      } else {
        setAIPredictionsError('Failed to load AI predictions. Please try again.');
      }
      setAIPredictions(null);
    } finally {
      setAIPredictionsLoading(false);
    }
  };

  // Real API implementation for loading dialysis sessions
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

  // Real API implementation for loading monthly investigations
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

  // Real API implementation for loading hemoglobin trend
  const loadHemoglobinTrend = async (patientId: string) => {
    try {
      setHemoglobinTrendLoading(true);
      setHemoglobinTrendError(null);
      const trendData = await fetchHemoglobinTrend(patientId);
      setHemoglobinTrend(trendData);
    } catch (error: any) {
      console.error('Error loading hemoglobin trend:', error);
      if (error.message?.includes('Authentication failed') || error.message?.includes('No authentication token')) {
        setHemoglobinTrendError('Authentication failed. Please log in again.');
      } else {
        setHemoglobinTrendError('Failed to load hemoglobin trend. Please try again.');
      }
      setHemoglobinTrend(null);
    } finally {
      setHemoglobinTrendLoading(false);
    }
  };

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
    return <Block>Patient not found</Block>;
  }

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

  const getAssignedDoctorName = (doctor: string | any): string => {
    if (typeof doctor === 'string') return doctor;
    if (doctor && typeof doctor === 'object') {
      return doctor.name;
    }
    return 'N/A';
  };

  // Prepare trend data for charts
  const weightTrendData = dialysisSessions
    .filter(session => session.preDialysis?.weight || session.postDialysis?.weight) // Only include sessions with weight data
    .map(session => ({
      date: session.date,
      preWeight: session.preDialysis?.weight || null,
      postWeight: session.postDialysis?.weight || null,
      ufGoal: session.dialysisParameters?.ufGoal || null
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const labTrendData = monthlyInvestigations
    .map(investigation => ({
      date: investigation.date,
      hemoglobin: investigation.hemoglobin,
      potassium: investigation.potassium,
      phosphorus: investigation.phosphorus,
      albumin: investigation.albumin,
      creatinine: investigation.creatinine
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
                <Block key={index} marginLeft="16px">
                  • {problem.problem} ({problem.status})
                </Block>
              ))}
            </Block>
          )}
        </Block>
      );
    }
    
    return 'No medical history available';
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
                  onClick={() => navigate(`/doctor/patients/${patient.id}/clinical-decisions`)}
                  overrides={{
                    BaseButton: {
                      style: {
                        width: '100%'
                      }
                    }
                  }}
                >
                  Record Clinical Decision
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
                    // Load AI predictions when AI Predictions tab (index 0) is clicked
                    if (activeKey === '0' && patient) {
                      // First ensure monthly investigations are loaded, then generate AI predictions
                      const loadAIWithInvestigations = async () => {
                        try {
                          if (monthlyInvestigations.length === 0 && !monthlyInvestigationsLoading) {
                            await loadMonthlyInvestigations(patient.patientId || patient.id);
                          }
                          // After investigations are loaded, generate AI predictions if not already done
                          if (!aiPredictions && !aiPredictionsError) {
                            loadAIPredictions(patient.patientId || patient.id);
                          }
                        } catch (error) {
                          console.error('Error loading data for AI predictions:', error);
                        }
                      };
                      
                      if (monthlyInvestigations.length === 0) {
                        loadAIWithInvestigations();
                      } else if (!aiPredictions && !aiPredictionsError) {
                        // Investigations already loaded, just generate AI predictions
                        loadAIPredictions(patient.patientId || patient.id);
                      }
                    }
                    // Load dialysis sessions when Latest Dialysis Session tab (index 1) is clicked
                    if (activeKey === '1' && patient && dialysisSessions.length === 0) {
                      loadDialysisSessions(patient.patientId || patient.id);
                    }
                    // Load monthly investigations when Monthly Investigation tab (index 2) is clicked
                    if (activeKey === '2' && patient && monthlyInvestigations.length === 0) {
                      loadMonthlyInvestigations(patient.patientId || patient.id);
                    }
                    // Load hemoglobin trend when Trend Analysis tab (index 3) is clicked
                    if (activeKey === '3' && patient && !hemoglobinTrend) {
                      loadHemoglobinTrend(patient.patientId || patient.id);
                    }
                  }
                }}
                activateOnFocus
              >
                <Tab title="AI Predictions">
                  <Block padding="16px">
                    <HeadingMedium marginTop="0">AI-Generated Hemoglobin Risk Prediction</HeadingMedium>
                    
                    {aiPredictionsLoading ? (
                      <Block display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Block>Loading AI predictions...</Block>
                      </Block>
                    ) : aiPredictionsError ? (
                      <Block display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Block color="negative">Error: {aiPredictionsError}</Block>
                      </Block>
                    ) : aiPredictions ? (
                      <Block>
                        {/* Risk Status Overview */}
                        <Block 
                          marginBottom="24px"
                          padding="16px"
                          backgroundColor={
                            aiPredictions.hb_risk_predicted
                              ? 'rgba(255, 0, 0, 0.1)'
                              : 'rgba(0, 255, 0, 0.1)'
                          }
                        >
                          <Block display="flex" justifyContent="space-between" alignItems="center" marginBottom="8px">
                            <HeadingSmall marginTop="0" marginBottom="0">
                              Hemoglobin Risk Assessment
                            </HeadingSmall>
                            <Block 
                              font="font600"
                              color={aiPredictions.hb_risk_predicted ? 'negative' : 'positive'}
                            >
                              {aiPredictions.risk_status}
                            </Block>
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Prediction:</strong> {aiPredictions.hb_risk_predicted ? 'Patient at risk' : 'Patient not at risk'}
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Hemoglobin Trend:</strong> {aiPredictions.hb_trend}
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Current Hemoglobin:</strong> {aiPredictions.current_hb} g/dL
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Target Range:</strong> {aiPredictions.target_hb_range.min} - {aiPredictions.target_hb_range.max} g/dL
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Risk Probability:</strong> {(aiPredictions.risk_probability * 100).toFixed(1)}%
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Confidence Score:</strong> {(aiPredictions.confidence_score * 100).toFixed(1)}%
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Prediction Date:</strong> {new Date(aiPredictions.prediction_date).toLocaleString()}
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Model Version:</strong> {aiPredictions.model_version}
                          </Block>
                        </Block>
                        
                        {/* Recommendations */}
                        {aiPredictions.recommendations && aiPredictions.recommendations.length > 0 && (
                          <Block 
                            marginBottom="24px"
                            padding="16px"
                            backgroundColor="rgba(255, 165, 0, 0.1)"
                          >
                            <HeadingSmall marginTop="0" marginBottom="12px">
                              Clinical Recommendations
                            </HeadingSmall>
                            
                            {aiPredictions.recommendations.map((recommendation: string, index: number) => (
                              <Block key={index} marginBottom="8px" marginLeft="8px">
                                • {recommendation}
                              </Block>
                            ))}
                            
                            <Block marginTop="16px" display="flex" style={{ gap: '8px' }}>
                              <Button 
                                size="compact"
                                onClick={() => {
                                  // Handle acknowledge action
                                  console.log('AI recommendations acknowledged');
                                }}
                              >
                                Acknowledge Recommendations
                              </Button>
                              <Button 
                                size="compact" 
                                kind="secondary"
                                onClick={() => navigate(`/doctor/patients/${patient.id}/clinical-decisions`)}
                              >
                                Record Clinical Decision
                              </Button>
                              <Button 
                                size="compact" 
                                kind="tertiary"
                                onClick={async () => {
                                  // Reload AI predictions with fresh investigation data
                                  if (patient) {
                                    // Always reload monthly investigations first to get the latest data
                                    await loadMonthlyInvestigations(patient.patientId || patient.id);
                                    loadAIPredictions(patient.patientId || patient.id);
                                  }
                                }}
                                isLoading={aiPredictionsLoading || monthlyInvestigationsLoading}
                              >
                                Refresh Prediction
                              </Button>
                            </Block>
                          </Block>
                        )}
                        
                        {/* Technical Details */}
                        <Block 
                          padding="16px"
                          backgroundColor="rgba(0, 0, 0, 0.03)"
                        >
                          <HeadingSmall marginTop="0" marginBottom="12px">
                            Technical Information
                          </HeadingSmall>
                          
                          <Block marginBottom="8px">
                            <strong>Patient ID:</strong> {aiPredictions.patient_id}
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Risk Classification:</strong> {
                              aiPredictions.risk_probability > 0.8 ? 'High Risk' :
                              aiPredictions.risk_probability > 0.6 ? 'Moderate Risk' :
                              aiPredictions.risk_probability > 0.4 ? 'Low Risk' : 'Very Low Risk'
                            }
                          </Block>
                          
                          <Block font="font300" marginTop="16px">
                            This prediction is based on the latest monthly investigation data and 
                            machine learning algorithms trained on historical patient data. 
                            Please use clinical judgment when interpreting these results.
                          </Block>
                        </Block>
                      </Block>
                    ) : (
                      <Block>
                        <Block marginBottom="16px">
                          No AI predictions available. Click the button below to generate a prediction 
                          based on the latest investigation data.
                        </Block>
                        <Button 
                          onClick={async () => {
                            if (patient) {
                              // First ensure monthly investigations are loaded
                              if (monthlyInvestigations.length === 0 && !monthlyInvestigationsLoading) {
                                await loadMonthlyInvestigations(patient.patientId || patient.id);
                              }
                              // Then generate AI predictions
                              loadAIPredictions(patient.patientId || patient.id);
                            }
                          }}
                          isLoading={aiPredictionsLoading || monthlyInvestigationsLoading}
                        >
                          Generate AI Prediction
                        </Button>
                      </Block>
                    )}
                  </Block>
                </Tab>
                
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
                          
                              {/* Session ID */}
                              {latestSession.id && (
                                <Block marginBottom="8px">
                                  <strong>Session ID:</strong> {latestSession.id}
                                </Block>
                              )}

                              {/* Session status */}
                              {latestSession.status && (
                                <Block marginBottom="8px">
                                  <strong>Status:</strong> {latestSession.status}
                                </Block>
                              )}

                              {/* Doctor information */}
                              {latestSession.doctor && (
                                <Block marginBottom="8px">
                                  <strong>Attending Doctor:</strong> {latestSession.doctor.name}
                                </Block>
                              )}

                              {/* Nurse information */}
                              {latestSession.nurse && (
                                <Block marginBottom="8px">
                                  <strong>Assigned Nurse:</strong> {latestSession.nurse.name}
                                </Block>
                              )}

                              {/* Session date and time */}
                              {latestSession.date && (
                                <Block marginBottom="8px">
                                  <strong>Date & Time:</strong> {new Date(latestSession.date).toLocaleString()}
                                </Block>
                              )}
                          
                              {/* Notes */}
                              {latestSession.notes && (
                                <Block marginBottom="8px">
                                  <strong>Notes:</strong> {latestSession.notes}
                                </Block>
                              )}

                              {/* Created and Updated timestamps */}
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
                
                <Tab title="Trend Analysis">
                  <Block padding="16px">
                    <HeadingMedium marginTop="0">Hemoglobin Trend Analysis</HeadingMedium>
                    
                    {hemoglobinTrendLoading ? (
                      <Block display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Block>Loading hemoglobin trend data...</Block>
                      </Block>
                    ) : hemoglobinTrendError ? (
                      <Block display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Block color="negative">Error: {hemoglobinTrendError}</Block>
                      </Block>
                    ) : hemoglobinTrend && hemoglobinTrend.trendData ? (
                      <Block>
                        {/* Statistics Summary */}
                        {hemoglobinTrend.statistics && (
                          <Block marginBottom="24px" padding="16px" backgroundColor="rgba(0, 0, 0, 0.03)">
                            <HeadingSmall marginTop="0" marginBottom="12px">
                              Hemoglobin Statistics
                            </HeadingSmall>
                            <Block display="flex" flexDirection="column" style={{ gap: '8px' }}>
                              <Block>
                                <strong>Average:</strong> {hemoglobinTrend.statistics.average?.toFixed(2)} g/dL
                              </Block>
                              <Block>
                                <strong>Min:</strong> {hemoglobinTrend.statistics.min?.toFixed(2)} g/dL
                              </Block>
                              <Block>
                                <strong>Max:</strong> {hemoglobinTrend.statistics.max?.toFixed(2)} g/dL
                              </Block>
                              <Block>
                                <strong>Trend:</strong> {hemoglobinTrend.statistics.trend}
                              </Block>
                              <Block>
                                <strong>Normal Range:</strong> {hemoglobinTrend.statistics.normalRange?.min}-{hemoglobinTrend.statistics.normalRange?.max} g/dL
                              </Block>
                            </Block>
                          </Block>
                        )}
                        
                        {/* Hemoglobin Trend Chart */}
                        <Block marginBottom="24px">
                          <HeadingSmall marginTop="0" marginBottom="16px">
                            Hemoglobin Levels Over Time
                          </HeadingSmall>
                          <ResponsiveContainer width="100%" height={400}>
                            <LineChart
                              data={hemoglobinTrend.trendData.map((item: any) => ({
                                ...item,
                                month: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                                normalMin: hemoglobinTrend.statistics?.normalRange?.min || 12,
                                normalMax: hemoglobinTrend.statistics?.normalRange?.max || 16
                              }))}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis 
                                domain={['dataMin - 1', 'dataMax + 1']} 
                                label={{ value: 'Hemoglobin (g/dL)', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip 
                                formatter={(value: any, name: string) => {
                                  if (name === 'hb') return [`${value?.toFixed(2)} g/dL`, 'Hemoglobin'];
                                  if (name === 'normalMin') return [`${value} g/dL`, 'Normal Range Min'];
                                  if (name === 'normalMax') return [`${value} g/dL`, 'Normal Range Max'];
                                  return [value, name];
                                }}
                                labelFormatter={(label) => `Month: ${label}`}
                              />
                              <Legend />
                              
                              {/* Normal range area */}
                              <Area 
                                type="monotone" 
                                dataKey="normalMax" 
                                stackId="normal"
                                stroke="rgba(0, 255, 0, 0.3)" 
                                fill="rgba(0, 255, 0, 0.1)" 
                                name="Normal Range"
                              />
                              <Area 
                                type="monotone" 
                                dataKey="normalMin" 
                                stackId="normal"
                                stroke="rgba(0, 255, 0, 0.3)" 
                                fill="rgba(255, 255, 255, 1)" 
                              />
                              
                              {/* Hemoglobin line */}
                              <Line 
                                type="monotone" 
                                dataKey="hb" 
                                stroke="#8884d8" 
                                strokeWidth={3}
                                dot={{ r: 6, strokeWidth: 2 }}
                                name="Hemoglobin Level"
                              />
                              
                              {/* Reference lines for normal range */}
                              <Line 
                                type="monotone" 
                                dataKey="normalMin" 
                                stroke="rgba(0, 255, 0, 0.6)" 
                                strokeDasharray="5 5"
                                dot={false}
                                name="Normal Min (12 g/dL)"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="normalMax" 
                                stroke="rgba(0, 255, 0, 0.6)" 
                                strokeDasharray="5 5"
                                dot={false}
                                name="Normal Max (16 g/dL)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Block>
                        
                        {/* Data Table */}
                        <Block>
                          <HeadingSmall marginTop="0" marginBottom="16px">
                            Detailed Data Points
                          </HeadingSmall>
                          <Block>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
                                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Date</th>
                                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Hemoglobin (g/dL)</th>
                                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {hemoglobinTrend.trendData.map((item: any, index: number) => (
                                  <tr key={index}>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                      {new Date(item.date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                      {item.hb?.toFixed(2)}
                                    </td>
                                    <td style={{ 
                                      padding: '12px', 
                                      border: '1px solid #ddd',
                                      color: item.status === 'low' ? '#d93025' : item.status === 'normal' ? '#0f9d58' : '#ff9800'
                                    }}>
                                      {item.status}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </Block>
                        </Block>
                      </Block>
                    ) : (
                      <Block>No hemoglobin trend data available</Block>
                    )}
                  </Block>
                </Tab>
                
                <Tab title="Clinical Decisions">
                  <Block padding="16px">
                    <Block display="flex" justifyContent="space-between" alignItems="center" marginBottom="16px">
                      <HeadingMedium marginTop="0" marginBottom="0">
                        Clinical Decisions
                      </HeadingMedium>
                      <Button 
                        onClick={() => navigate(`/doctor/patients/${patient.id}/clinical-decisions`)}
                      >
                        New Decision
                      </Button>
                    </Block>
                    
                    {clinicalDecisions.length > 0 ? (
                      clinicalDecisions.map(decision => (
                        <Block 
                          key={decision.id}
                          marginBottom="16px"
                          padding="16px"
                          backgroundColor="rgba(0, 0, 0, 0.03)"
                        >
                          <Block display="flex" justifyContent="space-between" marginBottom="8px">
                            <HeadingSmall marginTop="0" marginBottom="0">
                              Decision on {decision.date}
                            </HeadingSmall>
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Notes:</strong> {decision.notes}
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Prescription:</strong> {decision.prescription}
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Follow-up Date:</strong> {decision.followUpDate}
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>AI Suggestions:</strong> {decision.aiSuggestions.join(', ')}
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>AI Suggestions {decision.aiSuggestionsAcknowledged ? 'Acknowledged' : 'Not Acknowledged'}</strong>
                          </Block>
                          
                          {decision.aiSuggestionsOverridden && (
                            <Block marginBottom="8px">
                              <strong>AI Suggestions Overridden:</strong> {decision.aiOverrideReason}
                            </Block>
                          )}
                        </Block>
                      ))
                    ) : (
                      <Block padding="16px" backgroundColor="rgba(0, 0, 0, 0.03)">
                        <Block display="flex" justifyContent="center" color="contentTertiary">
                          No clinical decisions recorded for this patient.
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

export default DoctorPatientProfile;