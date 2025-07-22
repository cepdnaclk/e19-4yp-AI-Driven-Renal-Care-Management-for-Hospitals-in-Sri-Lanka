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
import axios from 'axios';

// Mock AI predictions (until backend is ready)
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

// Mock clinical decisions (until backend is ready)
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchPatientData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/patients/${id}`);
      setPatient(response.data);
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError('Failed to fetch patient data');
    }
  };

  const fetchDialysisSessions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/dialysis-sessions/${id}`);
      setDialysisSessions(response.data);
    } catch (err) {
      console.error('Error fetching dialysis sessions:', err);
      setError('Failed to fetch dialysis sessions');
    }
  };

  const fetchMonthlyInvestigations = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/monthly-investigations/${id}`);
      setMonthlyInvestigations(response.data);
    } catch (err) {
      console.error('Error fetching monthly investigations:', err);
      setError('Failed to fetch monthly investigations');
    }
  };

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setLoading(true);
        await Promise.all([
          fetchPatientData(),
          fetchDialysisSessions(),
          fetchMonthlyInvestigations()
        ]);
        
        // Set mock data for AI predictions and clinical decisions (until backend is ready)
        setAIPredictions(mockAIPredictions[id] || []);
        setClinicalDecisions(mockClinicalDecisions[id] || []);
        
        setLoading(false);
      };
      
      fetchData();
    }
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
        <Block color="negative">Error: {error}</Block>
      </Block>
    );
  }

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
                            <strong>Weight:</strong> Pre: {dialysisSessions[0].preDialysis.weight} kg, Post: {dialysisSessions[0].postDialysis.weight} kg (UF Goal: {dialysisSessions[0].dialysisParameters.ufGoal} L)
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Vitals:</strong> BP Pre: {dialysisSessions[0].preDialysis.bloodPressure.systolic}/{dialysisSessions[0].preDialysis.bloodPressure.diastolic}, BP Post: {dialysisSessions[0].postDialysis.bloodPressure.systolic}/{dialysisSessions[0].postDialysis.bloodPressure.diastolic}, 
                            HR Pre: {dialysisSessions[0].preDialysis.heartRate}, HR Post: {dialysisSessions[0].postDialysis.heartRate}
                          </Block>
                          
                          <Block marginBottom="8px">
                            <strong>Vascular Access:</strong> {dialysisSessions[0].vascularAccess.type} at {dialysisSessions[0].vascularAccess.site}
                          </Block>
                          
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