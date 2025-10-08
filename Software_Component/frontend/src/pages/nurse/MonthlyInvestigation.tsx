import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MonthlyInvestigation } from '../../types';

const NurseMonthlyInvestigation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [investigation, setInvestigation] = useState<Partial<MonthlyInvestigation>>({
    patientId: id || '',
    date: new Date().toISOString().split('T')[0],
    hemoglobin: 0,
    hematocrit: 0,
    whiteBloodCellCount: 0,
    plateletCount: 0,
    sodium: 0,
    potassium: 0,
    chloride: 0,
    bicarbonate: 0,
    bun: 0,
    creatinine: 0,
    glucose: 0,
    calcium: 0,
    phosphorus: 0,
    albumin: 0,
    totalProtein: 0,
    alt: 0,
    ast: 0,
    alkalinePhosphatase: 0,
    notes: '',
    nurseId: '1' // In a real app, this would come from the logged-in user
  });

  const handleInputChange = (field: keyof MonthlyInvestigation, value: any) => {
    setInvestigation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!investigation.date) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Saving monthly investigation:', investigation);
    alert('Monthly investigation saved successfully');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>New Monthly Investigation</h1>
      <h2>Patient ID: {id}</h2>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
            <h3>Investigation Details</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Date *</label>
              <input
                value={investigation.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                type="date"
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            
            <h3 style={{ marginTop: '24px' }}>Complete Blood Count</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>Hemoglobin (g/dL)</label>
                <input
                  value={investigation.hemoglobin || ''}
                  onChange={(e) => handleInputChange('hemoglobin', parseFloat(e.target.value) || 0)}
                  type="number"
                  step={0.1}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Hematocrit (%)</label>
                <input
                  value={investigation.hematocrit || ''}
                  onChange={(e) => handleInputChange('hematocrit', parseFloat(e.target.value) || 0)}
                  type="number"
                  step={0.1}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>White Blood Cell Count (K/μL)</label>
                <input
                  value={investigation.whiteBloodCellCount || ''}
                  onChange={(e) => handleInputChange('whiteBloodCellCount', parseFloat(e.target.value) || 0)}
                  type="number"
                  step={0.1}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Platelet Count (K/μL)</label>
                <input
                  value={investigation.plateletCount || ''}
                  onChange={(e) => handleInputChange('plateletCount', parseFloat(e.target.value) || 0)}
                  type="number"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
            </div>
            
            <h3 style={{ marginTop: '24px' }}>Electrolytes</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>Sodium (mEq/L)</label>
                <input
                  value={investigation.sodium || ''}
                  onChange={(e) => handleInputChange('sodium', parseFloat(e.target.value) || 0)}
                  type="number"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Potassium (mEq/L)</label>
                <input
                  value={investigation.potassium || ''}
                  onChange={(e) => handleInputChange('potassium', parseFloat(e.target.value) || 0)}
                  type="number"
                  step={0.1}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>Chloride (mEq/L)</label>
                <input
                  value={investigation.chloride || ''}
                  onChange={(e) => handleInputChange('chloride', parseFloat(e.target.value) || 0)}
                  type="number"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Bicarbonate (mEq/L)</label>
                <input
                  value={investigation.bicarbonate || ''}
                  onChange={(e) => handleInputChange('bicarbonate', parseFloat(e.target.value) || 0)}
                  type="number"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
              <h3>Renal Function</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>BUN (mg/dL)</label>
                  <input
                    value={investigation.bun || ''}
                    onChange={(e) => handleInputChange('bun', parseFloat(e.target.value) || 0)}
                    type="number"
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Creatinine (mg/dL)</label>
                  <input
                    value={investigation.creatinine || ''}
                    onChange={(e) => handleInputChange('creatinine', parseFloat(e.target.value) || 0)}
                    type="number"
                    step={0.1}
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label>Glucose (mg/dL)</label>
                <input
                  value={investigation.glucose || ''}
                  onChange={(e) => handleInputChange('glucose', parseFloat(e.target.value) || 0)}
                  type="number"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              
              <h3 style={{ marginTop: '24px' }}>Other Parameters</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Calcium (mg/dL)</label>
                  <input
                    value={investigation.calcium || ''}
                    onChange={(e) => handleInputChange('calcium', parseFloat(e.target.value) || 0)}
                    type="number"
                    step={0.1}
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Phosphorus (mg/dL)</label>
                  <input
                    value={investigation.phosphorus || ''}
                    onChange={(e) => handleInputChange('phosphorus', parseFloat(e.target.value) || 0)}
                    type="number"
                    step={0.1}
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Albumin (g/dL)</label>
                  <input
                    value={investigation.albumin || ''}
                    onChange={(e) => handleInputChange('albumin', parseFloat(e.target.value) || 0)}
                    type="number"
                    step={0.1}
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Total Protein (g/dL)</label>
                  <input
                    value={investigation.totalProtein || ''}
                    onChange={(e) => handleInputChange('totalProtein', parseFloat(e.target.value) || 0)}
                    type="number"
                    step={0.1}
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                  />
                </div>
              </div>
              
              <h3 style={{ marginTop: '24px' }}>Liver Function</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>ALT (U/L)</label>
                  <input
                    value={investigation.alt || ''}
                    onChange={(e) => handleInputChange('alt', parseFloat(e.target.value) || 0)}
                    type="number"
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>AST (U/L)</label>
                  <input
                    value={investigation.ast || ''}
                    onChange={(e) => handleInputChange('ast', parseFloat(e.target.value) || 0)}
                    type="number"
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label>Alkaline Phosphatase (U/L)</label>
                <input
                  value={investigation.alkalinePhosphatase || ''}
                  onChange={(e) => handleInputChange('alkalinePhosphatase', parseFloat(e.target.value) || 0)}
                  type="number"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label>Notes</label>
                <textarea
                  value={investigation.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Enter any additional notes about the investigation"
                  rows={4}
                  style={{ width: '100%', padding: '8px', marginTop: '4px', minHeight: '100px' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button type="submit" style={{ padding: '8px 16px' }}>Save Investigation</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NurseMonthlyInvestigation;