import React, { useState } from 'react';

interface AddDialysisSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  patientId: string;
}

export const AddDialysisSessionModal: React.FC<AddDialysisSessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patientId
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    hdDuration: '',
    dryWeight: '',
    preHDDryWeight: '',
    postHDDryWeight: '',
    puf: '',
    auf: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    bfr: '',
    tmp: '',
    ap: '',
    vp: '',
    vascularAccessType: 'AVF',
    vascularAccessSite: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.date) {
      alert('Please fill in the date');
      return;
    }
    if (!formData.startTime) {
      alert('Please fill in the start time');
      return;
    }
    if (!formData.hdDuration || parseInt(formData.hdDuration) <= 0) {
      alert('Please enter a valid HD duration');
      return;
    }
    if (!formData.dryWeight || parseFloat(formData.dryWeight) <= 0) {
      alert('Please enter a valid dry weight');
      return;
    }
    if (!formData.preHDDryWeight || parseFloat(formData.preHDDryWeight) <= 0) {
      alert('Please enter a valid pre-HD dry weight');
      return;
    }
    if (!formData.postHDDryWeight || parseFloat(formData.postHDDryWeight) <= 0) {
      alert('Please enter a valid post-HD dry weight');
      return;
    }
    if (!formData.puf || parseFloat(formData.puf) < 0) {
      alert('Please enter a valid prescribed ultrafiltration');
      return;
    }
    if (!formData.auf || parseFloat(formData.auf) < 0) {
      alert('Please enter a valid achieved ultrafiltration');
      return;
    }
    if (!formData.bloodPressureSystolic || parseInt(formData.bloodPressureSystolic) < 50 || parseInt(formData.bloodPressureSystolic) > 300) {
      alert('Please enter a valid systolic blood pressure (50-300)');
      return;
    }
    if (!formData.bloodPressureDiastolic || parseInt(formData.bloodPressureDiastolic) < 30 || parseInt(formData.bloodPressureDiastolic) > 200) {
      alert('Please enter a valid diastolic blood pressure (30-200)');
      return;
    }
    if (!formData.bfr || parseInt(formData.bfr) <= 0) {
      alert('Please enter a valid blood flow rate');
      return;
    }
    if (!formData.tmp || parseInt(formData.tmp) <= 0) {
      alert('Please enter a valid transmembrane pressure');
      return;
    }
    if (!formData.ap) {
      alert('Please enter a valid arterial pressure');
      return;
    }
    if (!formData.vp || parseInt(formData.vp) <= 0) {
      alert('Please enter a valid venous pressure');
      return;
    }
    if (!formData.vascularAccessSite.trim()) {
      alert('Please enter the vascular access site');
      return;
    }

    const sessionData = {
      date: formData.date,
      startTime: formData.startTime,
      hdDuration: parseInt(formData.hdDuration),
      dryWeight: parseFloat(formData.dryWeight),
      preHDDryWeight: parseFloat(formData.preHDDryWeight),
      postHDDryWeight: parseFloat(formData.postHDDryWeight),
      puf: parseFloat(formData.puf),
      auf: parseFloat(formData.auf),
      bloodPressure: {
        systolic: parseInt(formData.bloodPressureSystolic),
        diastolic: parseInt(formData.bloodPressureDiastolic)
      },
      bfr: parseInt(formData.bfr),
      tmp: parseInt(formData.tmp),
      ap: parseInt(formData.ap),
      vp: parseInt(formData.vp),
      vascularAccess: {
        type: formData.vascularAccessType,
        site: formData.vascularAccessSite.trim()
      },
      notes: formData.notes.trim() || undefined
    };

    onSubmit(sessionData);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      hdDuration: '',
      dryWeight: '',
      preHDDryWeight: '',
      postHDDryWeight: '',
      puf: '',
      auf: '',
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      bfr: '',
      tmp: '',
      ap: '',
      vp: '',
      vascularAccessType: 'AVF',
      vascularAccessSite: '',
      notes: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0 }}>Add Dialysis Session</h3>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6c757d'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Date *</label>
              <input
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                type="date"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Start Time *</label>
              <input
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                type="time"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>HD Duration (min) *</label>
              <input
                value={formData.hdDuration}
                onChange={(e) => handleInputChange('hdDuration', e.target.value)}
                type="number"
                min="1"
                placeholder="240"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Weight Parameters</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Dry Weight (kg) *</label>
                <input
                  value={formData.dryWeight}
                  onChange={(e) => handleInputChange('dryWeight', e.target.value)}
                  type="number"
                  step="0.1"
                  placeholder="60.5"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Pre-HD Weight (kg) *</label>
                <input
                  value={formData.preHDDryWeight}
                  onChange={(e) => handleInputChange('preHDDryWeight', e.target.value)}
                  type="number"
                  step="0.1"
                  placeholder="62.0"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Post-HD Weight (kg) *</label>
                <input
                  value={formData.postHDDryWeight}
                  onChange={(e) => handleInputChange('postHDDryWeight', e.target.value)}
                  type="number"
                  step="0.1"
                  placeholder="60.2"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Ultrafiltration</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Prescribed UF (L) *</label>
                <input
                  value={formData.puf}
                  onChange={(e) => handleInputChange('puf', e.target.value)}
                  type="number"
                  step="0.1"
                  placeholder="2.5"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Achieved UF (L) *</label>
                <input
                  value={formData.auf}
                  onChange={(e) => handleInputChange('auf', e.target.value)}
                  type="number"
                  step="0.1"
                  placeholder="2.3"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Blood Pressure & Vital Signs</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Systolic BP (mmHg) *</label>
                <input
                  value={formData.bloodPressureSystolic}
                  onChange={(e) => handleInputChange('bloodPressureSystolic', e.target.value)}
                  type="number"
                  min="50"
                  max="300"
                  placeholder="120"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Diastolic BP (mmHg) *</label>
                <input
                  value={formData.bloodPressureDiastolic}
                  onChange={(e) => handleInputChange('bloodPressureDiastolic', e.target.value)}
                  type="number"
                  min="30"
                  max="200"
                  placeholder="80"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Dialysis Machine Parameters</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Blood Flow Rate (mL/min) *</label>
                <input
                  value={formData.bfr}
                  onChange={(e) => handleInputChange('bfr', e.target.value)}
                  type="number"
                  min="1"
                  placeholder="300"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>TMP (mmHg) *</label>
                <input
                  value={formData.tmp}
                  onChange={(e) => handleInputChange('tmp', e.target.value)}
                  type="number"
                  min="1"
                  placeholder="120"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Arterial Pressure (mmHg) *</label>
                <input
                  value={formData.ap}
                  onChange={(e) => handleInputChange('ap', e.target.value)}
                  type="number"
                  placeholder="-200"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Venous Pressure (mmHg) *</label>
                <input
                  value={formData.vp}
                  onChange={(e) => handleInputChange('vp', e.target.value)}
                  type="number"
                  min="1"
                  placeholder="150"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Vascular Access</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Access Type *</label>
                <select
                  value={formData.vascularAccessType}
                  onChange={(e) => handleInputChange('vascularAccessType', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="AVF">AV Fistula (AVF)</option>
                  <option value="AVG">AV Graft (AVG)</option>
                  <option value="CENTRAL_CATHETER">Central Catheter</option>
                  <option value="PERITONEAL_CATHETER">Peritoneal Catheter</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Access Site *</label>
                <input
                  value={formData.vascularAccessSite}
                  onChange={(e) => handleInputChange('vascularAccessSite', e.target.value)}
                  type="text"
                  placeholder="Left forearm"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes about the dialysis session"
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #dee2e6'
          }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};