import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Patient, ClinicalDecision } from '../../types';
import { fetchPatientById } from './PatientService';

import lang from '../../utils/lang.json'
import { PersonalInfo } from './PatientPersonalInfo';
import { AIPredictionsTab } from './tabs/AIPredictionsTab';
import { DialysisSessionTab } from './tabs/DialysisSessionTab';
import { MonthlyInvestigationTab } from './tabs/MonthlyInvestigationTab';
import { TrendAnalysisTab } from './tabs/TrendAnalysisTab';
import { ClinicalDecisionsTab } from './tabs/ClinicalDecisionsTab';
import { usePatientData } from './usePatientData';

export type ProfileRole = 'doctor' | 'nurse' | 'admin' | 'other'

export interface PatientProfileProps {
  role?: ProfileRole;
  backTo?: string;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ role = 'other', backTo }) => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeKey, setActiveKey] = useState<string | number>('0');
  const [clinicalDecisions, setClinicalDecisions] = useState<ClinicalDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    dialysisSessions,
    dialysisSessionsLoading,
    dialysisSessionsError,
    loadDialysisSessions,
    monthlyInvestigations,
    monthlyInvestigationsLoading,
    monthlyInvestigationsError,
    loadMonthlyInvestigations,
    hemoglobinTrend,
    hemoglobinTrendLoading,
    hemoglobinTrendError,
    loadHemoglobinTrend,
    aiPredictions,
    aiPredictionsLoading,
    aiPredictionsError,
    loadAIPredictions,
  } = usePatientData(id);

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

  if (loading) {
    return (
      <div className="loading-container">
        <div>{lang.patient_profile.loading_patient}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div>{lang.error} {error}</div>
      </div>
    );
  }

  if (!patient) {
    return <div>{lang.patient_profile.patient_not_found}</div>;
  }

  const handleTabChange = (newActiveKey: string | number) => {
    setActiveKey(newActiveKey);
    if (newActiveKey === '0' && patient) {
      const loadAIWithInvestigations = async () => {
        try {
          if (monthlyInvestigations.length === 0 && !monthlyInvestigationsLoading) {
            await loadMonthlyInvestigations();
          }
          if (!aiPredictions && !aiPredictionsError) {
            loadAIPredictions();
          }
        } catch (err) {
          console.error('Error loading data for AI predictions:', err);
        }
      };
      if (monthlyInvestigations.length === 0) {
        loadAIWithInvestigations();
      } else if (!aiPredictions && !aiPredictionsError) {
        loadAIPredictions();
      }
    }
    if (newActiveKey === '1' && patient && dialysisSessions.length === 0) {
      loadDialysisSessions();
    }
    if (newActiveKey === '2' && patient && monthlyInvestigations.length === 0) {
      loadMonthlyInvestigations();
    }
    if (newActiveKey === '3' && patient && !hemoglobinTrend) {
      loadHemoglobinTrend();
    }
  };

  const showDoctorActions = role === 'doctor';

  return (
    <div id='container'>
      <h1 className="h1">{lang.patient_profile.title}</h1>
      <div className="patient-profile-grid">
        <div className="patient-profile padding-30">
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
                    {lang.buttons.add_clinical_decision}
                  </button>
                ) : undefined
              }
            />
          )}
        </div>

        <div className="patient-profile padding-30">
          <div className="background-primary border-radius-5 padding-30 grey-box-shadow">
            <div className="width-100-overflow-hidden">
              <div className="tab-buttons">
                <button className={`tab-button ${activeKey === '0' ? 'active' : ''}`} onClick={() => handleTabChange('0')}>{lang.patient_profile.tabs.ai_predictions}</button>
                <button className={`tab-button ${activeKey === '1' ? 'active' : ''}`} onClick={() => handleTabChange('1')}>{lang.patient_profile.tabs.latest_dialysis_session}</button>
                <button className={`tab-button ${activeKey === '2' ? 'active' : ''}`} onClick={() => handleTabChange('2')}>{lang.patient_profile.tabs.monthly_investigation}</button>
                <button className={`tab-button ${activeKey === '3' ? 'active' : ''}`} onClick={() => handleTabChange('3')}>{lang.patient_profile.tabs.trend_analysis}</button>
                <button className={`tab-button ${activeKey === '4' ? 'active' : ''}`} onClick={() => handleTabChange('4')}>{lang.patient_profile.tabs.clinical_decisions}</button>
              </div>
              <div className="tab-content">
                {activeKey === '0' && (
                  <div className="tab-panel">
                    <h2>{lang.patient_profile.ai_predictions.title}</h2>
                    <AIPredictionsTab
                      aiPredictions={aiPredictions}
                      aiPredictionsLoading={aiPredictionsLoading}
                      aiPredictionsError={aiPredictionsError}
                      patient={patient}
                      role={role}
                      onLoadAIPredictions={loadAIPredictions}
                      onLoadMonthlyInvestigations={loadMonthlyInvestigations}
                      monthlyInvestigationsLoading={monthlyInvestigationsLoading}
                    />
                  </div>
                )}

                {activeKey === '1' && (
                  <div className="tab-panel">
                    <h2>{lang.patient_profile.dialysis_session.title}</h2>
                    <DialysisSessionTab
                      dialysisSessions={dialysisSessions}
                      dialysisSessionsLoading={dialysisSessionsLoading}
                      dialysisSessionsError={dialysisSessionsError}
                    />
                  </div>
                )}

                {activeKey === '2' && (
                  <div className="tab-panel">
                    <h2>{lang.patient_profile.monthly_investigation.title}</h2>
                    <MonthlyInvestigationTab
                      monthlyInvestigations={monthlyInvestigations}
                      monthlyInvestigationsLoading={monthlyInvestigationsLoading}
                      monthlyInvestigationsError={monthlyInvestigationsError}
                    />
                  </div>
                )}

                {activeKey === '3' && (
                  <div className="tab-panel">
                    <h2>{lang.patient_profile.trend_analysis.title}</h2>
                    <TrendAnalysisTab
                      hemoglobinTrend={hemoglobinTrend}
                      hemoglobinTrendLoading={hemoglobinTrendLoading}
                      hemoglobinTrendError={hemoglobinTrendError}
                    />
                  </div>
                )}

                {activeKey === '4' && (
                  <ClinicalDecisionsTab
                    clinicalDecisions={clinicalDecisions}
                    patient={patient}
                    role={role}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
