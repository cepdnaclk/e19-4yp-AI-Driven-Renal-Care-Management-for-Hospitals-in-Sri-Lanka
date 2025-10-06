import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface DialysisSessionForm {
  date: string;
  startTime: string;
  endTime: string;
  preDialysis: {
    weight: number;
    bloodPressure: {
      systolic: number;
      diastolic: number;
    };
    heartRate: number;
    temperature: number;
  };
  postDialysis: {
    weight: number;
    bloodPressure: {
      systolic: number;
      diastolic: number;
    };
    heartRate: number;
    temperature: number;
  };
  dialysisParameters: {
    ufGoal: number;
    ufAchieved: number;
    bloodFlow: number;
    dialysateFlow: number;
  };
  adequacyParameters: {
    ktv: number;
    urr: number;
  };
  vascularAccess: {
    type: string;
    site: string;
  };
  complications: string[];
  notes: string;
}

const NurseDialysisSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('userToken');
  
  const [session, setSession] = useState<DialysisSessionForm>({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    preDialysis: {
      weight: 0,
      bloodPressure: {
        systolic: 0,
        diastolic: 0
      },
      heartRate: 0,
      temperature: 0
    },
    postDialysis: {
      weight: 0,
      bloodPressure: {
        systolic: 0,
        diastolic: 0
      },
      heartRate: 0,
      temperature: 0
    },
    dialysisParameters: {
      ufGoal: 0,
      ufAchieved: 0,
      bloodFlow: 0,
      dialysateFlow: 0
    },
    adequacyParameters: {
      ktv: 0,
      urr: 0
    },
    vascularAccess: {
      type: '',
      site: ''
    },
    complications: [],
    notes: ''
  });

  const [selectedComplications, setSelectedComplications] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const accessTypes = [
    { label: 'Arteriovenous Fistula (AVF)', value: 'AVF' },
    { label: 'Arteriovenous Graft (AVG)', value: 'AVG' },
    { label: 'Central Catheter', value: 'CENTRAL_CATHETER' },
    { label: 'Peritoneal Catheter', value: 'PERITONEAL_CATHETER' }
  ];

  const availableComplications = [
    'Hypotension',
    'Hypertension', 
    'Arrhythmia',
    'Clotting',
    'Bleeding',
    'Air embolism',
    'Hemolysis',
    'Dialyzer reaction',
    'Access issues'
  ];

  useEffect(() => {
    setSession(prev => ({
      ...prev,
      complications: selectedComplications
    }));
  }, [selectedComplications]);

  const handleInputChange = (field: string, value: any) => {
    const fieldParts = field.split('.');
    
    if (fieldParts.length === 1) {
      setSession(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (fieldParts.length === 2) {
      setSession(prev => {
        const key = fieldParts[0] as keyof DialysisSessionForm;
        const nestedObj = prev[key];
        if (typeof nestedObj === 'object' && nestedObj !== null) {
          return {
            ...prev,
            [key]: {
              ...nestedObj,
              [fieldParts[1]]: value
            }
          };
        }
        return prev;
      });
    } else if (fieldParts.length === 3) {
      setSession(prev => {
        const key = fieldParts[0] as keyof DialysisSessionForm;
        const nestedObj = prev[key];
        if (typeof nestedObj === 'object' && nestedObj !== null) {
          const deepNestedObj = (nestedObj as any)[fieldParts[1]];
          if (typeof deepNestedObj === 'object' && deepNestedObj !== null) {
            return {
              ...prev,
              [key]: {
                ...nestedObj,
                [fieldParts[1]]: {
                  ...deepNestedObj,
                  [fieldParts[2]]: value
                }
              }
            };
          }
        }
        return prev;
      });
    }
  };

  const handleComplicationToggle = (complication: string) => {
    setSelectedComplications(prev => 
      prev.includes(complication)
        ? prev.filter(c => c !== complication)
        : [...prev, complication]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!session.date || !session.startTime || !session.preDialysis.weight || 
        !session.preDialysis.bloodPressure.systolic || !session.preDialysis.bloodPressure.diastolic ||
        !session.preDialysis.heartRate || !session.preDialysis.temperature ||
        !session.dialysisParameters.ufGoal || !session.vascularAccess.type || !session.vascularAccess.site) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/dialysis-sessions/${id}`, session, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Session created:', response.data);
      alert('Dialysis session saved successfully');
      
      // Redirect back to patient profile
      navigate(`/nurse/patients/${id}`);
      
    } catch (error: any) {
      console.error('Error saving session:', error);
      alert(error.response?.data?.message || 'Failed to save dialysis session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>New Dialysis Session</h1>
      <h2>Patient ID: {id}</h2>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
            <h3>Session Details</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Date *</label>
              <input
                value={session.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                type="date"
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>Start Time *</label>
                <input
                  value={session.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  type="time"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>End Time</label>
                <input
                  value={session.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  type="time"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
            <h3>Pre-Dialysis Measurements</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Weight (kg) *</label>
              <input
                value={session.preDialysis.weight || ''}
                onChange={(e) => handleInputChange('preDialysis.weight', parseFloat(e.target.value) || 0)}
                type="number"
                step={0.1}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>Systolic BP *</label>
                <input
                  value={session.preDialysis.bloodPressure.systolic || ''}
                  onChange={(e) => handleInputChange('preDialysis.bloodPressure.systolic', parseInt(e.target.value) || 0)}
                  type="number"
                  placeholder="e.g., 120"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Diastolic BP *</label>
                <input
                  value={session.preDialysis.bloodPressure.diastolic || ''}
                  onChange={(e) => handleInputChange('preDialysis.bloodPressure.diastolic', parseInt(e.target.value) || 0)}
                  type="number"
                  placeholder="e.g., 80"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Heart Rate (bpm) *</label>
              <input
                value={session.preDialysis.heartRate || ''}
                onChange={(e) => handleInputChange('preDialysis.heartRate', parseInt(e.target.value) || 0)}
                type="number"
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Temperature (°C) *</label>
              <input
                value={session.preDialysis.temperature || ''}
                onChange={(e) => handleInputChange('preDialysis.temperature', parseFloat(e.target.value) || 0)}
                type="number"
                step={0.1}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
          </div>

          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
            <h3>Post-Dialysis Measurements</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Weight (kg)</label>
              <input
                value={session.postDialysis.weight || ''}
                onChange={(e) => handleInputChange('postDialysis.weight', parseFloat(e.target.value) || 0)}
                type="number"
                step={0.1}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>Systolic BP</label>
                <input
                  value={session.postDialysis.bloodPressure.systolic || ''}
                  onChange={(e) => handleInputChange('postDialysis.bloodPressure.systolic', parseInt(e.target.value) || 0)}
                  type="number"
                  placeholder="e.g., 120"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Diastolic BP</label>
                <input
                  value={session.postDialysis.bloodPressure.diastolic || ''}
                  onChange={(e) => handleInputChange('postDialysis.bloodPressure.diastolic', parseInt(e.target.value) || 0)}
                  type="number"
                  placeholder="e.g., 80"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Heart Rate (bpm)</label>
              <input
                value={session.postDialysis.heartRate || ''}
                onChange={(e) => handleInputChange('postDialysis.heartRate', parseInt(e.target.value) || 0)}
                type="number"
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Temperature (°C)</label>
              <input
                value={session.postDialysis.temperature || ''}
                onChange={(e) => handleInputChange('postDialysis.temperature', parseFloat(e.target.value) || 0)}
                type="number"
                step={0.1}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
          </div>

          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
            <h3>Dialysis Parameters</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>UF Goal (L) *</label>
              <input
                value={session.dialysisParameters.ufGoal || ''}
                onChange={(e) => handleInputChange('dialysisParameters.ufGoal', parseFloat(e.target.value) || 0)}
                type="number"
                step={0.1}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>UF Achieved (L)</label>
              <input
                value={session.dialysisParameters.ufAchieved || ''}
                onChange={(e) => handleInputChange('dialysisParameters.ufAchieved', parseFloat(e.target.value) || 0)}
                type="number"
                step={0.1}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Blood Flow (mL/min)</label>
              <input
                value={session.dialysisParameters.bloodFlow || ''}
                onChange={(e) => handleInputChange('dialysisParameters.bloodFlow', parseInt(e.target.value) || 0)}
                type="number"
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Dialysate Flow (mL/min)</label>
              <input
                value={session.dialysisParameters.dialysateFlow || ''}
                onChange={(e) => handleInputChange('dialysisParameters.dialysateFlow', parseInt(e.target.value) || 0)}
                type="number"
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
          </div>

          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
            <h3>Vascular Access</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Access Type *</label>
              <select
                value={session.vascularAccess.type}
                onChange={(e) => handleInputChange('vascularAccess.type', e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              >
                <option value="">Select access type</option>
                {accessTypes.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Access Site *</label>
              <input
                value={session.vascularAccess.site}
                onChange={(e) => handleInputChange('vascularAccess.site', e.target.value)}
                placeholder="e.g., Right Forearm, Left Internal Jugular"
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
          </div>

          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
            <h3>Adequacy Parameters</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Kt/V</label>
              <input
                value={session.adequacyParameters.ktv || ''}
                onChange={(e) => handleInputChange('adequacyParameters.ktv', parseFloat(e.target.value) || 0)}
                type="number"
                step={0.01}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>URR (%)</label>
              <input
                value={session.adequacyParameters.urr || ''}
                onChange={(e) => handleInputChange('adequacyParameters.urr', parseFloat(e.target.value) || 0)}
                type="number"
                step={0.1}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
          </div>

          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', gridColumn: '1 / -1' }}>
            <h3>Complications</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {availableComplications.map(complication => (
                <label key={complication} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedComplications.includes(complication)}
                    onChange={() => handleComplicationToggle(complication)}
                    style={{ marginRight: '8px' }}
                  />
                  {complication}
                </label>
              ))}
            </div>
          </div>

          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', gridColumn: '1 / -1' }}>
            <label>Notes</label>
            <textarea
              value={session.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes about the session"
              rows={4}
              style={{ width: '100%', padding: '8px', marginTop: '4px', minHeight: '100px' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => navigate(`/nurse/patients/${id}`)}
                disabled={loading}
                style={{ padding: '8px 16px', backgroundColor: '#f0f0f0' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                style={{ padding: '8px 16px' }}
              >
                {loading ? 'Saving...' : 'Save Session'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NurseDialysisSession;