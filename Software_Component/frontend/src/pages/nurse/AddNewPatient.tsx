import React, { useState } from 'react';
import {
  useStyletron,
  styled,
  ThemeProvider,
  createTheme,
  darkThemePrimitives
} from 'baseui';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Textarea } from 'baseui/textarea';
import { Select, TYPE } from 'baseui/select';
import { DatePicker } from 'baseui/datepicker';
import { Radio, RadioGroup } from 'baseui/radio';
import { Button } from 'baseui/button';
import { Block } from 'baseui/block';
import { Card } from 'baseui/card';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, SIZE } from 'baseui/modal';
import { Plus, Delete } from 'baseui/icon';
import { PhoneInput } from 'baseui/phone-input';
import { toaster } from 'baseui/toast';
// Create a custom theme with black as primary color
const customTheme = createTheme(
  {
    ...darkThemePrimitives,
    primaryFontFamily: '"Roboto", sans-serif',
  },
  {
    colors: {
      buttonPrimaryFill: 'black',
      buttonPrimaryHover: '#333',
      buttonPrimaryActive: '#555',
      buttonPrimarySelectedFill: 'black',
      buttonPrimarySelectedText: 'white',
      
      // Focus colors
      borderFocus: 'black',
      borderSelected: 'black',
    },
  }
);

// Styled components
const FormSection = styled('div', {
  marginBottom: '2rem',
});

const SectionTitle = styled('h2', {
  borderBottom: '1px solid #e2e8f0',
  paddingBottom: '0.5rem',
  marginBottom: '1.5rem',
  fontSize: '1.25rem',
  fontWeight: '600',
});

const FormGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(1, 1fr)',
  gap: '1rem',
  '@media screen and (min-width: 768px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
});

const FullWidthGrid = styled('div', {
  gridColumn: '1 / -1',
});

// Interfaces
interface MedicalProblem {
  id: number;
  problem: string;
}

interface VaccinationDate {
  id: number;
  date: Date | null;
}

interface Vaccine {
  id: number;
  name: string;
  dates: VaccinationDate[];
}

interface PatientFormData {
  // Basic Info
  name: string;
  dob: Date | null;
  sex: { id: string; label: string }[];
  height: string;
  address: string;
  contactNumber: {
    text: string;
    country: { id: string; label: string }[];
  };
  
  // Renal Info
  renalDiagnosis: string;
  aetiology: string;
  medicalProblems: MedicalProblem[];
  
  // Transplant Info
  transplantWorkUp: string;
  status: string;
  
  // Vaccination Status
  hepatitisBsAg: {
    status: string;
    comment: string;
  };
  hepatitisCAb: {
    status: string;
    comment: string;
  };
  hivAb: {
    status: string;
    comment: string;
  };
  
  // Additional Vaccines
  vaccines: Vaccine[];
}

const AddPatient: React.FC = () => {
  const [css, theme] = useStyletron();
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);
  const [formData, setFormData] = useState<PatientFormData>({
    // Basic Info
    name: '',
    dob: null,
    sex: [],
    height: '',
    address: '',
    contactNumber: {
      text: '',
      country: [{ id: '1', label: 'LK (+94)' }],
    },
    
    // Renal Info
    renalDiagnosis: '',
    aetiology: '',
    medicalProblems: [],
    
    // Transplant Info
    transplantWorkUp: '',
    status: '',
    
    // Vaccination Status
    hepatitisBsAg: {
      status: '',
      comment: '',
    },
    hepatitisCAb: {
      status: '',
      comment: '',
    },
    hivAb: {
      status: '',
      comment: '',
    },
    
    // Additional Vaccines
    vaccines: [
      { id: 1, name: 'Hepatitis B', dates: [] },
      { id: 2, name: 'COVID Vaccination', dates: [] },
      { id: 3, name: '', dates: [] },
    ],
  });

  // Handle input changes for basic fields
  const handleInputChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle date change
  const handleDateChange = (name: string, date: Date | null) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  // Handle select change
  const handleSelectChange = (name: string, value: { id: string; label: string }[]) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle phone input change
  const handlePhoneChange = (text: string, country: { id: string; label: string }[]) => {
    setFormData({
      ...formData,
      contactNumber: {
        text,
        country,
      },
    });
  };

  // Handle vaccination status changes
  const handleVaccinationStatusChange = (vaccine: string, field: string, value: string) => {
    setFormData({
      ...formData,
      [vaccine]: {
        ...formData[vaccine as keyof PatientFormData] as Record<string, string>,
        [field]: value,
      },
    });
  };

  // Handle adding a new medical problem
  const handleAddMedicalProblem = () => {
    const newProblem: MedicalProblem = {
      id: formData.medicalProblems.length + 1,
      problem: '',
    };
    
    setFormData({
      ...formData,
      medicalProblems: [...formData.medicalProblems, newProblem],
    });
  };

  // Handle updating a medical problem
  const handleMedicalProblemChange = (id: number, value: string) => {
    const updatedProblems = formData.medicalProblems.map(problem => 
      problem.id === id ? { ...problem, problem: value } : problem
    );
    
    setFormData({
      ...formData,
      medicalProblems: updatedProblems,
    });
  };

  // Handle removing a medical problem
  const handleRemoveMedicalProblem = (id: number) => {
    const updatedProblems = formData.medicalProblems.filter(problem => problem.id !== id);
    
    setFormData({
      ...formData,
      medicalProblems: updatedProblems,
    });
  };

  // Handle vaccine name change
  const handleVaccineNameChange = (id: number, name: string) => {
    const updatedVaccines = formData.vaccines.map(vaccine => 
      vaccine.id === id ? { ...vaccine, name } : vaccine
    );
    
    setFormData({
      ...formData,
      vaccines: updatedVaccines,
    });
  };

  // Handle adding a vaccination date
  const handleAddVaccinationDate = (vaccineId: number) => {
    if (formData.vaccines.find(v => v.id === vaccineId)?.dates.length === 3) {
      alert('Maximum 3 dates allowed per vaccine');
      return;
    }
    
    const updatedVaccines = formData.vaccines.map(vaccine => {
      if (vaccine.id === vaccineId) {
        return {
          ...vaccine,
          dates: [
            ...vaccine.dates,
            { id: vaccine.dates.length + 1, date: null }
          ]
        };
      }
      return vaccine;
    });
    
    setFormData({
      ...formData,
      vaccines: updatedVaccines,
    });
  };

  // Handle updating a vaccination date
  const handleVaccinationDateChange = (vaccineId: number, dateId: number, value: Date | null) => {
    const updatedVaccines = formData.vaccines.map(vaccine => {
      if (vaccine.id === vaccineId) {
        const updatedDates = vaccine.dates.map(date => 
          date.id === dateId ? { ...date, date: value } : date
        );
        return { ...vaccine, dates: updatedDates };
      }
      return vaccine;
    });
    
    setFormData({
      ...formData,
      vaccines: updatedVaccines,
    });
  };

  // Handle removing a vaccination date
  const handleRemoveVaccinationDate = (vaccineId: number, dateId: number) => {
    const updatedVaccines = formData.vaccines.map(vaccine => {
      if (vaccine.id === vaccineId) {
        const updatedDates = vaccine.dates.filter(date => date.id !== dateId);
        return { ...vaccine, dates: updatedDates };
      }
      return vaccine;
    });
    
    setFormData({
      ...formData,
      vaccines: updatedVaccines,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the data to an API
    console.log('Form submitted:', formData);
    alert('Patient profile created successfully!');
  };

  // Handle cancel button click
  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  // Handle cancel confirmation
  const handleConfirmCancel = () => {
    // In a real app, this would navigate back or clear the form
    setShowCancelConfirm(false);
    alert('Form cancelled');
    // Reset form data
    setFormData({
      name: '',
      dob: null,
      sex: [],
      height: '',
      address: '',
      contactNumber: {
        text: '',
        country: [{ id: '1', label: 'US (+1)' }],
      },
      renalDiagnosis: '',
      aetiology: '',
      medicalProblems: [],
      transplantWorkUp: '',
      status: '',
      hepatitisBsAg: { status: '', comment: '' },
      hepatitisCAb: { status: '', comment: '' },
      hivAb: { status: '', comment: '' },
      vaccines: [
        { id: 1, name: 'Hepatitis B', dates: [] },
        { id: 2, name: 'COVID Vaccination', dates: [] },
        { id: 3, name: '', dates: [] },
      ],
    });
  };

  return (
      <Block
        padding="2rem"
        backgroundColor="#f8f8f8"
        minHeight="100vh"
      >
        <Card
          overrides={{
            Root: {
              style: {
                maxWidth: '1000px',
                margin: '0 auto',
              },
            },
            HeaderImage: {
              style: {
                backgroundColor: 'black',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2rem',
              },
            },
            Contents: {
              style: {
                padding: '2rem',
              },
            },
          }}
        //   headerImage={() => (
        //     <Block color="white" font="font500" marginLeft="1rem">
        //       <h1 className={css({ fontSize: '1.5rem', margin: 0 })}>Add New Patient</h1>
        //     </Block>
        //   )}
        >
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <FormSection>
              <SectionTitle>Basic Information</SectionTitle>
              <FormGrid>
                <FormControl label="Name">
                  <Input
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.currentTarget.value)}
                    placeholder="Enter patient name"
                    required
                  />
                </FormControl>
                
                <FormControl label="Date of Birth">
                  <DatePicker
                    value={formData.dob ? [formData.dob] : []}
                    // onChange={({ date }) => handleDateChange('dob', Array.isArray(date) ? date[0] : date)}
                    placeholder="YYYY/MM/DD"
                    required
                  />
                </FormControl>
                
                <FormControl label="Sex">
                  <Select
                    options={[
                      { id: 'male', label: 'Male' },
                      { id: 'female', label: 'Female' },
                      { id: 'other', label: 'Other' },
                    ]}
                    value={formData.sex}
                    // onChange={params => handleSelectChange('sex', params.value)}
                    placeholder="Select sex"
                    required
                    type={TYPE.select}
                  />
                </FormControl>
                
                <FormControl label="Height (cm)">
                  <Input
                    value={formData.height}
                    onChange={e => handleInputChange('height', e.currentTarget.value)}
                    type="number"
                    placeholder="Enter height in cm"
                    required
                  />
                </FormControl>
                
                <FormControl label="Contact Number">
                  <PhoneInput
                    text={formData.contactNumber.text}
                    // country={formData.contactNumber.country}
                    // onTextChange={text => handlePhoneChange(text, formData.contactNumber.country)}
                    // onCountryChange={country => handlePhoneChange(formData.contactNumber.text, country)}
                    required
                  />
                </FormControl>
                
                <FullWidthGrid>
                  <FormControl label="Address">
                    <Textarea
                      value={formData.address}
                      onChange={e => handleInputChange('address', e.currentTarget.value)}
                      placeholder="Enter patient address"
                      required
                    />
                  </FormControl>
                </FullWidthGrid>
              </FormGrid>
            </FormSection>
            
            {/* Renal Information Section */}
            <FormSection>
              <SectionTitle>Renal Information</SectionTitle>
              <FormGrid>
                <FormControl label="Renal Diagnosis">
                  <Input
                    value={formData.renalDiagnosis}
                    onChange={e => handleInputChange('renalDiagnosis', e.currentTarget.value)}
                    placeholder="Enter renal diagnosis"
                    required
                  />
                </FormControl>
                
                <FormControl label="Aetiology">
                  <Input
                    value={formData.aetiology}
                    onChange={e => handleInputChange('aetiology', e.currentTarget.value)}
                    placeholder="Enter aetiology"
                    required
                  />
                </FormControl>
              </FormGrid>
              
              {/* Medical Problems Section */}
              <Block marginTop="1.5rem">
                <Block
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom="0.5rem"
                >
                  <Block font="font500">Other Medical Problems</Block>
                  <Button
                    onClick={handleAddMedicalProblem}
                    size="compact"
                    kind="primary"
                    startEnhancer={<Plus size={16} />}
                  >
                    Add Problem
                  </Button>
                </Block>
                
                {formData.medicalProblems.length === 0 && (
                  <Block color="gray" marginTop="0.5rem" font="font300" as="i">
                    No medical problems added
                  </Block>
                )}
                
                {formData.medicalProblems.map((problem) => (
                  <Block key={problem.id} display="flex" alignItems="center" marginTop="0.5rem">
                    <Block flex="1">
                      <Input
                        value={problem.problem}
                        onChange={e => handleMedicalProblemChange(problem.id, e.currentTarget.value)}
                        placeholder="Enter medical problem"
                      />
                    </Block>
                    <Block marginLeft="0.5rem">
                      <Button
                        onClick={() => handleRemoveMedicalProblem(problem.id)}
                        size="compact"
                        kind="secondary"
                        shape="circle"
                      >
                        <Delete size={16} />
                      </Button>
                    </Block>
                  </Block>
                ))}
              </Block>
            </FormSection>
            
            {/* Transplant Information Section */}
            <FormSection>
              <SectionTitle>Transplant Information</SectionTitle>
              <FormControl label="Transplant Work Up">
                <RadioGroup
                  value={formData.transplantWorkUp}
                  onChange={e => handleInputChange('transplantWorkUp', e.currentTarget.value)}
                  required
                  align="horizontal"
                >
                  <Radio value="Live donor KT">Live donor KT</Radio>
                  <Radio value="None">None</Radio>
                  <Radio value="Patient not willing">Patient not willing</Radio>
                </RadioGroup>
              </FormControl>
              
              <FormControl label="Status">
                <RadioGroup
                  value={formData.status}
                  onChange={e => handleInputChange('status', e.currentTarget.value)}
                  align="horizontal"
                >
                  <Radio value="Completed">Completed</Radio>
                  <Radio value="Being worked up">Being worked up</Radio>
                </RadioGroup>
              </FormControl>
            </FormSection>
            
            {/* Vaccination Status Section */}
            <FormSection>
              <SectionTitle>Vaccination Status</SectionTitle>
              
              {/* Hepatitis Bs Ag */}
              <Block marginBottom="1.5rem">
                <FormControl label="Hepatitis Bs Ag">
                  <Block display="flex" flexDirection={['column', 'column', 'row']} alignItems="flex-start">
                    <Block marginRight="2rem" marginBottom={['0.5rem', '0.5rem', '0']}>
                      <RadioGroup
                        value={formData.hepatitisBsAg.status}
                        onChange={e => handleVaccinationStatusChange('hepatitisBsAg', 'status', e.currentTarget.value)}
                        align="horizontal"
                      >
                        <Radio value="Positive">Positive</Radio>
                        <Radio value="Negative">Negative</Radio>
                      </RadioGroup>
                    </Block>
                    <Block flex="1" width={['100%', '100%', 'auto']}>
                      <Input
                        value={formData.hepatitisBsAg.comment}
                        onChange={e => handleVaccinationStatusChange('hepatitisBsAg', 'comment', e.currentTarget.value)}
                        placeholder="Comments"
                      />
                    </Block>
                  </Block>
                </FormControl>
              </Block>
              
              {/* Hepatitis C Ab */}
              <Block marginBottom="1.5rem">
                <FormControl label="Hepatitis C Ab">
                  <Block display="flex" flexDirection={['column', 'column', 'row']} alignItems="flex-start">
                    <Block marginRight="2rem" marginBottom={['0.5rem', '0.5rem', '0']}>
                      <RadioGroup
                        value={formData.hepatitisCAb.status}
                        onChange={e => handleVaccinationStatusChange('hepatitisCAb', 'status', e.currentTarget.value)}
                        align="horizontal"
                      >
                        <Radio value="Positive">Positive</Radio>
                        <Radio value="Negative">Negative</Radio>
                      </RadioGroup>
                    </Block>
                    <Block flex="1" width={['100%', '100%', 'auto']}>
                      <Input
                        value={formData.hepatitisCAb.comment}
                        onChange={e => handleVaccinationStatusChange('hepatitisCAb', 'comment', e.currentTarget.value)}
                        placeholder="Comments"
                      />
                    </Block>
                  </Block>
                </FormControl>
              </Block>
              
              {/* HIV Ab */}
              <Block marginBottom="1.5rem">
                <FormControl label="HIV Ab">
                  <Block display="flex" flexDirection={['column', 'column', 'row']} alignItems="flex-start">
                    <Block marginRight="2rem" marginBottom={['0.5rem', '0.5rem', '0']}>
                      <RadioGroup
                        value={formData.hivAb.status}
                        onChange={e => handleVaccinationStatusChange('hivAb', 'status', e.currentTarget.value)}
                        align="horizontal"
                      >
                        <Radio value="Positive">Positive</Radio>
                        <Radio value="Negative">Negative</Radio>
                      </RadioGroup>
                    </Block>
                    <Block flex="1" width={['100%', '100%', 'auto']}>
                      <Input
                        value={formData.hivAb.comment}
                        onChange={e => handleVaccinationStatusChange('hivAb', 'comment', e.currentTarget.value)}
                        placeholder="Comments"
                      />
                    </Block>
                  </Block>
                </FormControl>
              </Block>
            </FormSection>
            
            {/* Additional Vaccines Section */}
            <FormSection>
              <SectionTitle>Additional Vaccines</SectionTitle>
              
              {formData.vaccines.map((vaccine) => (
                <Block key={vaccine.id} marginBottom="2rem">
                  <Block display="flex" alignItems="center" marginBottom="0.5rem">
                    <Block flex="1">
                      <Input
                        value={vaccine.name}
                        onChange={e => handleVaccineNameChange(vaccine.id, e.currentTarget.value)}
                        placeholder={vaccine.id === 3 ? "Enter vaccine name" : ""}
                        disabled={vaccine.id !== 3}
                      />
                    </Block>
                    <Block marginLeft="0.5rem">
                      <Button
                        onClick={() => handleAddVaccinationDate(vaccine.id)}
                        size="compact"
                        kind="primary"
                        disabled={vaccine.dates.length >= 3}
                        startEnhancer={<Plus size={16} />}
                      >
                        Add Date
                      </Button>
                    </Block>
                  </Block>
                  
                  {vaccine.dates.length === 0 ? (
                    <Block color="gray" marginTop="0.5rem" font="font300" as="i">
                      No vaccination dates added
                    </Block>
                  ) : (
                    <Block marginLeft="1rem">
                      {vaccine.dates.map((dateObj) => (
                        <Block key={dateObj.id} display="flex" alignItems="center" marginTop="0.5rem">
                          <Block flex="1">
                            <DatePicker
                              value={dateObj.date ? [dateObj.date] : []}
                            //   onChange={({ date }) => 
                            //     handleVaccinationDateChange(
                            //       vaccine.id, 
                            //       dateObj.id, 
                            //       Array.isArray(date) ? date[0] : date
                            //     )
                            //   }
                              placeholder="Select vaccination date"
                            />
                          </Block>
                          <Block marginLeft="0.5rem">
                            <Button
                              onClick={() => handleRemoveVaccinationDate(vaccine.id, dateObj.id)}
                              size="compact"
                              kind="secondary"
                              shape="circle"
                            >
                              <Delete size={16} />
                            </Button>
                          </Block>
                        </Block>
                      ))}
                    </Block>
                  )}
                </Block>
              ))}
            </FormSection>
            
            {/* Form Actions */}
            <Block display="flex" justifyContent="flex-end" marginTop="2rem">
              <Button
                onClick={handleCancel}
                kind="tertiary"
                // marginRight="1rem"
                overrides={{
                  BaseButton: {
                    style: {
                      borderColor: 'black',
                      color: 'black',
                    },
                  },
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Submit
              </Button>
            </Block>
          </form>
        </Card>
      <Modal
        isOpen={showCancelConfirm}
        // onClose={handleCloseModal}
        closeable
        animate
        size={SIZE.default}
        // overrides={{
        //   Dialog: {
        //     style: {
        //       width: '400px',
        //       maxWidth: '90%',
        //     },
        //   },
        // }}
      >
        <ModalHeader>Confirm Cancel</ModalHeader>
        <ModalBody>Are you sure you want to cancel? All changes will be lost.</ModalBody>
        <ModalFooter>
          <ModalButton kind="tertiary" 
        //   onClick={handleCloseModal}
          >
            No, Go Back
          </ModalButton>
          <ModalButton onClick={handleConfirmCancel} kind="primary">
            Yes, Cancel
          </ModalButton>
        </ModalFooter>
      </Modal>
      </Block>
    );
}
export default AddPatient;
