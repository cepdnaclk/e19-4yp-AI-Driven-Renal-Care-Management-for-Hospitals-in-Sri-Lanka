import React from 'react';
import lang from '../../../utils/lang.json';

interface MonthlyInvestigationTabProps {
  monthlyInvestigations: any[];
  monthlyInvestigationsLoading: boolean;
  monthlyInvestigationsError: string | null;
}

export const MonthlyInvestigationTab: React.FC<MonthlyInvestigationTabProps> = ({
  monthlyInvestigations,
  monthlyInvestigationsLoading,
  monthlyInvestigationsError,
}) => {
  if (monthlyInvestigationsLoading) {
    return (
      <div className="loading-container">
        <div>{lang.patient_profile.monthly_investigation.loading}</div>
      </div>
    );
  }

  if (monthlyInvestigationsError) {
    return (
      <div className="error-container">
        <div>{lang.error} {monthlyInvestigationsError}</div>
      </div>
    );
  }

  if (monthlyInvestigations.length > 0) {
    const latestInvestigation = monthlyInvestigations[0];
    return (
      <div className="padding-30 border-primary border-radius-5 background-gray">
        <div className="patient-row">
          <h3>{lang.patient_profile.monthly_investigation.title} {new Date(latestInvestigation.date).toLocaleDateString()}</h3>
          <span>ID: {latestInvestigation.investigationId}</span>
        </div>
        <p><strong>{lang.patient_profile.monthly_investigation.renal_function}:</strong> Creatinine Pre-HD: {latestInvestigation.scrPreHD?.toFixed(2)} mg/dL, Creatinine Post-HD: {latestInvestigation.scrPostHD?.toFixed(2)} mg/dL, BUN: {latestInvestigation.bu?.toFixed(2)} mg/dL</p>
        <p><strong>{lang.patient_profile.monthly_investigation.cbc}:</strong> Hemoglobin: {latestInvestigation.hb?.toFixed(2)} g/dL</p>
        <p><strong>{lang.patient_profile.monthly_investigation.electrolytes}:</strong> Sodium Pre-HD: {latestInvestigation.serumNaPreHD?.toFixed(2)} mEq/L, Sodium Post-HD: {latestInvestigation.serumNaPostHD?.toFixed(2)} mEq/L, Potassium Pre-HD: {latestInvestigation.serumKPreHD?.toFixed(2)} mEq/L, Potassium Post-HD: {latestInvestigation.serumKPostHD?.toFixed(2)} mEq/L</p>
        <p><strong>{lang.patient_profile.monthly_investigation.bone_mineral}:</strong> Calcium: {latestInvestigation.sCa?.toFixed(2)} mg/dL, Phosphorus: {latestInvestigation.sPhosphate?.toFixed(2)} mg/dL, PTH: {latestInvestigation.pth?.toFixed(2)} pg/mL, Vitamin D: {latestInvestigation.vitD?.toFixed(2)} ng/mL</p>
        <p><strong>{lang.patient_profile.monthly_investigation.protein_nutrition}:</strong> Albumin: {latestInvestigation.albumin?.toFixed(2)} g/dL, Uric Acid: {latestInvestigation.ua?.toFixed(2)} mg/dL</p>
        <p><strong>{lang.patient_profile.monthly_investigation.iron_studies}:</strong> Serum Iron: {latestInvestigation.serumIron?.toFixed(2)} μg/dL, Serum Ferritin: {latestInvestigation.serumFerritin?.toFixed(2)} ng/mL</p>
        <p><strong>{lang.patient_profile.monthly_investigation.other}:</strong> HbA1C: {latestInvestigation.hbA1C?.toFixed(2)}%, Bicarbonate: {latestInvestigation.hco?.toFixed(2)} mEq/L, Alkaline Phosphatase: {latestInvestigation.al?.toFixed(2)} U/L</p>
        <div className="padding-10">
          <h4>{lang.patient_profile.monthly_investigation.laboratory_info}</h4>
          <p>{lang.patient_profile.monthly_investigation.requested_by}: {latestInvestigation.laboratoryInfo?.requestedBy?.name || lang.not_available}</p>
          <p>{lang.patient_profile.monthly_investigation.performed_by}: {latestInvestigation.laboratoryInfo?.performedBy?.name || lang.not_available}</p>
          <p>{lang.patient_profile.monthly_investigation.reported_by}: {latestInvestigation.laboratoryInfo?.reportedBy?.name || lang.not_available}</p>
          <p>{lang.patient_profile.monthly_investigation.testing_method}: {latestInvestigation.laboratoryInfo?.testingMethod || lang.not_available}</p>
        </div>
        <p><strong>{lang.patient_profile.monthly_investigation.status}:</strong> {latestInvestigation.status}</p>
        {latestInvestigation.notes && <p><strong>{lang.patient_profile.monthly_investigation.notes}:</strong> {latestInvestigation.notes}</p>}
        <p>{lang.patient_profile.monthly_investigation.total_investigations}: {monthlyInvestigations.length}</p>
      </div>
    );
  }

  return (
    <div className="no-patients-message">
      <p>{lang.patient_profile.monthly_investigation.no_data}</p>
    </div>
  );
};