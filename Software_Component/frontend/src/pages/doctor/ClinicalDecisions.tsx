import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClinicalDecision } from '../../types';

const DoctorClinicalDecisions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [decision, setDecision] = useState<Partial<ClinicalDecision>>({
    patientId: id || '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    prescription: '',
    followUpDate: '',
    doctorId: '2', // In a real app, this would come from the logged-in user
  });

  const handleInputChange = (field: keyof ClinicalDecision, value: any) => {
    setDecision(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!decision.notes || !decision.prescription || !decision.followUpDate) {
      alert('Please fill in all required fields');
      return;
    }

    // In a real app, this would make an API call to save the decision
    console.log('Saving clinical decision:', decision);
    alert('Clinical decision saved successfully');

    // Reset form or redirect
    // For demo, we'll just show a success message
  };

  return (
    <div id="container">
      <div id="header">
        <h1>🩺 Clinical Decision Support</h1>
        <p className="dashboard-subtitle">Patient ID: <span className="bold color-primary">{id}</span></p>
      </div>

      <div id="sub_container">
        <form onSubmit={handleSubmit} className="clinical-decisions-form">
          {/* Clinical Decision Form */}
          <div className="clinical-decisions-section">
            <div className="clinical-decisions-card">
              <div className="clinical-decisions-card-header">
                <h2 className="clinical-decisions-card-title">
                  <i className="bi bi-clipboard-check"></i> 📋 Clinical Decision
                </h2>
              </div>
              <div className="clinical-decisions-card-body">
                <div className="clinical-form-grid">
                  <div className="clinical-form-field">
                    <label className="clinical-form-label">
                      <i className="bi bi-calendar-date"></i> Date *
                    </label>
                    <input
                      value={decision.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      type="date"
                      required
                      className="clinical-form-input"
                    />
                  </div>

                  <div className="clinical-form-field">
                    <label className="clinical-form-label">
                      <i className="bi bi-calendar-check"></i> Follow-up Date *
                    </label>
                    <input
                      value={decision.followUpDate}
                      onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                      type="date"
                      required
                      className="clinical-form-input"
                    />
                  </div>
                </div>

                <div className="clinical-form-field">
                  <label className="clinical-form-label">
                    <i className="bi bi-journal-text"></i> Clinical Notes *
                  </label>
                  <textarea
                    value={decision.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter your clinical assessment, observations, and reasoning..."
                    required
                    className="clinical-form-textarea"
                  />
                </div>

                <div className="clinical-form-field">
                  <label className="clinical-form-label">
                    <i className="bi bi-capsule"></i> Prescription & Treatment Plan *
                  </label>
                  <textarea
                    value={decision.prescription}
                    onChange={(e) => handleInputChange('prescription', e.target.value)}
                    placeholder="Enter medication prescriptions, dosages, treatment recommendations..."
                    required
                    className="clinical-form-textarea"
                  />
                </div>

                <div className="clinical-form-actions">
                  <button type="submit" className="clinical-submit-btn">
                    <i className="bi bi-save-fill"></i> Save Clinical Decision
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorClinicalDecisions;