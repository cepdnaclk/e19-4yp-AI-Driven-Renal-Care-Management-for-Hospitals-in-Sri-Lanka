import React, { useState } from 'react';
import lang from '../../../utils/lang.json';
import { AddInvestigationModal } from '../../../components/AddInvestigationModal';
import monthlyInvestigationService from '../../../services/monthlyInvestigationService';
import { ProfileRole } from '../PatientProfile';

interface MonthlyInvestigationTabProps {
  monthlyInvestigations: any[];
  monthlyInvestigationsLoading: boolean;
  monthlyInvestigationsError: string | null;
  role?: ProfileRole;
  patientId?: string;
  onLoadMonthlyInvestigations?: () => void;
}

export const MonthlyInvestigationTab: React.FC<MonthlyInvestigationTabProps> = ({
  monthlyInvestigations,
  monthlyInvestigationsLoading,
  monthlyInvestigationsError,
  role,
  patientId,
  onLoadMonthlyInvestigations,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleModalSubmit = async (formData: any) => {
    try {
      if (!patientId) {
        alert('Patient ID is required');
        return;
      }

      const investigationData = {
        date: formData.date,
        scrPreHD: formData.scrPreHD ? parseFloat(formData.scrPreHD) : undefined,
        scrPostHD: formData.scrPostHD ? parseFloat(formData.scrPostHD) : undefined,
        bu_pre_hd: formData.bu_pre_hd ? parseFloat(formData.bu_pre_hd) : undefined,
        bu_post_hd: formData.bu_post_hd ? parseFloat(formData.bu_post_hd) : undefined,
        hb: formData.hb ? parseFloat(formData.hb) : undefined,
        serumNaPreHD: formData.serumNaPreHD ? parseFloat(formData.serumNaPreHD) : undefined,
        serumNaPostHD: formData.serumNaPostHD ? parseFloat(formData.serumNaPostHD) : undefined,
        serumKPreHD: formData.serumKPreHD ? parseFloat(formData.serumKPreHD) : undefined,
        serumKPostHD: formData.serumKPostHD ? parseFloat(formData.serumKPostHD) : undefined,
        sCa: formData.sCa ? parseFloat(formData.sCa) : undefined,
        sPhosphate: formData.sPhosphate ? parseFloat(formData.sPhosphate) : undefined,
        albumin: formData.albumin ? parseFloat(formData.albumin) : undefined,
        ua: formData.ua ? parseFloat(formData.ua) : undefined,
        hco: formData.hco ? parseFloat(formData.hco) : undefined,
        al: formData.al ? parseFloat(formData.al) : undefined,
        hbA1C: formData.hbA1C ? parseFloat(formData.hbA1C) : undefined,
        pth: formData.pth ? parseFloat(formData.pth) : undefined,
        vitD: formData.vitD ? parseFloat(formData.vitD) : undefined,
        serumIron: formData.serumIron ? parseFloat(formData.serumIron) : undefined,
        serumFerritin: formData.serumFerritin ? parseFloat(formData.serumFerritin) : undefined,
        notes: formData.notes || undefined
      };

      await monthlyInvestigationService.createInvestigation(patientId, investigationData);
      setShowModal(false);
      if (onLoadMonthlyInvestigations) {
        onLoadMonthlyInvestigations();
      }
      alert('Monthly investigation saved successfully');
    } catch (err) {
      console.error('Error saving investigation:', err);
      alert('Failed to save monthly investigation');
    }
  };
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
      <div>
        {(role === 'doctor' || role === 'nurse') && patientId && (
          <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Add New Investigation
            </button>
          </div>
        )}
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

        <AddInvestigationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
          patientId={patientId!}
        />
      </div>
    );
  }

  return (
    <div>
      {(role === 'doctor' || role === 'nurse') && patientId && (
        <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Add New Investigation
          </button>
        </div>
      )}
      <div className="no-patients-message">
        <p>{lang.patient_profile.monthly_investigation.no_data}</p>
      </div>

      <AddInvestigationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        patientId={patientId!}
      />
    </div>
  );
};