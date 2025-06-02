import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HeadingLarge, HeadingMedium } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Textarea } from 'baseui/textarea';
import { Checkbox } from 'baseui/checkbox';
import { toaster } from 'baseui/toast';
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
      toaster.negative('Please fill in all required fields', {});
      return;
    }

    if ((decision.aiSuggestions?.length ?? 0) > 0 && !decision.aiSuggestionsAcknowledged) {
      toaster.negative('Please acknowledge AI suggestions', {});
      return;
    }

    if (decision.aiSuggestionsOverridden && !decision.aiOverrideReason) {
      toaster.negative('Please provide a reason for overriding AI suggestions', {});
      return;
    }

    // In a real app, this would make an API call to save the decision
    console.log('Saving clinical decision:', decision);
    toaster.positive('Clinical decision saved successfully', {});

    // Reset form or redirect
    // For demo, we'll just show a success message
  };

  return (
    <Block>
      <HeadingLarge>Record Clinical Decision</HeadingLarge>
      <HeadingMedium>Patient ID: {id}</HeadingMedium>

      <form onSubmit={handleSubmit}>
        <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
          <Cell span={[4, 8, 6]}>
            <Block marginBottom="16px">
              <Card>
                <StyledBody>
                  <HeadingMedium>AI Predictions & Suggestions</HeadingMedium>

                  {aiPredictions.length > 0 ? (
                    aiPredictions.map(prediction => (
                      <Block
                        key={prediction.id}
                        marginBottom="16px"
                        padding="16px"
                        backgroundColor={
                          prediction.confidence > 0.8
                            ? 'rgba(255, 0, 0, 0.1)'
                            : prediction.confidence > 0.6
                            ? 'rgba(255, 165, 0, 0.1)'
                            : 'rgba(0, 0, 0, 0.03)'
                        }
                      >
                        <Block display="flex" justifyContent="space-between" alignItems="center">
                          <Block font="font500">{prediction.predictionType}</Block>
                          <Block font="font400">
                            Confidence: {(prediction.confidence * 100).toFixed(0)}%
                          </Block>
                        </Block>

                        <Block font="font400" marginTop="8px">
                          {prediction.prediction}
                        </Block>

                        <Block font="font500" marginTop="8px">
                          Suggested Action: {prediction.suggestedAction}
                        </Block>
                      </Block>
                    ))
                  ) : (
                    <Block>No AI predictions available</Block>
                  )}

                  {(decision.aiSuggestions?.length ?? 0) > 0 && (
                    <Block marginTop="16px">
                      <Checkbox
                        checked={acknowledgedAI}
                        onChange={handleAcknowledgeChange}
                        labelPlacement="right"
                      >
                        I acknowledge the AI suggestions
                      </Checkbox>

                      <Checkbox
                        checked={overrideAI}
                        onChange={handleOverrideChange}
                        labelPlacement="right"
                      >
                        I want to override the AI suggestions
                      </Checkbox>

                      {overrideAI && (
                        <FormControl label="Reason for Override *">
                          <Textarea
                            value={decision.aiOverrideReason}
                            onChange={e => handleInputChange('aiOverrideReason', e.currentTarget.value)}
                            placeholder="Explain why you are overriding the AI suggestions"
                            required={overrideAI}
                          />
                        </FormControl>
                      )}
                    </Block>
                  )}
                </StyledBody>
              </Card>
            </Block>

            <Card>
              <StyledBody>
                <HeadingMedium>Clinical Decision</HeadingMedium>

                <FormControl label="Date *">
                  <Input
                    value={decision.date}
                    onChange={e => handleInputChange('date', e.currentTarget.value)}
                    type="date"
                    required
                  />
                </FormControl>

                <FormControl label="Clinical Notes *">
                  <Textarea
                    value={decision.notes}
                    onChange={e => handleInputChange('notes', e.currentTarget.value)}
                    placeholder="Enter your clinical assessment and notes"
                    required
                  />
                </FormControl>

                <FormControl label="Prescription *">
                  <Textarea
                    value={decision.prescription}
                    onChange={e => handleInputChange('prescription', e.currentTarget.value)}
                    placeholder="Enter medication prescriptions and treatment plan"
                    required
                  />
                </FormControl>

                <FormControl label="Follow-up Date *">
                  <Input
                    value={decision.followUpDate}
                    onChange={e => handleInputChange('followUpDate', e.currentTarget.value)}
                    type="date"
                    required
                  />
                </FormControl>

                <Block display="flex" justifyContent="flex-end" marginTop="32px">
                  <Button type="submit">Save Decision</Button>
                </Block>
              </StyledBody>
            </Card>
          </Cell>
        </Grid>
      </form>
    </Block>
  );
};

export default DoctorClinicalDecisions;