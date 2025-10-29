import React from 'react';
import { useNavigate } from 'react-router-dom';
import lang from '../../../utils/lang.json';

interface AIPredictionsTabProps {
  aiPredictions: any;
  aiPredictionsLoading: boolean;
  aiPredictionsError: string | null;
  patient: any;
  role: string;
  onLoadAIPredictions: () => void;
  onLoadMonthlyInvestigations: () => void;
  monthlyInvestigationsLoading: boolean;
}

export const AIPredictionsTab: React.FC<AIPredictionsTabProps> = ({
  aiPredictions,
  aiPredictionsLoading,
  aiPredictionsError,
  patient,
  role,
  onLoadAIPredictions,
  onLoadMonthlyInvestigations,
  monthlyInvestigationsLoading,
}) => {
  const navigate = useNavigate();
  const showDoctorActions = role === 'doctor';

  if (aiPredictionsLoading) {
    return (
      <div className="loading-container">
        <div>{lang.patient_profile.ai_predictions.loading}</div>
      </div>
    );
  }

  if (aiPredictionsError) {
    return (
      <div className="error-container">
        <div>{lang.error} {aiPredictionsError}</div>
      </div>
    );
  }

  if (aiPredictions) {
    return (
      <div>
        <div className="padding-30 border-primary border-radius-5 margin-bottom-20 background-gray" style={{ backgroundColor: 'transparent' }}>
          <div>
            <h3>{lang.patient_profile.ai_predictions.risk_assessment_title}</h3>
            <span className={aiPredictions.hb_risk_predicted ? 'status-error bold' : 'status-good bold'}>
              {aiPredictions.risk_status}
            </span>
          </div>
          <div className="padding-10">
            <p><strong>{lang.patient_profile.ai_predictions.prediction}:</strong> {aiPredictions.hb_risk_predicted ? lang.patient_profile.ai_predictions.high_risk.toLowerCase() : lang.patient_profile.ai_predictions.low_risk.toLowerCase()}</p>
            <p><strong>{lang.patient_profile.ai_predictions.hemoglobin_trend}:</strong> {aiPredictions.hb_trend}</p>
            <p><strong>{lang.patient_profile.ai_predictions.current_hemoglobin}:</strong> {aiPredictions.current_hb} g/dL</p>
            <p><strong>{lang.patient_profile.ai_predictions.target_range}:</strong> {aiPredictions.target_hb_range.min} - {aiPredictions.target_hb_range.max} g/dL</p>
            <p><strong>{lang.patient_profile.ai_predictions.risk_probability}:</strong> {(aiPredictions.risk_probability * 100).toFixed(1)}%</p>
            <p><strong>{lang.patient_profile.ai_predictions.confidence_score}:</strong> {(aiPredictions.confidence_score * 100).toFixed(1)}%</p>
            <p><strong>{lang.patient_profile.ai_predictions.prediction_date}:</strong> {new Date(aiPredictions.prediction_date).toLocaleString()}</p>
            <p><strong>{lang.patient_profile.ai_predictions.model_version}:</strong> {aiPredictions.model_version}</p>
          </div>
        </div>

        {aiPredictions.recommendations && aiPredictions.recommendations.length > 0 && (
          <div className="padding-30 border-primary border-radius-5 margin-bottom-20">
            <h3>{lang.patient_profile.ai_predictions.recommendations_title}</h3>
            <ul>
              {aiPredictions.recommendations.map((recommendation: string, index: number) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
            <div className="margin-top-10">
              <button className="btn btn-secondary" onClick={() => { console.log('AI recommendations acknowledged'); }}>{lang.patient_profile.ai_predictions.acknowledge_button}</button>
              {showDoctorActions && (
                <button className="btn btn-outline" onClick={() => navigate(`/doctor/patients/${patient.id}/clinical-decisions`)}>{lang.patient_profile.ai_predictions.record_decision_button}</button>
              )}
              <button className="btn btn-primary" onClick={async () => {
                onLoadMonthlyInvestigations();
                onLoadAIPredictions();
              }} disabled={aiPredictionsLoading || monthlyInvestigationsLoading}>{lang.patient_profile.ai_predictions.refresh_button}</button>
            </div>
          </div>
        )}

        <div className="padding-30 border-primary border-radius-5 background-gray">
          <h3>{lang.patient_profile.ai_predictions.technical_info_title}</h3>
          <p><strong>{lang.patient_profile.ai_predictions.patient_id}:</strong> {aiPredictions.patient_id}</p>
          <p><strong>{lang.patient_profile.ai_predictions.risk_classification}:</strong> {
            aiPredictions.risk_probability > 0.8 ? lang.patient_profile.ai_predictions.high_risk :
            aiPredictions.risk_probability > 0.6 ? lang.patient_profile.ai_predictions.moderate_risk :
            aiPredictions.risk_probability > 0.4 ? lang.patient_profile.ai_predictions.low_risk : lang.patient_profile.ai_predictions.very_low_risk
          }</p>
          <p>{lang.patient_profile.ai_predictions.technical_note}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p>{lang.patient_profile.ai_predictions.no_data}</p>
      <button className="btn btn-primary" onClick={async () => {
        onLoadMonthlyInvestigations();
        onLoadAIPredictions();
      }} disabled={aiPredictionsLoading || monthlyInvestigationsLoading}>{lang.patient_profile.ai_predictions.generate_button}</button>
    </div>
  );
};