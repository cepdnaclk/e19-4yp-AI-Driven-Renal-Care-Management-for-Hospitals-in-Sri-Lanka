import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Patient } from '../../types';
import { fetchAllPatients } from './PatientService';

import '../../main.css';
import { SearchIcon } from '../../utils/utilities';

const DoctorPatientSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const getAssignedDoctorName = (doctor: string | any): string => {
    if (typeof doctor === 'string') return doctor
    if (doctor && typeof doctor === 'object') {
      return doctor.name || 'N/A'
    }
    return 'N/A'
  }

  // Initial data load
  const loadPatients = async () => {
    try {
      setLoading(true)
      setError(null)
      const patientsData = await fetchAllPatients()
      setPatients(patientsData)
    }
    catch (error: any) {
      if (error.message?.includes('Authentication failed') || error.message?.includes('No authentication token')) {
        setError('Authentication failed. Please log in again.')
      }
      else {
        setError('Failed to load patients. Please try again.')
      }
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  // View relevant patient details
  const handleViewPatient = (patientId: string) => {
    navigate(`/doctor/patients/${patientId}`)
  }

  // Filter patients based on search term
  const filteredPatients = patients.filter((patient) => {
    const term = searchTerm.toLowerCase()
    return ((
      patient.patientId || patient.id)?.toLowerCase().includes(term) ||
      patient.name?.toLowerCase().includes(term) ||
      // (patient.gender || '').toLowerCase().includes(term) ||  
      // (patient.bloodType || '').toLowerCase().includes(term) ||
      getAssignedDoctorName(patient.assignedDoctor).toLowerCase().includes(term)
    )
  })

  return (
    <div className="general-container">
      <h1 className="general-h1">Patient List</h1>

      <div className="patient-display">
        {/* Search Bar */}
        <div className="patient-search-form">
          <div className="search-input-wrapper">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              placeholder="Search by Patient ID / Patient Name / Doctor Name"
              disabled={loading}
            />
          </div>
        </div>

        {/* Patient Table */}
        {loading ? (
          <div className="patient-search-loading">
            <span>Loading patients...</span>
          </div>
        ) : error ? (
          <div className="patient-search-error">
            <span>Error: {error}</span>
          </div>
        ) : (
          <div>
            <table className="display-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Blood Type</th>
                  <th>Assigned Doctor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-patients">No Patients found!</td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.patientId || patient.id}</td>
                      <td>{patient.name}</td>
                      <td>{patient.age || 'N/A'}</td>
                      <td>{patient.gender || 'N/A'}</td>
                      <td>{patient.bloodType || 'N/A'}</td>
                      <td>{getAssignedDoctorName(patient.assignedDoctor)}</td>
                      <td>
                        <div className="center-btn">
                          <button
                            className="btn btn-blue"
                            onClick={() => handleViewPatient(patient.patientId ?? patient.id)}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default DoctorPatientSearch