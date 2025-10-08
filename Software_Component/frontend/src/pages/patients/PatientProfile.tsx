import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

import { Patient, ClinicalDecision } from '../../types';
import { fetchPatientById, fetchMonthlyInvestigations, fetchDialysisSessions, fetchHemoglobinTrend, fetchAIPrediction } from './PatientService';

import lang from '../../utils/lang.json'
import { PersonalInfo } from './PatientPersonalInfo';

export type ProfileRole = 'doctor' | 'nurse' | 'admin' | 'other'

export interface PatientProfile{
  role?: ProfileRole;
  backTo?: string;
}

const PatientProfile: React.FC<PatientProfile> = ({ role = 'other', backTo }) => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
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
            setClinicalDecisions([]);
          } else {
            setError('Patient not found');
          }
        } catch (err) {
          console.error('Error loading patient data:', err);
          setError('Failed to load patient data');
          setPatient(null);
        } finally {
          setLoading(false);
        }
      }
    };
    loadPatientData();
  }, [id]);

  const loadAIPredictions = async (patientId: string) => {
    try {
      setAIPredictionsLoading(true);
      setAIPredictionsError(null);
      const investigations = await fetchMonthlyInvestigations(patientId);
      if (investigations && investigations.length > 0) {
        const latestInvestigation = investigations[0];
        const predictionData = {
          patient_id: patientId,
          albumin: latestInvestigation.albumin || 35.2,
          bu_post_hd: latestInvestigation.bu || 8.5,
          bu_pre_hd: latestInvestigation.bu || 25.3,
          s_ca: latestInvestigation.sCa || 2.3,
          scr_post_hd: latestInvestigation.scrPostHD || 450,
          scr_pre_hd: latestInvestigation.scrPreHD || 890,
          serum_k_post_hd: latestInvestigation.serumKPostHD || 3.8,
          serum_k_pre_hd: latestInvestigation.serumKPreHD || 5.2,
          serum_na_pre_hd: latestInvestigation.serumNaPreHD || 138,
          ua: latestInvestigation.ua || 400,
          hb_diff: -0.5,
          hb: latestInvestigation.hb || 9
        };
        const prediction = await fetchAIPrediction(predictionData);
        setAIPredictions(prediction);
      } else {
        setAIPredictionsError('No investigation data available for AI prediction');
        setAIPredictions(null);
      }
    } catch (err: any) {
      console.error('Error loading AI predictions:', err);
      if (err.message?.includes('Authentication failed') || err.message?.includes('No authentication token')) {
        setAIPredictionsError('Authentication failed. Please log in again.');
      } else {
        setAIPredictionsError('Failed to load AI predictions. Please try again.');
      }
      setAIPredictions(null);
    } finally {
      setAIPredictionsLoading(false);
    }
  };

  const loadDialysisSessions = async (patientId: string) => {
    try {
      setDialysisSessionsLoading(true);
      setDialysisSessionsError(null);
      const sessions = await fetchDialysisSessions(patientId);
      setDialysisSessions(sessions);
    } catch (err: any) {
      console.error('Error loading dialysis sessions:', err);
      if (err.message?.includes('Authentication failed') || err.message?.includes('No authentication token')) {
        setDialysisSessionsError('Authentication failed. Please log in again.');
      } else {
        setDialysisSessionsError('Failed to load dialysis sessions. Please try again.');
      }
      setDialysisSessions([]);
    } finally {
      setDialysisSessionsLoading(false);
    }
  };

  const loadMonthlyInvestigations = async (patientId: string) => {
    try {
      setMonthlyInvestigationsLoading(true);
      setMonthlyInvestigationsError(null);
      const investigations = await fetchMonthlyInvestigations(patientId);
      setMonthlyInvestigations(investigations);
    } catch (err: any) {
      console.error('Error loading monthly investigations:', err);
      if (err.message?.includes('Authentication failed') || err.message?.includes('No authentication token')) {
        setMonthlyInvestigationsError('Authentication failed. Please log in again.');
      } else {
        setMonthlyInvestigationsError('Failed to load monthly investigations. Please try again.');
      }
      setMonthlyInvestigations([]);
    } finally {
      setMonthlyInvestigationsLoading(false);
    }
  };

  const loadHemoglobinTrend = async (patientId: string) => {
    try {
      setHemoglobinTrendLoading(true);
      setHemoglobinTrendError(null);
      const trendData = await fetchHemoglobinTrend(patientId);
      setHemoglobinTrend(trendData);
    } catch (err: any) {
      console.error('Error loading hemoglobin trend:', err);
      if (err.message?.includes('Authentication failed') || err.message?.includes('No authentication token')) {
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
      <div className="loading-container">
        <div>Loading patient data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div>Error: {error}</div>
      </div>
    );
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  const weightTrendData = dialysisSessions
    .filter(session => session.preDialysis?.weight || session.postDialysis?.weight)
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

  const handleTabChange = (newActiveKey: string | number) => {
    setActiveKey(newActiveKey);
    if (newActiveKey === '0' && patient) {
      const loadAIWithInvestigations = async () => {
        try {
          if (monthlyInvestigations.length === 0 && !monthlyInvestigationsLoading) {
            await loadMonthlyInvestigations(patient.patientId || patient.id);
          }
          if (!aiPredictions && !aiPredictionsError) {
            loadAIPredictions(patient.patientId || patient.id);
          }
        } catch (err) {
          console.error('Error loading data for AI predictions:', err);
        }
      };
      if (monthlyInvestigations.length === 0) {
        loadAIWithInvestigations();
      } else if (!aiPredictions && !aiPredictionsError) {
        loadAIPredictions(patient.patientId || patient.id);
      }
    }
    if (newActiveKey === '1' && patient && dialysisSessions.length === 0) {
      loadDialysisSessions(patient.patientId || patient.id);
    }
    if (newActiveKey === '2' && patient && monthlyInvestigations.length === 0) {
      loadMonthlyInvestigations(patient.patientId || patient.id);
    }
    if (newActiveKey === '3' && patient && !hemoglobinTrend) {
      loadHemoglobinTrend(patient.patientId || patient.id);
    }
  };

  const showDoctorActions = role === 'doctor';

  return (
    <div className="patient-profile-page">
      <h1 className="general-h1">Patient Profile</h1>
      <div className="patient-profile-grid">
        <div className="patient-profile-left">
          {patient && (
            <PersonalInfo
              patient={patient}
              backTo={backTo}
              leftActions={
                showDoctorActions ? (
                  <button
                    className="btn btn-blue"
                    onClick={() => navigate(`/doctor/patients/${patient.id}/clinical-decisions`)}
                  >
                    Record Clinical Decision
                  </button>
                ) : undefined
              }
            />
          )}
        </div>

        <div className="patient-profile-right">
          <div className="patient-card">
            <div className="patient-card-body">
              <div className="custom-tabs">
                <div className="tab-buttons">
                  <button className={`tab-button ${activeKey === '0' ? 'active' : ''}`} onClick={() => handleTabChange('0')}>AI Predictions</button>
                  <button className={`tab-button ${activeKey === '1' ? 'active' : ''}`} onClick={() => handleTabChange('1')}>Latest Dialysis Session</button>
                  <button className={`tab-button ${activeKey === '2' ? 'active' : ''}`} onClick={() => handleTabChange('2')}>Monthly Investigation</button>
                  <button className={`tab-button ${activeKey === '3' ? 'active' : ''}`} onClick={() => handleTabChange('3')}>Trend Analysis</button>
                  <button className={`tab-button ${activeKey === '4' ? 'active' : ''}`} onClick={() => handleTabChange('4')}>Clinical Decisions</button>
                </div>
                <div className="tab-content">
                  {activeKey === '0' && (
                    <div className="tab-panel">
                      <h2>AI-Generated Hemoglobin Risk Prediction</h2>
                      {aiPredictionsLoading ? (
                        <div className="loading-container">
                          <div>Loading AI predictions...</div>
                        </div>
                      ) : aiPredictionsError ? (
                        <div className="error-container">
                          <div>Error: {aiPredictionsError}</div>
                        </div>
                      ) : aiPredictions ? (
                        <div>
                          <div
                            className="risk-assessment"
                            style={{
                              backgroundColor: aiPredictions.hb_risk_predicted ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)',
                              border: aiPredictions.hb_risk_predicted ? '1px solid #d32f2f' : '1px solid #66bb6a',
                              borderRadius: '8px',
                              padding: '16px',
                              marginBottom: '24px'
                            }}
                          >
                            <div className="risk-header">
                              <h3>Hemoglobin Risk Assessment</h3>
                              <span className={`risk-status ${aiPredictions.hb_risk_predicted ? 'high-risk' : 'low-risk'}`}>
                                {aiPredictions.risk_status}
                              </span>
                            </div>
                            <div className="risk-details">
                              <p><strong>Prediction:</strong> {aiPredictions.hb_risk_predicted ? 'Patient at risk' : 'Patient not at risk'}</p>
                              <p><strong>Hemoglobin Trend:</strong> {aiPredictions.hb_trend}</p>
                              <p><strong>Current Hemoglobin:</strong> {aiPredictions.current_hb} g/dL</p>
                              <p><strong>Target Range:</strong> {aiPredictions.target_hb_range.min} - {aiPredictions.target_hb_range.max} g/dL</p>
                              <p><strong>Risk Probability:</strong> {(aiPredictions.risk_probability * 100).toFixed(1)}%</p>
                              <p><strong>Confidence Score:</strong> {(aiPredictions.confidence_score * 100).toFixed(1)}%</p>
                              <p><strong>Prediction Date:</strong> {new Date(aiPredictions.prediction_date).toLocaleString()}</p>
                              <p><strong>Model Version:</strong> {aiPredictions.model_version}</p>
                            </div>
                          </div>

                          {aiPredictions.recommendations && aiPredictions.recommendations.length > 0 && (
                            <div className="recommendations">
                              <h3>Clinical Recommendations</h3>
                              <ul>
                                {aiPredictions.recommendations.map((recommendation: string, index: number) => (
                                  <li key={index}>{recommendation}</li>
                                ))}
                              </ul>
                              <div className="recommendation-actions">
                                <button className="btn btn-secondary" onClick={() => { console.log('AI recommendations acknowledged'); }}>Acknowledge Recommendations</button>
                                {showDoctorActions && (
                                  <button className="btn btn-outline" onClick={() => navigate(`/doctor/patients/${patient.id}/clinical-decisions`)}>Record Clinical Decision</button>
                                )}
                                <button className="btn btn-primary" onClick={async () => {
                                  if (patient) {
                                    await loadMonthlyInvestigations(patient.patientId || patient.id);
                                    loadAIPredictions(patient.patientId || patient.id);
                                  }
                                }} disabled={aiPredictionsLoading || monthlyInvestigationsLoading}>Refresh Prediction</button>
                              </div>
                            </div>
                          )}

                          <div className="technical-info">
                            <h3>Technical Information</h3>
                            <p><strong>Patient ID:</strong> {aiPredictions.patient_id}</p>
                            <p><strong>Risk Classification:</strong> {
                              aiPredictions.risk_probability > 0.8 ? 'High Risk' :
                              aiPredictions.risk_probability > 0.6 ? 'Moderate Risk' :
                              aiPredictions.risk_probability > 0.4 ? 'Low Risk' : 'Very Low Risk'
                            }</p>
                            <p>This prediction is based on the latest monthly investigation data and machine learning algorithms trained on historical patient data. Please use clinical judgment when interpreting these results.</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p>No AI predictions available. Click the button below to generate a prediction based on the latest investigation data.</p>
                          <button className="btn btn-primary" onClick={async () => {
                            if (patient) {
                              if (monthlyInvestigations.length === 0 && !monthlyInvestigationsLoading) {
                                await loadMonthlyInvestigations(patient.patientId || patient.id);
                              }
                              loadAIPredictions(patient.patientId || patient.id);
                            }
                          }} disabled={aiPredictionsLoading || monthlyInvestigationsLoading}>Generate AI Prediction</button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeKey === '1' && (
                    <div className="tab-panel">
                      <h2>Latest Dialysis Session</h2>
                      {dialysisSessionsLoading ? (
                        <div className="loading-container">
                          <div>Loading dialysis sessions...</div>
                        </div>
                      ) : dialysisSessionsError ? (
                        <div className="error-container">
                          <div>Error: {dialysisSessionsError}</div>
                        </div>
                      ) : dialysisSessions.length > 0 ? (
                        <div>{(() => { const latestSession = dialysisSessions[0]; return (
                          <div className="session-details">
                            <div className="session-header">
                              <h3>Session on {new Date(latestSession.date).toLocaleDateString()}</h3>
                              <span>Session #{latestSession.sessionId}</span>
                            </div>
                            {latestSession.id && <p><strong>Session ID:</strong> {latestSession.id}</p>}
                            {latestSession.status && <p><strong>Status:</strong> {latestSession.status}</p>}
                            {latestSession.doctor && <p><strong>Attending Doctor:</strong> {latestSession.doctor.name}</p>}
                            {latestSession.nurse && <p><strong>Assigned Nurse:</strong> {latestSession.nurse.name}</p>}
                            {latestSession.date && <p><strong>Date & Time:</strong> {new Date(latestSession.date).toLocaleString()}</p>}
                            {latestSession.notes && <p><strong>Notes:</strong> {latestSession.notes}</p>}
                            {latestSession.createdAt && <p><strong>Record Created:</strong> {new Date(latestSession.createdAt).toLocaleString()}</p>}
                            {latestSession.updatedAt && latestSession.updatedAt !== latestSession.createdAt && <p><strong>Last Updated:</strong> {new Date(latestSession.updatedAt).toLocaleString()}</p>}
                          </div>
                        ); })()}</div>
                      ) : (
                        <div className="no-data">
                          <p>No dialysis sessions recorded for this patient.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeKey === '2' && (
                    <div className="tab-panel">
                      <h2>Latest Monthly Investigation</h2>
                      {monthlyInvestigationsLoading ? (
                        <div className="loading-container">
                          <div>Loading monthly investigations...</div>
                        </div>
                      ) : monthlyInvestigationsError ? (
                        <div className="error-container">
                          <div>Error: {monthlyInvestigationsError}</div>
                        </div>
                      ) : monthlyInvestigations.length > 0 ? (
                        <div>{(() => { const latestInvestigation = monthlyInvestigations[0]; return (
                          <div className="investigation-details">
                            <div className="investigation-header">
                              <h3>Investigation on {new Date(latestInvestigation.date).toLocaleDateString()}</h3>
                              <span>ID: {latestInvestigation.investigationId}</span>
                            </div>
                            <p><strong>Renal Function:</strong> Creatinine Pre-HD: {latestInvestigation.scrPreHD?.toFixed(2)} mg/dL, Creatinine Post-HD: {latestInvestigation.scrPostHD?.toFixed(2)} mg/dL, BUN: {latestInvestigation.bu?.toFixed(2)} mg/dL</p>
                            <p><strong>CBC:</strong> Hemoglobin: {latestInvestigation.hb?.toFixed(2)} g/dL</p>
                            <p><strong>Electrolytes:</strong> Sodium Pre-HD: {latestInvestigation.serumNaPreHD?.toFixed(2)} mEq/L, Sodium Post-HD: {latestInvestigation.serumNaPostHD?.toFixed(2)} mEq/L, Potassium Pre-HD: {latestInvestigation.serumKPreHD?.toFixed(2)} mEq/L, Potassium Post-HD: {latestInvestigation.serumKPostHD?.toFixed(2)} mEq/L</p>
                            <p><strong>Bone & Mineral:</strong> Calcium: {latestInvestigation.sCa?.toFixed(2)} mg/dL, Phosphorus: {latestInvestigation.sPhosphate?.toFixed(2)} mg/dL, PTH: {latestInvestigation.pth?.toFixed(2)} pg/mL, Vitamin D: {latestInvestigation.vitD?.toFixed(2)} ng/mL</p>
                            <p><strong>Protein & Nutrition:</strong> Albumin: {latestInvestigation.albumin?.toFixed(2)} g/dL, Uric Acid: {latestInvestigation.ua?.toFixed(2)} mg/dL</p>
                            <p><strong>Iron Studies:</strong> Serum Iron: {latestInvestigation.serumIron?.toFixed(2)} μg/dL, Serum Ferritin: {latestInvestigation.serumFerritin?.toFixed(2)} ng/mL</p>
                            <p><strong>Other:</strong> HbA1C: {latestInvestigation.hbA1C?.toFixed(2)}%, Bicarbonate: {latestInvestigation.hco?.toFixed(2)} mEq/L, Alkaline Phosphatase: {latestInvestigation.al?.toFixed(2)} U/L</p>
                            <div className="lab-info">
                              <h4>Laboratory Info</h4>
                              <p>Requested by: {latestInvestigation.laboratoryInfo?.requestedBy?.name || 'N/A'}</p>
                              <p>Performed by: {latestInvestigation.laboratoryInfo?.performedBy?.name || 'N/A'}</p>
                              <p>Reported by: {latestInvestigation.laboratoryInfo?.reportedBy?.name || 'N/A'}</p>
                              <p>Testing Method: {latestInvestigation.laboratoryInfo?.testingMethod || 'N/A'}</p>
                            </div>
                            <p><strong>Status:</strong> {latestInvestigation.status}</p>
                            {latestInvestigation.notes && <p><strong>Notes:</strong> {latestInvestigation.notes}</p>}
                            <p>Total investigations available: {monthlyInvestigations.length}</p>
                          </div>
                        ); })()}</div>
                      ) : (
                        <div className="no-data">
                          <p>No monthly investigations recorded for this patient.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeKey === '3' && (
                    <div className="tab-panel">
                      <h2>Hemoglobin Trend Analysis</h2>
                      {hemoglobinTrendLoading ? (
                        <div className="loading-container">
                          <div>Loading hemoglobin trend data...</div>
                        </div>
                      ) : hemoglobinTrendError ? (
                        <div className="error-container">
                          <div>Error: {hemoglobinTrendError}</div>
                        </div>
                      ) : hemoglobinTrend && hemoglobinTrend.trendData ? (
                        <div>
                          {hemoglobinTrend.statistics && (
                            <div className="statistics">
                              <h3>Hemoglobin Statistics</h3>
                              <div className="stats-grid">
                                <p><strong>Average:</strong> {hemoglobinTrend.statistics.average?.toFixed(2)} g/dL</p>
                                <p><strong>Min:</strong> {hemoglobinTrend.statistics.min?.toFixed(2)} g/dL</p>
                                <p><strong>Max:</strong> {hemoglobinTrend.statistics.max?.toFixed(2)} g/dL</p>
                                <p><strong>Trend:</strong> {hemoglobinTrend.statistics.trend}</p>
                                <p><strong>Normal Range:</strong> {hemoglobinTrend.statistics.normalRange?.min}-{hemoglobinTrend.statistics.normalRange?.max} g/dL</p>
                              </div>
                            </div>
                          )}

                          <div className="chart-container">
                            <h3>Hemoglobin Levels Over Time</h3>
                            <ResponsiveContainer width="100%" height={400}>
                              <LineChart data={hemoglobinTrend.trendData.map((item: any) => ({ ...item, month: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), normalMin: hemoglobinTrend.statistics?.normalRange?.min || 12, normalMax: hemoglobinTrend.statistics?.normalRange?.max || 16 }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis domain={["dataMin - 1", "dataMax + 1"]} label={{ value: 'Hemoglobin (g/dL)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip formatter={(value: any, name: string) => { if (name === 'hb') return [`${value?.toFixed(2)} g/dL`, 'Hemoglobin']; if (name === 'normalMin') return [`${value} g/dL`, 'Normal Range Min']; if (name === 'normalMax') return [`${value} g/dL`, 'Normal Range Max']; return [value, name]; }} labelFormatter={(label) => `Month: ${label}`} />
                                <Legend />
                                <Area type="monotone" dataKey="normalMax" stackId="normal" stroke="rgba(0, 255, 0, 0.3)" fill="rgba(0, 255, 0, 0.1)" name="Normal Range" />
                                <Area type="monotone" dataKey="normalMin" stackId="normal" stroke="rgba(0, 255, 0, 0.3)" fill="rgba(255, 255, 255, 1)" />
                                <Line type="monotone" dataKey="hb" stroke="#8884d8" strokeWidth={3} dot={{ r: 6, strokeWidth: 2 }} name="Hemoglobin Level" />
                                <Line type="monotone" dataKey="normalMin" stroke="rgba(0, 255, 0, 0.6)" strokeDasharray="5 5" dot={false} name="Normal Min (12 g/dL)" />
                                <Line type="monotone" dataKey="normalMax" stroke="rgba(0, 255, 0, 0.6)" strokeDasharray="5 5" dot={false} name="Normal Max (16 g/dL)" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="data-table">
                            <h3>Detailed Data Points</h3>
                            <table>
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Hemoglobin (g/dL)</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {hemoglobinTrend.trendData.map((item: any, index: number) => (
                                  <tr key={index}>
                                    <td>{new Date(item.date).toLocaleDateString()}</td>
                                    <td>{item.hb?.toFixed(2)}</td>
                                    <td className={`status-${item.status}`}>{item.status}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div>No hemoglobin trend data available</div>
                      )}
                    </div>
                  )}

                  {activeKey === '4' && (
                    <div className="tab-panel">
                      <div className="clinical-decisions-header">
                        <h2>Clinical Decisions</h2>
                        {showDoctorActions && (<button className="btn btn-primary" onClick={() => navigate(`/doctor/patients/${patient.id}/clinical-decisions`)}>New Decision</button>)}
                      </div>
                      {clinicalDecisions.length > 0 ? (
                        clinicalDecisions.map(decision => (
                          <div key={decision.id} className="decision-item">
                            <h3>Decision on {decision.date}</h3>
                            <p><strong>Notes:</strong> {decision.notes}</p>
                            <p><strong>Prescription:</strong> {decision.prescription}</p>
                            <p><strong>Follow-up Date:</strong> {decision.followUpDate}</p>
                            <p><strong>AI Suggestions:</strong> {decision.aiSuggestions.join(', ')}</p>
                            <p><strong>AI Suggestions {decision.aiSuggestionsAcknowledged ? 'Acknowledged' : 'Not Acknowledged'}</strong></p>
                            {decision.aiSuggestionsOverridden && <p><strong>AI Suggestions Overridden:</strong> {decision.aiOverrideReason}</p>}
                          </div>
                        ))
                      ) : (
                        <div className="no-data">
                          <p>No clinical decisions recorded for this patient.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
