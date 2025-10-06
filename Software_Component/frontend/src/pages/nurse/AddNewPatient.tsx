import React, { useState } from 'react';
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
    <div style={{ padding: '2rem', backgroundColor: '#f8f8f8', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px', padding: '2rem', backgroundColor: 'white' }}>
        <h1>Add New Patient</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>Basic Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div>
                <label>Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter patient name"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              
              <div>
                <label>Date of Birth</label>
                <input
                  value={formData.dob ? formData.dob.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('dob', new Date(e.target.value))}
                  type="date"
                  placeholder="YYYY/MM/DD"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              
              <div>
                <label>Sex</label>
                <select
                  value={formData.sex[0]?.id || ''}
                  onChange={(e) => handleSelectChange('sex', [{ id: e.target.value, label: e.target.options[e.target.selectedIndex].text }])}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                >
                  <option value="">Select sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label>Height (cm)</label>
                <input
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  type="number"
                  placeholder="Enter height in cm"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              
              <div>
                <label>Contact Number</label>
                <input
                  value={formData.contactNumber.text}
                  onChange={(e) => handlePhoneChange(e.target.value, formData.contactNumber.country)}
                  placeholder="Enter contact number"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter patient address"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px', minHeight: '80px' }}
                />
              </div>
            </div>
          </div>
          
          {/* Renal Information Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>Renal Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div>
                <label>Renal Diagnosis</label>
                <input
                  value={formData.renalDiagnosis}
                  onChange={(e) => handleInputChange('renalDiagnosis', e.target.value)}
                  placeholder="Enter renal diagnosis"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              
              <div>
                <label>Aetiology</label>
                <input
                  value={formData.aetiology}
                  onChange={(e) => handleInputChange('aetiology', e.target.value)}
                  placeholder="Enter aetiology"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{ padding: '8px 16px', border: '1px solid black', backgroundColor: 'transparent', color: 'black' }}
            >
              Cancel
            </button>
            <button type="submit" style={{ padding: '8px 16px' }}>
              Submit
            </button>
          </div>
        </form>
      </div>
      
      {showCancelConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
            <h3>Confirm Cancel</h3>
            <p>Are you sure you want to cancel? All changes will be lost.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setShowCancelConfirm(false)} style={{ padding: '8px 16px' }}>No, Go Back</button>
              <button onClick={handleConfirmCancel} style={{ padding: '8px 16px' }}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AddPatient;
