import React, { useState } from 'react';

interface AddInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  patientId: string;
}

export const AddInvestigationModal: React.FC<AddInvestigationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patientId
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    scrPreHD: '',
    scrPostHD: '',
    bu_pre_hd: '',
    bu_post_hd: '',
    hb: '',
    serumNaPreHD: '',
    serumNaPostHD: '',
    serumKPreHD: '',
    serumKPostHD: '',
    sCa: '',
    sPhosphate: '',
    albumin: '',
    ua: '',
    hco: '',
    al: '',
    hbA1C: '',
    pth: '',
    vitD: '',
    serumIron: '',
    serumFerritin: '',
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
    if (!formData.date) {
      alert('Please fill in the date');
      return;
    }
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      scrPreHD: '',
      scrPostHD: '',
      bu_pre_hd: '',
      bu_post_hd: '',
      hb: '',
      serumNaPreHD: '',
      serumNaPostHD: '',
      serumKPreHD: '',
      serumKPostHD: '',
      sCa: '',
      sPhosphate: '',
      albumin: '',
      ua: '',
      hco: '',
      al: '',
      hbA1C: '',
      pth: '',
      vitD: '',
      serumIron: '',
      serumFerritin: '',
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
          <h3 style={{ margin: 0 }}>Add Monthly Investigation</h3>
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
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Renal Function Tests</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>SCR Pre-HD (mg/dL)</label>
                <input
                  value={formData.scrPreHD}
                  onChange={(e) => handleInputChange('scrPreHD', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>SCR Post-HD (mg/dL)</label>
                <input
                  value={formData.scrPostHD}
                  onChange={(e) => handleInputChange('scrPostHD', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>BU Pre-HD (mg/dL)</label>
                <input
                  value={formData.bu_pre_hd}
                  onChange={(e) => handleInputChange('bu_pre_hd', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>BU Post-HD (mg/dL)</label>
                <input
                  value={formData.bu_post_hd}
                  onChange={(e) => handleInputChange('bu_post_hd', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Hematology & Electrolytes</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Hemoglobin (g/dL)</label>
                <input
                  value={formData.hb}
                  onChange={(e) => handleInputChange('hb', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Sodium Pre-HD (mEq/L)</label>
                <input
                  value={formData.serumNaPreHD}
                  onChange={(e) => handleInputChange('serumNaPreHD', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Sodium Post-HD (mEq/L)</label>
                <input
                  value={formData.serumNaPostHD}
                  onChange={(e) => handleInputChange('serumNaPostHD', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Potassium Pre-HD (mEq/L)</label>
                <input
                  value={formData.serumKPreHD}
                  onChange={(e) => handleInputChange('serumKPreHD', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Potassium Post-HD (mEq/L)</label>
                <input
                  value={formData.serumKPostHD}
                  onChange={(e) => handleInputChange('serumKPostHD', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Minerals & Proteins</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Calcium (mg/dL)</label>
                <input
                  value={formData.sCa}
                  onChange={(e) => handleInputChange('sCa', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phosphorus (mg/dL)</label>
                <input
                  value={formData.sPhosphate}
                  onChange={(e) => handleInputChange('sPhosphate', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Albumin (g/dL)</label>
                <input
                  value={formData.albumin}
                  onChange={(e) => handleInputChange('albumin', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Uric Acid (mg/dL)</label>
                <input
                  value={formData.ua}
                  onChange={(e) => handleInputChange('ua', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Bicarbonate (mEq/L)</label>
                <input
                  value={formData.hco}
                  onChange={(e) => handleInputChange('hco', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#495057' }}>Additional Tests</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Alkaline Phosphatase (U/L)</label>
                <input
                  value={formData.al}
                  onChange={(e) => handleInputChange('al', e.target.value)}
                  type="number"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>HbA1C (%)</label>
                <input
                  value={formData.hbA1C}
                  onChange={(e) => handleInputChange('hbA1C', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>PTH (pg/mL)</label>
                <input
                  value={formData.pth}
                  onChange={(e) => handleInputChange('pth', e.target.value)}
                  type="number"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Vitamin D (ng/mL)</label>
                <input
                  value={formData.vitD}
                  onChange={(e) => handleInputChange('vitD', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Serum Iron (μmol/L)</label>
                <input
                  value={formData.serumIron}
                  onChange={(e) => handleInputChange('serumIron', e.target.value)}
                  type="number"
                  step="0.1"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Serum Ferritin (ng/mL)</label>
                <input
                  value={formData.serumFerritin}
                  onChange={(e) => handleInputChange('serumFerritin', e.target.value)}
                  type="number"
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
              placeholder="Enter any additional notes about the investigation"
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
              Save Investigation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};