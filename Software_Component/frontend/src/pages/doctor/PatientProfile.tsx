import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HeadingLarge, HeadingMedium, HeadingSmall, ParagraphMedium } from 'baseui/typography';
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
  const [activeKey, setActiveKey] = useState<string | number>('0');
  const [dialysisSessions, setDialysisSessions] = useState<DialysisSession[]>([]);
  const [monthlyInvestigations, setMonthlyInvestigations] = useState<MonthlyInvestigation[]>([]);
  const [aiPredictions, setAIPredictions] = useState<AIPrediction[]>([]);
  const [clinicalDecisions, setClinicalDecisions] = useState<ClinicalDecision[]>([]);
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
      preWeight: session.preWeight,
      postWeight: session.postWeight,
      ufGoal: session.ufGoal
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
                  ID: {patient.id}
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

              <Block marginTop="24px">
                <Button 
                  onClick={() => navigate(`/doctor/patients/${id}/clinical-decisions`)}
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
                  }
                }}
                activateOnFocus
              >
                <Tab title="AI Predictions">
                  <Block padding="16px">
                    <HeadingMedium marginTop="0">AI-Generated Predictions</HeadingMedium>
                    
                    {aiPredictions.length > 0 ? (
                      aiPredictions.map(prediction => (
                        <Block 
                          key={prediction.id}
                          marginBottom="24px"
                          padding="16px"
                          backgroundColor={
                            prediction.confidence > 0.8
                              ? 'rgba(255, 0, 0, 0.1)'
                              : prediction.confidence > 0.6
                              ? 'rgba(255, 165, 0, 0.1)'
                              : 'rgba(0, 0, 0, 0.03)'
                          }
                        >
                          <Block display="flex" justifyContent="space-between" alignItems="center">
                            <HeadingSmall marginTop="0" marginBottom="8px">
                              {prediction.predictionType}
                            </HeadingSmall>
                            <Block font="font500">
                              Confidence: {(prediction.confidence * 100).toFixed(0)}%
                            </Block>
                          </Block>
                          
                          <Block font="font500" marginBottom="8px">
                            {prediction.prediction}
                          </Block>
                          
                          <Block marginBottom="16px">
                            <strong>Suggested Action:</strong> {prediction.suggestedAction}
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Based on:</strong>
                          </Block>
                          
                          {prediction.dataPoints.map((point, index) => (
                            <Block key={index} marginBottom="4px" marginLeft="16px">
                              • {point.parameter}: {point.value} ({point.trend})
                            </Block>
                          ))}
                          
                          <Block marginTop="16px" display="flex">
                            <Button size="compact">Acknowledge</Button>
                            <Button size="compact" kind="secondary">Override</Button>
                          </Block>
                        </Block>
                      ))
                    ) : (
                      <Block>No AI predictions available</Block>
                    )}
                  </Block>
                </Tab>
                
                <Tab title="Latest Dialysis Session">
                  <Block padding="16px">
                    <HeadingMedium marginTop="0">Latest Dialysis Session</HeadingMedium>
                    
                    {dialysisSessions.length > 0 ? (
                      <Block>
                        <Block 
                          marginBottom="16px"
                          padding="16px"
                          backgroundColor="rgba(0, 0, 0, 0.03)"
                        >
                          <Block display="flex" justifyContent="space-between" marginBottom="8px">
                            <HeadingSmall marginTop="0" marginBottom="0">
                              Session on {dialysisSessions[0].date}
                            </HeadingSmall>
                            <Block>{dialysisSessions[0].startTime} - {dialysisSessions[0].endTime}</Block>
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
                      <Block>No dialysis sessions recorded</Block>
                    )}
                  </Block>
                </Tab>
                
                <Tab title="Monthly Investigation">
                  <Block padding="16px">
                    <HeadingMedium marginTop="0">Latest Monthly Investigation</HeadingMedium>
                    
                    {monthlyInvestigations.length > 0 ? (
                      <Block>
                        <Block 
                          marginBottom="16px"
                          padding="16px"
                          backgroundColor="rgba(0, 0, 0, 0.03)"
                        >
                          <Block display="flex" justifyContent="space-between" marginBottom="8px">
                            <HeadingSmall marginTop="0" marginBottom="0">
                              Investigation on {monthlyInvestigations[0].date}
                            </HeadingSmall>
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>CBC:</strong> Hemoglobin: {monthlyInvestigations[0].hemoglobin} g/dL, 
                            Hematocrit: {monthlyInvestigations[0].hematocrit}%, 
                            WBC: {monthlyInvestigations[0].whiteBloodCellCount} K/μL, 
                            Platelets: {monthlyInvestigations[0].plateletCount} K/μL
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Electrolytes:</strong> Sodium: {monthlyInvestigations[0].sodium} mEq/L, 
                            Potassium: {monthlyInvestigations[0].potassium} mEq/L, 
                            Chloride: {monthlyInvestigations[0].chloride} mEq/L, 
                            Bicarbonate: {monthlyInvestigations[0].bicarbonate} mEq/L
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Renal Function:</strong> BUN: {monthlyInvestigations[0].bun} mg/dL, 
                            Creatinine: {monthlyInvestigations[0].creatinine} mg/dL, 
                            Glucose: {monthlyInvestigations[0].glucose} mg/dL
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Other:</strong> Calcium: {monthlyInvestigations[0].calcium} mg/dL, 
                            Phosphorus: {monthlyInvestigations[0].phosphorus} mg/dL, 
                            Albumin: {monthlyInvestigations[0].albumin} g/dL, 
                            Total Protein: {monthlyInvestigations[0].totalProtein} g/dL
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Liver Function:</strong> ALT: {monthlyInvestigations[0].alt} U/L, 
                            AST: {monthlyInvestigations[0].ast} U/L, 
                            Alkaline Phosphatase: {monthlyInvestigations[0].alkalinePhosphatase} U/L
                          </Block>
                          
                          {monthlyInvestigations[0].notes && (
                            <Block marginBottom="8px">
                              <strong>Notes:</strong> {monthlyInvestigations[0].notes}
                            </Block>
                          )}
                        </Block>
                      </Block>
                    ) : (
                      <Block>No monthly investigations recorded</Block>
                    )}
                  </Block>
                </Tab>
                
                <Tab title="Trend Analysis">
                  <Block padding="16px">
                    <HeadingMedium marginTop="0">Trend Analysis</HeadingMedium>
                    
                    <Block marginBottom="24px">
                      <HeadingSmall marginTop="0" marginBottom="16px">
                        Weight Trends
                      </HeadingSmall>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart
                          data={weightTrendData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="preWeight" 
                            name="Pre-Dialysis Weight" 
                            stroke="#8884d8" 
                            fill="#8884d8" 
                            fillOpacity={0.3} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="postWeight" 
                            name="Post-Dialysis Weight" 
                            stroke="#82ca9d" 
                            fill="#82ca9d" 
                            fillOpacity={0.3} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Block>
                    
                    <Block>
                      <HeadingSmall marginTop="0" marginBottom="16px">
                        Laboratory Parameter Trends
                      </HeadingSmall>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart
                          data={labTrendData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="hemoglobin" 
                            name="Hemoglobin" 
                            stroke="#8884d8" 
                            fill="#8884d8" 
                            fillOpacity={0.3} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="potassium" 
                            name="Potassium" 
                            stroke="#82ca9d" 
                            fill="#82ca9d" 
                            fillOpacity={0.3} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="phosphorus" 
                            name="Phosphorus" 
                            stroke="#ffc658" 
                            fill="#ffc658" 
                            fillOpacity={0.3} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Block>
                  </Block>
                </Tab>
                
                <Tab title="Clinical Decisions">
                  <Block padding="16px">
                    <Block display="flex" justifyContent="space-between" alignItems="center" marginBottom="16px">
                      <HeadingMedium marginTop="0" marginBottom="0">
                        Clinical Decisions
                      </HeadingMedium>
                      <Button 
                        onClick={() => navigate(`/doctor/patients/${id}/clinical-decisions`)}
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
                      <Block>No clinical decisions recorded</Block>
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