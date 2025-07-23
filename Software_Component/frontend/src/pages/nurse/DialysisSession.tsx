import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeadingLarge, HeadingMedium } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Textarea } from 'baseui/textarea';
import { Checkbox } from 'baseui/checkbox';
import { Select } from 'baseui/select';
import { toaster } from 'baseui/toast';
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
      toaster.negative('Please fill in all required fields', { autoHideDuration: 3000 });
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
      toaster.positive('Dialysis session saved successfully', { autoHideDuration: 3000 });
      
      // Redirect back to patient profile
      navigate(`/nurse/patients/${id}`);
      
    } catch (error: any) {
      console.error('Error saving session:', error);
      toaster.negative(
        error.response?.data?.message || 'Failed to save dialysis session', 
        { autoHideDuration: 3000 }
      );
    } finally {
      setLoading(false);
    }
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
              </StyledBody>
            </Card>
          </Cell>

          <Cell span={[4, 8, 6]}>
            <Card>
              <StyledBody>
                <HeadingMedium>Pre-Dialysis Measurements</HeadingMedium>
                
                <FormControl label="Weight (kg) *">
                  <Input
                    value={session.preDialysis.weight || ''}
                    onChange={e => handleInputChange('preDialysis.weight', parseFloat(e.currentTarget.value) || 0)}
                    type="number"
                    step={0.1}
                  />
                </FormControl>
                
                <Block display="flex" justifyContent="space-between">
                  <Block width="48%">
                    <FormControl label="Systolic BP *">
                      <Input
                        value={session.preDialysis.bloodPressure.systolic || ''}
                        onChange={e => handleInputChange('preDialysis.bloodPressure.systolic', parseInt(e.currentTarget.value) || 0)}
                        type="number"
                        placeholder="e.g., 120"
                      />
                    </FormControl>
                  </Block>
                  <Block width="48%">
                    <FormControl label="Diastolic BP *">
                      <Input
                        value={session.preDialysis.bloodPressure.diastolic || ''}
                        onChange={e => handleInputChange('preDialysis.bloodPressure.diastolic', parseInt(e.currentTarget.value) || 0)}
                        type="number"
                        placeholder="e.g., 80"
                      />
                    </FormControl>
                  </Block>
                </Block>
                
                <FormControl label="Heart Rate (bpm) *">
                  <Input
                    value={session.preDialysis.heartRate || ''}
                    onChange={e => handleInputChange('preDialysis.heartRate', parseInt(e.currentTarget.value) || 0)}
                    type="number"
                  />
                </FormControl>
                
                <FormControl label="Temperature (°C) *">
                  <Input
                    value={session.preDialysis.temperature || ''}
                    onChange={e => handleInputChange('preDialysis.temperature', parseFloat(e.currentTarget.value) || 0)}
                    type="number"
                    step={0.1}
                  />
                </FormControl>
              </StyledBody>
            </Card>
          </Cell>

          <Cell span={[4, 8, 6]}>
            <Card>
              <StyledBody>
                <HeadingMedium>Post-Dialysis Measurements</HeadingMedium>
                
                <FormControl label="Weight (kg)">
                  <Input
                    value={session.postDialysis.weight || ''}
                    onChange={e => handleInputChange('postDialysis.weight', parseFloat(e.currentTarget.value) || 0)}
                    type="number"
                    step={0.1}
                  />
                </FormControl>
                
                <Block display="flex" justifyContent="space-between">
                  <Block width="48%">
                    <FormControl label="Systolic BP">
                      <Input
                        value={session.postDialysis.bloodPressure.systolic || ''}
                        onChange={e => handleInputChange('postDialysis.bloodPressure.systolic', parseInt(e.currentTarget.value) || 0)}
                        type="number"
                        placeholder="e.g., 120"
                      />
                    </FormControl>
                  </Block>
                  <Block width="48%">
                    <FormControl label="Diastolic BP">
                      <Input
                        value={session.postDialysis.bloodPressure.diastolic || ''}
                        onChange={e => handleInputChange('postDialysis.bloodPressure.diastolic', parseInt(e.currentTarget.value) || 0)}
                        type="number"
                        placeholder="e.g., 80"
                      />
                    </FormControl>
                  </Block>
                </Block>
                
                <FormControl label="Heart Rate (bpm)">
                  <Input
                    value={session.postDialysis.heartRate || ''}
                    onChange={e => handleInputChange('postDialysis.heartRate', parseInt(e.currentTarget.value) || 0)}
                    type="number"
                  />
                </FormControl>
                
                <FormControl label="Temperature (°C)">
                  <Input
                    value={session.postDialysis.temperature || ''}
                    onChange={e => handleInputChange('postDialysis.temperature', parseFloat(e.currentTarget.value) || 0)}
                    type="number"
                    step={0.1}
                  />
                </FormControl>
              </StyledBody>
            </Card>
          </Cell>

          <Cell span={[4, 8, 6]}>
            <Card>
              <StyledBody>
                <HeadingMedium>Dialysis Parameters</HeadingMedium>
                
                <FormControl label="UF Goal (L) *">
                  <Input
                    value={session.dialysisParameters.ufGoal || ''}
                    onChange={e => handleInputChange('dialysisParameters.ufGoal', parseFloat(e.currentTarget.value) || 0)}
                    type="number"
                    step={0.1}
                  />
                </FormControl>
                
                <FormControl label="UF Achieved (L)">
                  <Input
                    value={session.dialysisParameters.ufAchieved || ''}
                    onChange={e => handleInputChange('dialysisParameters.ufAchieved', parseFloat(e.currentTarget.value) || 0)}
                    type="number"
                    step={0.1}
                  />
                </FormControl>
                
                <FormControl label="Blood Flow (mL/min)">
                  <Input
                    value={session.dialysisParameters.bloodFlow || ''}
                    onChange={e => handleInputChange('dialysisParameters.bloodFlow', parseInt(e.currentTarget.value) || 0)}
                    type="number"
                  />
                </FormControl>
                
                <FormControl label="Dialysate Flow (mL/min)">
                  <Input
                    value={session.dialysisParameters.dialysateFlow || ''}
                    onChange={e => handleInputChange('dialysisParameters.dialysateFlow', parseInt(e.currentTarget.value) || 0)}
                    type="number"
                  />
                </FormControl>
              </StyledBody>
            </Card>
          </Cell>

          <Cell span={[4, 8, 6]}>
            <Card>
              <StyledBody>
                <HeadingMedium>Vascular Access</HeadingMedium>
                
                <FormControl label="Access Type *">
                  <Select
                    options={accessTypes}
                    value={accessTypes.filter(option => option.value === session.vascularAccess.type)}
                    onChange={params => handleInputChange('vascularAccess.type', params.value[0]?.value || '')}
                    placeholder="Select access type"
                  />
                </FormControl>
                
                <FormControl label="Access Site *">
                  <Input
                    value={session.vascularAccess.site}
                    onChange={e => handleInputChange('vascularAccess.site', e.currentTarget.value)}
                    placeholder="e.g., Right Forearm, Left Internal Jugular"
                  />
                </FormControl>
              </StyledBody>
            </Card>
          </Cell>

          <Cell span={[4, 8, 6]}>
            <Card>
              <StyledBody>
                <HeadingMedium>Adequacy Parameters</HeadingMedium>
                
                <FormControl label="Kt/V">
                  <Input
                    value={session.adequacyParameters.ktv || ''}
                    onChange={e => handleInputChange('adequacyParameters.ktv', parseFloat(e.currentTarget.value) || 0)}
                    type="number"
                    step={0.01}
                  />
                </FormControl>
                
                <FormControl label="URR (%)">
                  <Input
                    value={session.adequacyParameters.urr || ''}
                    onChange={e => handleInputChange('adequacyParameters.urr', parseFloat(e.currentTarget.value) || 0)}
                    type="number"
                    step={0.1}
                  />
                </FormControl>
              </StyledBody>
            </Card>
          </Cell>

          <Cell span={[4, 8, 12]}>
            <Card>
              <StyledBody>
                <HeadingMedium>Complications</HeadingMedium>
                
                <Block display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gridGap="8px">
                  {availableComplications.map(complication => (
                    <Checkbox
                      key={complication}
                      checked={selectedComplications.includes(complication)}
                      onChange={() => handleComplicationToggle(complication)}
                    >
                      {complication}
                    </Checkbox>
                  ))}
                </Block>
              </StyledBody>
            </Card>
          </Cell>

          <Cell span={[4, 8, 12]}>
            <Card>
              <StyledBody>
                <FormControl label="Notes">
                  <Textarea
                    value={session.notes}
                    onChange={e => handleInputChange('notes', e.currentTarget.value)}
                    placeholder="Enter any additional notes about the session"
                    rows={4}
                  />
                </FormControl>
                
                <Block display="flex" justifyContent="flex-end" marginTop="32px">
                  <Block marginRight="16px">
                    <Button
                      kind="secondary"
                      onClick={() => navigate(`/nurse/patients/${id}`)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Block>
                  <Button 
                    type="submit" 
                    isLoading={loading}
                    disabled={loading}
                  >
                    Save Session
                  </Button>
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