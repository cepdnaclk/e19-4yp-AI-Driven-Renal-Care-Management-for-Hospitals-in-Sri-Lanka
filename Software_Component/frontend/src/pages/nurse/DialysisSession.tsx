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
import { DialysisSession } from '../../types';

const NurseDialysisSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Partial<DialysisSession>>({
    patientId: id || '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    preWeight: 0,
    postWeight: 0,
    ufGoal: 0,
    bloodPressurePre: '',
    bloodPressurePost: '',
    heartRatePre: 0,
    heartRatePost: 0,
    temperaturePre: 0,
    temperaturePost: 0,
    symptoms: [],
    complications: [],
    notes: '',
    nurseId: '1' // In a real app, this would come from the logged-in user
  });

  const [availableSymptoms] = useState([
    'Fatigue',
    'Headache',
    'Nausea',
    'Vomiting',
    'Muscle cramps',
    'Dizziness',
    'Chest pain',
    'Shortness of breath',
    'Itching'
  ]);

  const [availableComplications] = useState([
    'Hypotension',
    'Hypertension',
    'Arrhythmia',
    'Clotting',
    'Bleeding',
    'Air embolism',
    'Hemolysis',
    'Dialyzer reaction',
    'Access issues'
  ]);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedComplications, setSelectedComplications] = useState<string[]>([]);

  useEffect(() => {
    // Update session when symptoms or complications change
    setSession(prev => ({
      ...prev,
      symptoms: selectedSymptoms,
      complications: selectedComplications
    }));
  }, [selectedSymptoms, selectedComplications]);

  const handleInputChange = (field: keyof DialysisSession, value: any) => {
    setSession(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleComplicationToggle = (complication: string) => {
    setSelectedComplications(prev => 
      prev.includes(complication)
        ? prev.filter(c => c !== complication)
        : [...prev, complication]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!session.date || !session.startTime || !session.preWeight) {
      toaster.negative('Please fill in all required fields', {});
      return;
    }

    // In a real app, this would make an API call to save the session
    console.log('Saving dialysis session:', session);
    toaster.positive('Dialysis session saved successfully', {});
    
    // Reset form or redirect
    // For demo, we'll just show a success message
  };

  return (
    <Block>
      <HeadingLarge>New Dialysis Session</HeadingLarge>
      <HeadingMedium>Patient ID: {id}</HeadingMedium>
      
      <form onSubmit={handleSubmit}>
        <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
          <Cell span={[4, 8, 6]}>
            <Card>
              <StyledBody>
                <HeadingMedium>Session Details</HeadingMedium>
                
                <FormControl label="Date *">
                  <Input
                    value={session.date}
                    onChange={e => handleInputChange('date', e.currentTarget.value)}
                    type="date"
                  />
                </FormControl>
                
                <Block display="flex" justifyContent="space-between">
                  <Block width="48%">
                    <FormControl label="Start Time *">
                      <Input
                        value={session.startTime}
                        onChange={e => handleInputChange('startTime', e.currentTarget.value)}
                        type="time"
                      />
                    </FormControl>
                  </Block>
                  <Block width="48%">
                    <FormControl label="End Time">
                      <Input
                        value={session.endTime}
                        onChange={e => handleInputChange('endTime', e.currentTarget.value)}
                        type="time"
                      />
                    </FormControl>
                  </Block>
                </Block>
                
                <Block display="flex" justifyContent="space-between">
                  <Block width="48%">
                    <FormControl label="Pre-Weight (kg) *">
                      <Input
                        value={session.preWeight || ''}
                        onChange={e => handleInputChange('preWeight', parseFloat(e.currentTarget.value) || 0)}
                        type="number"
                        step={0.1}
                      />
                    </FormControl>
                  </Block>
                  <Block width="48%">
                    <FormControl label="Post-Weight (kg)">
                      <Input
                        value={session.postWeight || ''}
                        onChange={e => handleInputChange('postWeight', parseFloat(e.currentTarget.value) || 0)}
                        type="number"
                        step={0.1}
                      />
                    </FormControl>
                  </Block>
                </Block>
                
                <FormControl label="UF Goal (L)">
                  <Input
                    value={session.ufGoal || ''}
                    onChange={e => handleInputChange('ufGoal', parseFloat(e.currentTarget.value) || 0)}
                    type="number"
                    step={0.1}
                  />
                </FormControl>
                
                <Block display="flex" justifyContent="space-between">
                  <Block width="48%">
                    <FormControl label="Blood Pressure Pre (e.g., 120/80) *">
                      <Input
                        value={session.bloodPressurePre}
                        onChange={e => handleInputChange('bloodPressurePre', e.currentTarget.value)}
                        placeholder="e.g., 120/80"
                      />
                    </FormControl>
                  </Block>
                  <Block width="48%">
                    <FormControl label="Blood Pressure Post">
                      <Input
                        value={session.bloodPressurePost}
                        onChange={e => handleInputChange('bloodPressurePost', e.currentTarget.value)}
                        placeholder="e.g., 120/80"
                      />
                    </FormControl>
                  </Block>
                </Block>
                
                <Block display="flex" justifyContent="space-between">
                  <Block width="48%">
                    <FormControl label="Heart Rate Pre (bpm) *">
                      <Input
                        value={session.heartRatePre || ''}
                        onChange={e => handleInputChange('heartRatePre', parseInt(e.currentTarget.value) || 0)}
                        type="number"
                      />
                    </FormControl>
                  </Block>
                  <Block width="48%">
                    <FormControl label="Heart Rate Post (bpm)">
                      <Input
                        value={session.heartRatePost || ''}
                        onChange={e => handleInputChange('heartRatePost', parseInt(e.currentTarget.value) || 0)}
                        type="number"
                      />
                    </FormControl>
                  </Block>
                </Block>
                
                <Block display="flex" justifyContent="space-between">
                  <Block width="48%">
                    <FormControl label="Temperature Pre (°C) *">
                      <Input
                        value={session.temperaturePre || ''}
                        onChange={e => handleInputChange('temperaturePre', parseFloat(e.currentTarget.value) || 0)}
                        type="number"
                        step={0.1}
                      />
                    </FormControl>
                  </Block>
                  <Block width="48%">
                    <FormControl label="Temperature Post (°C)">
                      <Input
                        value={session.temperaturePost || ''}
                        onChange={e => handleInputChange('temperaturePost', parseFloat(e.currentTarget.value) || 0)}
                        type="number"
                        step={0.1}
                      />
                    </FormControl>
                  </Block>
                </Block>
              </StyledBody>
            </Card>
          </Cell>
          
          <Cell span={[4, 8, 6]}>
            <Block marginBottom="16px">
              <Card>
                <StyledBody>
                  <HeadingMedium>Symptoms & Complications</HeadingMedium>
                  
                  <FormControl label="Symptoms">
                    <Block>
                      {availableSymptoms.map(symptom => (
                        <Checkbox
                          key={symptom}
                          checked={selectedSymptoms.includes(symptom)}
                          onChange={() => handleSymptomToggle(symptom)}
                          labelPlacement="right"
                        >
                          {symptom}
                        </Checkbox>
                      ))}
                    </Block>
                  </FormControl>
                  
                  <FormControl label="Complications">
                    <Block>
                      {availableComplications.map(complication => (
                        <Checkbox
                          key={complication}
                          checked={selectedComplications.includes(complication)}
                          onChange={() => handleComplicationToggle(complication)}
                          labelPlacement="right"
                        >
                          {complication}
                        </Checkbox>
                      ))}
                    </Block>
                  </FormControl>
                </StyledBody>
              </Card>
            </Block>
            
            <Card>
              <StyledBody>
                <FormControl label="Notes">
                  <Textarea
                    value={session.notes}
                    onChange={e => handleInputChange('notes', e.currentTarget.value)}
                    placeholder="Enter any additional notes about the session"
                  />
                </FormControl>
                
                <Block display="flex" justifyContent="flex-end" marginTop="32px">
                  <Button type="submit">Save Session</Button>
                </Block>
              </StyledBody>
            </Card>
          </Cell>
        </Grid>
      </form>
    </Block>
  );
};

export default NurseDialysisSession;