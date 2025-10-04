import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { PatientCatalogue, Patient } from '../../types'

import { fetchAllPatients } from './PatientService'
import { patientTableConfig } from './patientTableConfig'

import { can } from '../../utils/permissions'
import { toast } from '../../utils/notify'

import lang from '../../utils/lang.json'
import SearchBar from '../../components/SearchBar'

import 'bootstrap-icons/font/bootstrap-icons.css';

interface PatientSearchProps {
    role: 'doctor' | 'nurse'
}

const PatientSearch: React.FC<PatientSearchProps> = ({ role }) => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')

    const canAdd = can(role, 'patients:add') // Checking role has the permission to add patients
    const canView = can(role, 'patients:view') // Checking role has the permission to view patients

    // Store Patient Details
    const [patients, setPatients] = useState<(PatientCatalogue | Patient)[]>([])
    const [filteredPatients, setFilteredPatients] = useState<(PatientCatalogue | Patient)[]>([])

    // Loading and Error States
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch patients based on role
    useEffect(() => {
        const fetchPatients = async () => {

            // Reset states
            setLoading(true)
            setError(null)

            // Start Data Loading
            try {
                const data = await fetchAllPatients()
                setPatients(data)
                setFilteredPatients(data)
            }
            catch (err: any) {
                setError('Failed to load patients. Please try again.')
                setPatients([])
                setFilteredPatients([])
            }
            finally {
                setLoading(false)
            }
        }
        fetchPatients()
    }, [role])

    // Filter patients
    useEffect(() => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            const filtered = patients.filter((patient: any) =>
                (patient.patientId || patient.id)?.toLowerCase().includes(term) ||
                patient.name?.toLowerCase().includes(term) ||
                (patient.assignedDoctor?.name || patient.assignedDoctor || '').toLowerCase().includes(term)
            )
            setFilteredPatients(filtered)
            console.log('filteredPatients:', filtered)
        } 
        else {
            setFilteredPatients(patients)
            console.log('filteredPatients:', patients)
        }
    }, [searchTerm, patients])

    const handleViewPatient = (patientId: string) => {
        if (!canView) {
            toast.error(lang.toasts.patient_search.no_view_permission, { duration: 3000 })
            return
        }
        navigate(`/${role}/patients/${patientId}`)
    }

    const handleAddNewPatient = () => {
        if (!canAdd) {
            toast.error(lang.toasts.patient_search.no_add_permission, { duration: 3000 })
            return
        }
        navigate(`/${role}/patients/add`)
    }

    // Unified UI for doctor and nurse
    return (
        <div className="general-container">
            <h1 className="general-h1">{lang.patient_search.title}</h1>
            <div className="patient-display">

                {/* Add Patients - If only has add permissions */}
                {canAdd && (
                    <button className="btn btn-blue margin_bottom_20" onClick={handleAddNewPatient}>{lang.patient_search.add_new_patient}</button>
                )}

                {/* Search Patients */}
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={lang.patient_search.searchbar_placeholder}
                    disabled={loading}
                />

                {loading ? (
                    <div className="patient-search-loading">
                        <span>{lang.loading}</span>
                    </div>
                ) : error ? (
                    <div className="patient-search-error">
                        <span>{lang.error} {error}</span>
                    </div>
                ) : (
                    <div>
                        <table className="display-table">
                            <thead>
                                <tr>
                                    {patientTableConfig[role].map((col: any) => (
                                        <th key={col.key}>{col.label}</th>
                                    ))}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan={patientTableConfig[role].length + 1} className="no-patients">{lang.patient_search.no_patients_found}</td>
                                    </tr>
                                ) : (
                                    filteredPatients.map((patient: any) => (
                                        <tr key={patient.id}>
                                            {patientTableConfig[role].map((col: any) => (
                                                <td key={col.key}>
                                                    {col.render ? col.render(patient) : (patient[col.key] ?? 'N/A')}
                                                </td>
                                            ))}
                                            <td>
                                                {canView ? (
                                                    <button className="btn btn-blue" onClick={() => handleViewPatient(patient.patientId ?? patient.id)}>
                                                        View
                                                    </button>
                                                ) : (
                                                    <span className="text-muted">{lang.restricted}</span>
                                                )}
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

export default PatientSearch