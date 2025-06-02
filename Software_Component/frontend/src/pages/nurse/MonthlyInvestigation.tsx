import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { HeadingLarge, HeadingMedium } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Textarea } from 'baseui/textarea';
import { toaster } from 'baseui/toast';
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
      toaster.negative('Please fill in all required fields', {});
      return;
    }

    console.log('Saving monthly investigation:', investigation);
    toaster.positive('Monthly investigation saved successfully', {});
  };

  return (
    <Block>
      <HeadingLarge>New Monthly Investigation</HeadingLarge>
      <HeadingMedium>Patient ID: {id}</HeadingMedium>
      
      <form onSubmit={handleSubmit}>
        <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
          <Cell span={[4, 8, 6]}>
            <Card>
              <StyledBody>
                <HeadingMedium>Investigation Details</HeadingMedium>
                
                <FormControl label="Date *">
                  <Input
                    value={investigation.date}
                    onChange={e => handleInputChange('date', e.currentTarget.value)}
                    type="date"
                  />
                </FormControl>
                
                <HeadingMedium marginTop="24px">Complete Blood Count</HeadingMedium>
                
                <Block display="flex" justifyContent="space-between">
                  <Block width="48%">
                    <FormControl label="Hemoglobin (g/dL)">
                      <Input
                        value={investigation.hemoglobin || ''}
                        onChange={e => handleInputChange('hemoglobin', parseFloat(e.currentTarget.value) || 0)}
                        type="number"
                        step={0.1}
                      />
                    </FormControl>
                  </Block>
                  <Block width="48%">
                    <FormControl label="Hematocrit (%)">
                      <Input
                        value={investigation.hematocrit || ''}
                        onChange={e => handleInputChange('hematocrit', parseFloat(e.currentTarget.value) || 0)}
                        type="number"
                        step={0.1}
                      />
                    </FormControl>
                  </Block>
                </Block>
                
                <Block display="flex" justifyContent="space-between">
                  <Block width="48%">
                    <FormControl label="White Blood Cell Count (K/μL)">
                      <Input
                        value={investigation.whiteBloodCellCount || ''}
                        onChange={e => handleInputChange('whiteBloodCellCount', parseFloat(e.currentTarget.value) || 0)}
                        type="number"
                        step={0.1}
                      />
                    </FormControl>
                  </Block>
                  <Block width="48%">
                    <FormControl label="Platelet Count (K/μL)">
                      <Input
                        value={investigation.plateletCount || ''}
                        onChange={e => handleInputChange('plateletCount', parseFloat(e.currentTarget.value) || 0)}
                        type="number"
                      />
                    </FormControl>
                  </Block>
                </Block>
                
                <HeadingMedium marginTop="24px">Electrolytes</HeadingMedium>
                
                <Block display="flex" justifyContent="space-between">
                  <Block width="48%">
                    <FormControl label="Sodium (mEq/L)">
                      <Input
                        value={investigation.sodium || ''}
                        onChange={e => handleInputChange('sodium', parseFloat(e.currentTarget.value) || 0)}
                        type="number"
                      />
                    </FormControl>
                  </Block>
                  <Block width="48%">
                    <FormControl label="Potassium (mEq/L)">
                      <Input
                        value={investigation.potassium || ''}
                        onChange={e => handleInputChange('potassium', parseFloat(e.currentTarget.value) || 0)}
                        type="number"
                        step={0.1}
                      />
                    </FormControl>
                  </Block>
                </Block>
                
                <Block display="flex" justifyContent="space-between">
                  <Block width="48%">
                    <FormControl label="Chloride (mEq/L)">
                      <Input
                        value={investigation.chloride || ''}
                        onChange={e => handleInputChange('chloride', parseFloat(e.currentTarget.value) || 0)}
                        type="number"
                      />
                    </FormControl>
                  </Block>
                  <Block width="48%">
                    <FormControl label="Bicarbonate (mEq/L)">
                      <Input
                        value={investigation.bicarbonate || ''}
                        onChange={e => handleInputChange('bicarbonate', parseFloat(e.currentTarget.value) || 0)}
                        type="number"
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
                  <HeadingMedium>Renal Function</HeadingMedium>
                  
                  <Block display="flex" justifyContent="space-between">
                    <Block width="48%">
                      <FormControl label="BUN (mg/dL)">
                        <Input
                          value={investigation.bun || ''}
                          onChange={e => handleInputChange('bun', parseFloat(e.currentTarget.value) || 0)}
                          type="number"
                        />
                      </FormControl>
                    </Block>
                    <Block width="48%">
                      <FormControl label="Creatinine (mg/dL)">
                        <Input
                          value={investigation.creatinine || ''}
                          onChange={e => handleInputChange('creatinine', parseFloat(e.currentTarget.value) || 0)}
                          type="number"
                          step={0.1}
                        />
                      </FormControl>
                    </Block>
                  </Block>
                  
                  <FormControl label="Glucose (mg/dL)">
                    <Input
                      value={investigation.glucose || ''}
                      onChange={e => handleInputChange('glucose', parseFloat(e.currentTarget.value) || 0)}
                      type="number"
                    />
                  </FormControl>
                  
                  <HeadingMedium marginTop="24px">Other Parameters</HeadingMedium>
                  
                  <Block display="flex" justifyContent="space-between">
                    <Block width="48%">
                      <FormControl label="Calcium (mg/dL)">
                        <Input
                          value={investigation.calcium || ''}
                          onChange={e => handleInputChange('calcium', parseFloat(e.currentTarget.value) || 0)}
                          type="number"
                          step={0.1}
                        />
                      </FormControl>
                    </Block>
                    <Block width="48%">
                      <FormControl label="Phosphorus (mg/dL)">
                        <Input
                          value={investigation.phosphorus || ''}
                          onChange={e => handleInputChange('phosphorus', parseFloat(e.currentTarget.value) || 0)}
                          type="number"
                          step={0.1}
                        />
                      </FormControl>
                    </Block>
                  </Block>
                  
                  <Block display="flex" justifyContent="space-between">
                    <Block width="48%">
                      <FormControl label="Albumin (g/dL)">
                        <Input
                          value={investigation.albumin || ''}
                          onChange={e => handleInputChange('albumin', parseFloat(e.currentTarget.value) || 0)}
                          type="number"
                          step={0.1}
                        />
                      </FormControl>
                    </Block>
                    <Block width="48%">
                      <FormControl label="Total Protein (g/dL)">
                        <Input
                          value={investigation.totalProtein || ''}
                          onChange={e => handleInputChange('totalProtein', parseFloat(e.currentTarget.value) || 0)}
                          type="number"
                          step={0.1}
                        />
                      </FormControl>
                    </Block>
                  </Block>
                  
                  <HeadingMedium marginTop="24px">Liver Function</HeadingMedium>
                  
                  <Block display="flex" justifyContent="space-between">
                    <Block width="48%">
                      <FormControl label="ALT (U/L)">
                        <Input
                          value={investigation.alt || ''}
                          onChange={e => handleInputChange('alt', parseFloat(e.currentTarget.value) || 0)}
                          type="number"
                        />
                      </FormControl>
                    </Block>
                    <Block width="48%">
                      <FormControl label="AST (U/L)">
                        <Input
                          value={investigation.ast || ''}
                          onChange={e => handleInputChange('ast', parseFloat(e.currentTarget.value) || 0)}
                          type="number"
                        />
                      </FormControl>
                    </Block>
                  </Block>
                  
                  <FormControl label="Alkaline Phosphatase (U/L)">
                    <Input
                      value={investigation.alkalinePhosphatase || ''}
                      onChange={e => handleInputChange('alkalinePhosphatase', parseFloat(e.currentTarget.value) || 0)}
                      type="number"
                    />
                  </FormControl>
                  
                  <FormControl label="Notes" caption="Any additional observations">
                    <Textarea
                      value={investigation.notes}
                      onChange={e => handleInputChange('notes', e.currentTarget.value)}
                      placeholder="Enter any additional notes about the investigation"
                    />
                  </FormControl>
                  
                  <Block display="flex" justifyContent="flex-end" marginTop="32px">
                    <Button type="submit">Save Investigation</Button>
                  </Block>
                </StyledBody>
              </Card>
            </Block>
          </Cell>
        </Grid>
      </form>
    </Block>
  );
};

export default NurseMonthlyInvestigation;