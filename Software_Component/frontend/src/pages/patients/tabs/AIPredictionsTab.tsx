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
        {/* Action Buttons */}
        <div className="margin-bottom-20">
          <button className="btn btn-primary" onClick={async () => {
            onLoadMonthlyInvestigations();
            onLoadAIPredictions();
          }} disabled={aiPredictionsLoading || monthlyInvestigationsLoading}>
            {lang.patient_profile.ai_predictions.refresh_button}
          </button>
          {showDoctorActions && (
            <button className="btn btn-outline margin-left-10" onClick={() => navigate(`/doctor/patients/${patient.id}/clinical-decisions`)}>
              {lang.patient_profile.ai_predictions.record_decision_button}
            </button>
          )}
        </div>

        {/* HB Prediction */}
        {aiPredictions.hb && (
          <div className={`padding-30 border-primary border-radius-5 margin-bottom-20 ${aiPredictions.hb.hb_risk_predicted ? 'bg-danger-light' : 'bg-success-light'}`}>
            <div className="margin-bottom-15">
              <h3>🩸 Hemoglobin Risk Prediction</h3>
              <span className={aiPredictions.hb.hb_risk_predicted ? 'status-error bold' : 'status-good bold'}>
                {aiPredictions.hb.risk_status}
              </span>
            </div>
            <div className="padding-10">
              <p><strong>Prediction:</strong> {aiPredictions.hb.hb_risk_predicted ? 'High Risk' : 'Low Risk'}</p>
              <p><strong>Trend:</strong> {aiPredictions.hb.hb_trend}</p>
              <p><strong>Current Hb:</strong> {aiPredictions.hb.current_hb} g/dL</p>
              <p><strong>Target Range:</strong> {aiPredictions.hb.target_hb_range.min} - {aiPredictions.hb.target_hb_range.max} g/dL</p>
              <p><strong>Risk Probability:</strong> {(aiPredictions.hb.risk_probability * 100).toFixed(1)}%</p>
              <p><strong>Confidence:</strong> {(aiPredictions.hb.confidence_score * 100).toFixed(1)}%</p>
            </div>
            {aiPredictions.hb.recommendations && aiPredictions.hb.recommendations.length > 0 && (
              <div className="margin-top-15">
                <h4>Recommendations:</h4>
                <ul>
                  {aiPredictions.hb.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* URR Prediction */}
        {aiPredictions.urr && (
          <div className={`padding-30 border-primary border-radius-5 margin-bottom-20 ${aiPredictions.urr.urr_risk_predicted ? 'bg-danger-light' : 'bg-success-light'}`}>
            <div className="margin-bottom-15">
              <h3>⚗️ URR Risk Prediction</h3>
              <span className={aiPredictions.urr.urr_risk_predicted ? 'status-error bold' : 'status-good bold'}>
                {aiPredictions.urr.risk_status}
              </span>
            </div>
            <div className="padding-10">
              <p><strong>Adequacy Status:</strong> {aiPredictions.urr.adequacy_status}</p>
              <p><strong>Current URR:</strong> {aiPredictions.urr.current_urr.toFixed(1)}%</p>
              <p><strong>Target Range:</strong> {aiPredictions.urr.target_urr_range.min} - {aiPredictions.urr.target_urr_range.max}%</p>
              <p><strong>Risk Probability:</strong> {(aiPredictions.urr.risk_probability * 100).toFixed(1)}%</p>
              <p><strong>Confidence:</strong> {(aiPredictions.urr.confidence_score * 100).toFixed(1)}%</p>
            </div>
            {aiPredictions.urr.recommendations && aiPredictions.urr.recommendations.length > 0 && (
              <div className="margin-top-15">
                <h4>Recommendations:</h4>
                <ul>
                  {aiPredictions.urr.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Dry Weight Prediction */}
        {aiPredictions.dryWeight && (
          <div className={`padding-30 border-primary border-radius-5 margin-bottom-20 ${aiPredictions.dryWeight.dry_weight_change_predicted ? 'bg-danger-light' : 'bg-success-light'}`}>
            <div className="margin-bottom-15">
              <h3>⚖️ Dry Weight Change Prediction</h3>
              <span className={aiPredictions.dryWeight.dry_weight_change_predicted ? 'status-error bold' : 'status-good bold'}>
                {aiPredictions.dryWeight.prediction_status}
              </span>
            </div>
            <div className="padding-10">
              <p><strong>Prediction:</strong> {aiPredictions.dryWeight.dry_weight_change_predicted ? 'Change Expected' : 'Stable'}</p>
              <p><strong>Current Dry Weight:</strong> {aiPredictions.dryWeight.current_dry_weight} kg</p>
              <p><strong>Current Weight Gain:</strong> {aiPredictions.dryWeight.current_weight_gain} kg</p>
              <p><strong>Change Probability:</strong> {(aiPredictions.dryWeight.change_probability * 100).toFixed(1)}%</p>
              <p><strong>Confidence:</strong> {(aiPredictions.dryWeight.confidence_score * 100).toFixed(1)}%</p>
            </div>
            {aiPredictions.dryWeight.recommendations && aiPredictions.dryWeight.recommendations.length > 0 && (
              <div className="margin-top-15">
                <h4>Recommendations:</h4>
                <ul>
                  {aiPredictions.dryWeight.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Error Messages */}
        {(aiPredictions.hbError || aiPredictions.urrError || aiPredictions.dryWeightError) && (
          <div className="padding-30 border-primary border-radius-5 margin-bottom-20 background-gray">
            <h3>⚠️ Prediction Errors</h3>
            {aiPredictions.hbError && <p><strong>HB Prediction:</strong> {aiPredictions.hbError}</p>}
            {aiPredictions.urrError && <p><strong>URR Prediction:</strong> {aiPredictions.urrError}</p>}
            {aiPredictions.dryWeightError && <p><strong>Dry Weight Prediction:</strong> {aiPredictions.dryWeightError}</p>}
          </div>
        )}

        {/* Technical Info */}
        <div className="padding-30 border-primary border-radius-5 background-gray">
          <h3>Technical Information</h3>
          <p><strong>Patient ID:</strong> {patient.patientId}</p>
          <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
          <p>Predictions are generated using advanced machine learning models based on the patient's latest clinical data.</p>
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