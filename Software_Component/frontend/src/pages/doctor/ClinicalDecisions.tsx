import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ClinicalDecision, AIPrediction } from '../../types';

// Mock AI predictions
const mockAIPredictions: Record<string, AIPrediction[]> = {
  '101': [
    {
      id: 'ai101',
      patientId: '101',
      date: '2025-05-30',
      predictionType: 'Anemia Risk',
      prediction: 'High risk of developing anemia in the next 30 days',
      confidence: 0.85,
      suggestedAction: 'Consider ESA dose adjustment and iron supplementation',
      dataPoints: [
        { parameter: 'Hemoglobin', value: 11.2, trend: 'decreasing' },
        { parameter: 'Hematocrit', value: 33.6, trend: 'decreasing' },
        { parameter: 'Iron Saturation', value: 18, trend: 'decreasing' }
      ]
    },
    {
      id: 'ai102',
      patientId: '101',
      date: '2025-05-30',
      predictionType: 'Fluid Overload Risk',
      prediction: 'Moderate risk of fluid overload before next session',
      confidence: 0.72,
      suggestedAction: 'Consider sodium restriction and fluid intake counseling',
      dataPoints: [
        { parameter: 'Interdialytic Weight Gain', value: 3.1, trend: 'increasing' },
        { parameter: 'Blood Pressure', value: '145/92', trend: 'increasing' },
        { parameter: 'Reported Edema', value: 'mild', trend: 'stable' }
      ]
    }
  ]
};

const DoctorClinicalDecisions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [decision, setDecision] = useState<Partial<ClinicalDecision>>({
    patientId: id || '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    prescription: '',
    followUpDate: '',
    doctorId: '2', // In a real app, this would come from the logged-in user
    aiSuggestions: [],
    aiSuggestionsAcknowledged: false,
    aiSuggestionsOverridden: false,
    aiOverrideReason: ''
  });

  const [aiPredictions, setAIPredictions] = useState<AIPrediction[]>([]);
  const [acknowledgedAI, setAcknowledgedAI] = useState<boolean>(false);
  const [overrideAI, setOverrideAI] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      // In a real app, this would be an API call
      setAIPredictions(mockAIPredictions[id] || []);

      // Extract AI suggestions
      const suggestions = (mockAIPredictions[id] || []).map(p => p.suggestedAction);
      setDecision(prev => ({
        ...prev,
        aiSuggestions: suggestions
      }));
    }
  }, [id]);

  const handleInputChange = (field: keyof ClinicalDecision, value: any) => {
    setDecision(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAcknowledgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcknowledgedAI(e.target.checked);
    setDecision(prev => ({
      ...prev,
      aiSuggestionsAcknowledged: e.target.checked
    }));
  };

  const handleOverrideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOverrideAI(e.target.checked);
    setDecision(prev => ({
      ...prev,
      aiSuggestionsOverridden: e.target.checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!decision.notes || !decision.prescription || !decision.followUpDate) {
      alert('Please fill in all required fields');
      return;
    }

    if ((decision.aiSuggestions?.length ?? 0) > 0 && !decision.aiSuggestionsAcknowledged) {
      alert('Please acknowledge AI suggestions');
      return;
    }

    if (decision.aiSuggestionsOverridden && !decision.aiOverrideReason) {
      alert('Please provide a reason for overriding AI suggestions');
      return;
    }

    // In a real app, this would make an API call to save the decision
    console.log('Saving clinical decision:', decision);
    alert('Clinical decision saved successfully');

    // Reset form or redirect
    // For demo, we'll just show a success message
  };

  return (
    <div>
      <h1>Record Clinical Decision</h1>
      <h2>Patient ID: {id}</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
            <h3>AI Predictions & Suggestions</h3>

            {aiPredictions.length > 0 ? (
              aiPredictions.map(prediction => (
                <div
                  key={prediction.id}
                  style={{
                    marginBottom: '16px',
                    padding: '16px',
                    backgroundColor:
                      prediction.confidence > 0.8
                        ? 'rgba(255, 0, 0, 0.1)'
                        : prediction.confidence > 0.6
                        ? 'rgba(255, 165, 0, 0.1)'
                        : 'rgba(0, 0, 0, 0.03)',
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{prediction.predictionType}</strong>
                    <span>Confidence: {(prediction.confidence * 100).toFixed(0)}%</span>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    {prediction.prediction}
                  </div>

                  <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
                    Suggested Action: {prediction.suggestedAction}
                  </div>
                </div>
              ))
            ) : (
              <div>No AI predictions available</div>
            )}

            {(decision.aiSuggestions?.length ?? 0) > 0 && (
              <div style={{ marginTop: '16px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={acknowledgedAI}
                    onChange={handleAcknowledgeChange}
                  />
                  I acknowledge the AI suggestions
                </label>

                <br />

                <label>
                  <input
                    type="checkbox"
                    checked={overrideAI}
                    onChange={handleOverrideChange}
                  />
                  I want to override the AI suggestions
                </label>

                {overrideAI && (
                  <div style={{ marginTop: '8px' }}>
                    <label>Reason for Override *</label>
                    <textarea
                      value={decision.aiOverrideReason}
                      onChange={(e) => handleInputChange('aiOverrideReason', e.target.value)}
                      placeholder="Explain why you are overriding the AI suggestions"
                      required={overrideAI}
                      style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
          <h3>Clinical Decision</h3>

          <div style={{ marginBottom: '16px' }}>
            <label>Date *</label>
            <input
              value={decision.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              type="date"
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Clinical Notes *</label>
            <textarea
              value={decision.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter your clinical assessment and notes"
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px', minHeight: '100px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Prescription *</label>
            <textarea
              value={decision.prescription}
              onChange={(e) => handleInputChange('prescription', e.target.value)}
              placeholder="Enter medication prescriptions and treatment plan"
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px', minHeight: '100px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Follow-up Date *</label>
            <input
              value={decision.followUpDate}
              onChange={(e) => handleInputChange('followUpDate', e.target.value)}
              type="date"
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button type="submit" style={{ padding: '8px 16px' }}>Save Decision</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DoctorClinicalDecisions;