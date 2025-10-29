import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClinicalDecision } from '../../../types';
import lang from '../../../utils/lang.json';

interface ClinicalDecisionsTabProps {
  clinicalDecisions: ClinicalDecision[];
  patient: any;
  role: string;
}

export const ClinicalDecisionsTab: React.FC<ClinicalDecisionsTabProps> = ({
  clinicalDecisions,
  patient,
  role,
}) => {
  const navigate = useNavigate();
  const showDoctorActions = role === 'doctor';

  return (
    <div className="main-content padding-30">
      <h2>{lang.patient_profile.clinical_decisions.title}</h2>
      {showDoctorActions && (
        <button className="btn btn-primary" onClick={() => navigate(`/doctor/patients/${patient.id}/clinical-decisions`)}>
          {lang.patient_profile.clinical_decisions.new_decision_button}
        </button>
      )}
      {clinicalDecisions.length > 0 ? (
        clinicalDecisions.map(decision => (
          <div key={decision.id} className="padding-10 border-primary border-radius-5 margin-bottom-10 background-gray">
            <h3>{lang.patient_profile.clinical_decisions.decision_date} {decision.date}</h3>
            <p><strong>{lang.patient_profile.clinical_decisions.notes}:</strong> {decision.notes}</p>
            <p><strong>{lang.patient_profile.clinical_decisions.prescription}:</strong> {decision.prescription}</p>
            <p><strong>{lang.patient_profile.clinical_decisions.follow_up_date}:</strong> {decision.followUpDate}</p>
            <p><strong>{lang.patient_profile.clinical_decisions.ai_suggestions}:</strong> {decision.aiSuggestions.join(', ')}</p>
            <p><strong>{lang.patient_profile.clinical_decisions.ai_suggestions} {decision.aiSuggestionsAcknowledged ? lang.patient_profile.clinical_decisions.ai_acknowledged : lang.patient_profile.clinical_decisions.ai_not_acknowledged}</strong></p>
            {decision.aiSuggestionsOverridden && <p><strong>{lang.patient_profile.clinical_decisions.ai_overridden}:</strong> {decision.aiOverrideReason}</p>}
          </div>
        ))
      ) : (
        <div className="no-patients-message">
          <p>{lang.patient_profile.clinical_decisions.no_data}</p>
        </div>
      )}
    </div>
  );
};