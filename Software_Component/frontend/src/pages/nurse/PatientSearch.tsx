import React, { useState, useEffect } from 'react'
import { HeadingLarge } from 'baseui/typography'
import { Card, StyledBody } from 'baseui/card'
import { Grid, Cell } from 'baseui/layout-grid'
import { Block } from 'baseui/block'
import { Button } from 'baseui/button'
import { useNavigate } from 'react-router-dom'
import { Input } from 'baseui/input'
import { FormControl } from 'baseui/form-control'
import { Table } from 'baseui/table-semantic'
import { PatientCatalogue } from '../../types'
import { toaster } from 'baseui/toast'

import axios from 'axios'

const NursePatientSearch: React.FC = () => {
  const token = localStorage.getItem('userToken')
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [patients, setPatients] = useState<PatientCatalogue[]>([])
  const [filteredPatients, setFilteredPatients] = useState<PatientCatalogue[]>([])

  // Fetch Patient Catalogue data from the API
  const fetchAllPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      setPatients(response.data.patients)
      setFilteredPatients(response.data.patients)
    }
    catch (error: any) {
      toaster.negative('Failed to fetch the Patients', { autoHideDuration: 3000 })
    }
  }

  // Fetch all patients on component moun
  useEffect(() => {
    fetchAllPatients()
  }, [])

  // Filtering patients based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(
        patient =>
          patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPatients(filtered)
    } 
    
    else {
      setFilteredPatients(patients)
    }
  }, [searchTerm, patients])


  const handleViewPatient = (patientId: string) => {
    navigate(`/nurse/patients/${patientId}`)
  }

  const handleAddNewPatient = () => {
    navigate(`/nurse/patients/add`)
  }

  return (
    <Block>
      <HeadingLarge>Patient Search</HeadingLarge>

      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
        <Cell span={12}>
          <Card
            overrides={{
              Root: {
                style: {
                  marginBottom: '20px'
                }
              }
            }}
          >
            <StyledBody>
              <Block display="flex" justifyContent="space-between" alignItems="flex-end" marginBottom="16px">
                <FormControl label="Search Patients">
                  <Input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.currentTarget.value)}
                    placeholder="Search by Patient ID or Name"
                    clearable
                    clearOnEscape
                  />
                </FormControl>
                <Button onClick={handleAddNewPatient}>Add New Patient</Button>
              </Block>

              <Table
                columns={['ID', 'Name', 'Age', 'Gender', 'Blood Type', 'Contact Number', 'Assigned Doctor', 'Actions']}
                data={filteredPatients.map(patient => {
                  return [
                    patient.patientId,
                    patient.name,
                    patient.age,
                    patient.gender,
                    patient.bloodType,
                    patient.contactNumber,
                    patient.assignedDoctor?.name || "N/A",
                    <Button key={patient.id} onClick={() => handleViewPatient(patient.id)} size="compact">
                      View
                    </Button>
                  ]
                })}
              />
            </StyledBody>
          </Card>
        </Cell>
      </Grid>
    </Block>
  )
}

export default NursePatientSearch