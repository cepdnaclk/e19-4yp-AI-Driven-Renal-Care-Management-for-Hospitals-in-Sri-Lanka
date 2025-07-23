import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HeadingLarge, HeadingMedium, HeadingSmall } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Tabs, Tab } from 'baseui/tabs-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Patient, DialysisSession, MonthlyInvestigation, AIPrediction, ClinicalDecision } from '../../types';

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
      patientId: '101',
      date: '2025-05-29',
      startTime: '09:00',
      endTime: '13:00',
      preWeight: 82.5,
      postWeight: 80.1,
      ufGoal: 2.5,
      bloodPressurePre: '140/90',
      bloodPressurePost: '130/85',
      heartRatePre: 78,
      heartRatePost: 72,
      temperaturePre: 36.8,
      temperaturePost: 36.6,
      symptoms: ['Fatigue', 'Mild headache'],
      complications: [],
      notes: 'Patient tolerated session well.',
      nurseId: '1'
    },
    {
      id: 'ds102',
      patientId: '101',
      date: '2025-05-26',
      startTime: '09:00',
      endTime: '13:00',
      preWeight: 83.2,
      postWeight: 80.5,
      ufGoal: 2.7,
      bloodPressurePre: '145/92',
      bloodPressurePost: '135/88',
      heartRatePre: 80,
      heartRatePost: 74,
      temperaturePre: 36.7,
      temperaturePost: 36.5,
      symptoms: ['Fatigue'],
      complications: [],
      notes: 'No complications during session.',
      nurseId: '1'
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

// Mock AI predictions
const mockAIPredictions: Record<string, AIPrediction[]> = {
  '101': [
    {
      id: 'ai101',
      patientId: '101',
      date: '2025-05-30',
      predictionType: 'Anemia Risk',
      prediction: 'High risk of developing anemia in the next 30 days',
      confidence: 0.85,
      suggestedAction: 'Consider ESA dose adjustment and iron supplementation',
      dataPoints: [
        { parameter: 'Hemoglobin', value: 11.2, trend: 'decreasing' },
        { parameter: 'Hematocrit', value: 33.6, trend: 'decreasing' },
        { parameter: 'Iron Saturation', value: 18, trend: 'decreasing' }
      ]
    },
    {
      id: 'ai102',
      patientId: '101',
      date: '2025-05-30',
      predictionType: 'Fluid Overload Risk',
      prediction: 'Moderate risk of fluid overload before next session',
      confidence: 0.72,
      suggestedAction: 'Consider sodium restriction and fluid intake counseling',
      dataPoints: [
        { parameter: 'Interdialytic Weight Gain', value: 3.1, trend: 'increasing' },
        { parameter: 'Blood Pressure', value: '145/92', trend: 'increasing' },
        { parameter: 'Reported Edema', value: 'mild', trend: 'stable' }
      ]
    }
  ]
};

// Mock clinical decisions
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
    if (id) {
      // In a real app, these would be API calls
      setPatient(mockPatients[id] || null);
      setDialysisSessions(mockDialysisSessions[id] || []);
      setMonthlyInvestigations(mockMonthlyInvestigations[id] || []);
      setAIPredictions(mockAIPredictions[id] || []);
      setClinicalDecisions(mockClinicalDecisions[id] || []);
    }
  }, [id]);

  if (!patient) {
    return <Block>Patient not found</Block>;
  }

  // Prepare trend data for charts
  const weightTrendData = dialysisSessions
    .map(session => ({
      date: session.date,
      preWeight: session.preDialysis.weight,
      postWeight: session.postDialysis.weight,
      ufGoal: session.dialysisParameters.ufGoal
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
                    if (activeKey === '0' && patient && !aiPredictions) {
                      loadAIPredictions(patient.patientId || patient.id);
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
                                onClick={() => {
                                  // Reload AI predictions
                                  if (patient) {
                                    loadAIPredictions(patient.patientId || patient.id);
                                  }
                                }}
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
                          onClick={() => {
                            if (patient) {
                              loadAIPredictions(patient.patientId || patient.id);
                            }
                          }}
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
                          // Get the latest session (last item in the array)
                          const latestSession = dialysisSessions[dialysisSessions.length - 1];
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
                                {/* <Block>
                                  {latestSession.startTime ? `${latestSession.startTime} - ${latestSession.endTime || 'Ongoing'}` : 'Time not specified'}
                                </Block> */}
                              </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Weight:</strong> Pre: {dialysisSessions[0].preWeight} kg, Post: {dialysisSessions[0].postWeight} kg (UF Goal: {dialysisSessions[0].ufGoal} L)
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Vitals:</strong> BP Pre: {dialysisSessions[0].bloodPressurePre}, BP Post: {dialysisSessions[0].bloodPressurePost}, 
                            HR Pre: {dialysisSessions[0].heartRatePre}, HR Post: {dialysisSessions[0].heartRatePost}
                          </Block>
                          
                          {dialysisSessions[0].symptoms.length > 0 && (
                            <Block marginBottom="8px">
                              <strong>Symptoms:</strong> {dialysisSessions[0].symptoms.join(', ')}
                            </Block>
                          )}
                          
                          {dialysisSessions[0].complications.length > 0 && (
                            <Block marginBottom="8px">
                              <strong>Complications:</strong> {dialysisSessions[0].complications.join(', ')}
                            </Block>
                          )}
                          
                          {dialysisSessions[0].notes && (
                            <Block marginBottom="8px">
                              <strong>Notes:</strong> {dialysisSessions[0].notes}
                            </Block>
                          )}
                        </Block>
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