import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HeadingMedium, HeadingSmall } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Tabs, Tab } from 'baseui/tabs-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Patient, DialysisSession, MonthlyInvestigation, AIPrediction, ClinicalDecision } from '../../types';
import { fetchPatientById, fetchMonthlyInvestigations, fetchDialysisSessions, fetchHemoglobinTrend, fetchAIPrediction } from '../patients/PatientService';
import PatientProfile from '../patients/PatientProfile';

// Clinical decisions will be loaded from the API in future; default to empty array for now.

const DoctorPatientProfile: React.FC = () => (
  <PatientProfile role="doctor" backTo="/doctor/patients" />
);

export default DoctorPatientProfile;