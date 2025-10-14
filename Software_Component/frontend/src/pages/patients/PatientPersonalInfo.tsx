import React from 'react'
import { useNavigate } from 'react-router-dom'

import { Patient } from '../../types'
import lang from '../../utils/lang.json'

export interface PersonalInfoProps {
  patient: Patient
  backTo?: string // optional route to go back
  leftActions?: React.ReactNode // optional extra actions rendered at bottom
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ patient, backTo, leftActions }) => {
  const navigate = useNavigate()

  const getFormattedAddress = (address: string | any): string => {
    if (typeof address === 'string') return address
    if (address && typeof address === 'object') {
      return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`
    }
    return lang.not_available
  }

  const getFormattedEmergencyContact = (emergencyContact: string | any): string => {
    if (typeof emergencyContact === 'string') return emergencyContact
    if (emergencyContact && typeof emergencyContact === 'object') {
      return `${emergencyContact.name} (${emergencyContact.relationship}) - ${emergencyContact.phone}`
    }
    return lang.not_available
  }

  function getFormattedMedicalHistory(medicalHistory: any): React.ReactNode {
    if (typeof medicalHistory === 'string') {
      return medicalHistory
    }

    if (medicalHistory && typeof medicalHistory === 'object') {
      return (
        <div className="background-gray padding-10 border-radius-5">
          {medicalHistory.renalDiagnosis && (
            <div className="margin-bottom-10">
              <span className='bold'>{lang.patient_medical_status.renal_diagnosis}:</span> {medicalHistory.renalDiagnosis}
            </div>
          )}

          {medicalHistory.medicalProblems && medicalHistory.medicalProblems.length > 0 && (
            <div className="margin-bottom-10">
              <span className='bold'>{lang.patient_medical_status.medical_problems}:</span>
              {medicalHistory.medicalProblems.map((problem: any, index: number) => (
                <div key={index} style={{ marginLeft: 16, marginTop: 4 }}>
                  • {problem.problem} ({lang.patient_medical_status.diagnosed}: {problem.diagnosedDate}, {lang.patient_medical_status.status}: {problem.status})
                </div>
              ))}
            </div>
          )}

          {medicalHistory.allergies && medicalHistory.allergies.length > 0 && (
            <div className="margin-bottom-10">
              <span className='bold'>{lang.patient_medical_status.allergies}:</span> {medicalHistory.allergies.join(', ')}
            </div>
          )}

          {medicalHistory.medications && medicalHistory.medications.length > 0 && (
            <div className="margin-bottom-10">
              <span className='bold'>{lang.patient_medical_status.current_medications}:</span>
              {medicalHistory.medications.map((medication: any, index: number) => (
                <div key={index} style={{ marginLeft: 16, marginTop: 4 }}>
                  • {medication.name} - {medication.dosage} ({medication.frequency})
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    return lang.not_available
  }

  return (
    <div className='background-primary border-radius-5 padding-30 grey-box-shadow border-primary'>
      {backTo && (
          <button className="btn btn-gray" onClick={() => navigate(backTo)}>{lang.buttons.back}</button>
      )}
      <div className="text-align-center">
        <div className="patient-avatar" aria-hidden>
          {patient.name ? patient.name.charAt(0) : ''}
        </div>
        <h3 className='margin-top-bottom-10'>{patient.name}</h3>
        <div className="color-primary bold text-small">{lang.patient_personal_info.id}: {patient.patientId}</div>
      </div>

      {/* Personal Details */}
      <div className='margin-top-10'>
        {[
          { label: lang.patient_personal_info.age, value: patient.age },
          { label: lang.patient_personal_info.gender, value: patient.gender },
          { label: lang.patient_personal_info.blood_type, value: patient.bloodType },
          { label: lang.patient_personal_info.contact, value: patient.contactNumber },
          { label: lang.patient_personal_info.emergency_contact, value: getFormattedEmergencyContact(patient.emergencyContact) },
          { label: lang.patient_personal_info.assigned_doctor, 
            value: typeof patient.assignedDoctor === 'string' 
              ? patient.assignedDoctor 
              : patient.assignedDoctor?.name || lang.not_assigned 
          },
          { label: lang.patient_personal_info.registration_date, 
            value: patient.registrationDate 
              ? new Date(patient.registrationDate).toLocaleDateString() 
              : lang.not_available
          }
        ].map(({ label, value }) => (
          <div key={label} className="patient-row padding-top-bottom-10">
            <div className="bold text-normal color-text">{label}</div>
            <div className="text-normal color-secondary-text">{value}</div>
          </div>
        ))}
      </div>

      {/* Address */}
      <div>
        <div className='heading3 color-primary bold margin-top-bottom-10'>{lang.patient_personal_info.address}</div>
        <div>{getFormattedAddress(patient.address)}</div>
      </div>

      {/* Medical History */}
      <div>
        <div className='heading3 color-primary bold margin-top-bottom-10'>{lang.patient_medical_status.medical_history}</div>
        <div>{getFormattedMedicalHistory(patient.medicalHistory)}</div>
      </div>

      {/* Dialysis Information */}
      {patient.dialysisInfo && (
        <div>
          <div className='heading3 color-primary bold margin-top-bottom-10'>{lang.patient_medical_status.dialysis_info}</div>
          <div className="background-gray padding-10 border-radius-5">
            {[
              { label: lang.patient_medical_status.type, value: patient.dialysisInfo.dialysisType },
              { label: lang.patient_medical_status.frequency, value: patient.dialysisInfo.frequency?.replace('_', ' ') },
              { label: lang.patient_medical_status.vascular_access, value: `${patient.dialysisInfo.accessType} (${patient.dialysisInfo.accessSite})` },
              { label: lang.patient_medical_status.dry_weight, value: `${patient.dialysisInfo.dryWeight} ${lang.units.kg}` },
              { label: lang.patient_medical_status.target_ufr, value: `${patient.dialysisInfo.targetUfr} ${lang.units.mL_min}` }
            ].map(({ label, value }) => (
              <div key={label} className="margin-bottom-10">
                <strong>{label}:</strong> {value}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="margin-top-20">
        {leftActions}
      </div>
    </div>
  )
}
