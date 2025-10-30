import { useState, useCallback } from 'react';
import { fetchMonthlyInvestigations, fetchDialysisSessions, fetchHemoglobinTrend, fetchAIPredictions } from './PatientService';

export const usePatientData = (patientId: string | undefined) => {
  const [dialysisSessions, setDialysisSessions] = useState<any[]>([]);
  const [dialysisSessionsLoading, setDialysisSessionsLoading] = useState<boolean>(false);
  const [dialysisSessionsError, setDialysisSessionsError] = useState<string | null>(null);

  const [monthlyInvestigations, setMonthlyInvestigations] = useState<any[]>([]);
  const [monthlyInvestigationsLoading, setMonthlyInvestigationsLoading] = useState<boolean>(false);
  const [monthlyInvestigationsError, setMonthlyInvestigationsError] = useState<string | null>(null);

  const [hemoglobinTrend, setHemoglobinTrend] = useState<any>(null);
  const [hemoglobinTrendLoading, setHemoglobinTrendLoading] = useState<boolean>(false);
  const [hemoglobinTrendError, setHemoglobinTrendError] = useState<string | null>(null);

  const [aiPredictions, setAIPredictions] = useState<any>(null);
  const [aiPredictionsLoading, setAIPredictionsLoading] = useState<boolean>(false);
  const [aiPredictionsError, setAIPredictionsError] = useState<string | null>(null);

  const loadDialysisSessions = useCallback(async () => {
    if (!patientId) return;
    try {
      setDialysisSessionsLoading(true);
      setDialysisSessionsError(null);
      const sessions = await fetchDialysisSessions(patientId);
      setDialysisSessions(sessions);
    } catch (err: any) {
      console.error('Error loading dialysis sessions:', err);
      if (err.message?.includes('Authentication failed') || err.message?.includes('No authentication token')) {
        setDialysisSessionsError('Authentication failed. Please log in again.');
      } else {
        setDialysisSessionsError('Failed to load dialysis sessions. Please try again.');
      }
      setDialysisSessions([]);
    } finally {
      setDialysisSessionsLoading(false);
    }
  }, [patientId]);

  const loadMonthlyInvestigations = useCallback(async () => {
    if (!patientId) return;
    try {
      setMonthlyInvestigationsLoading(true);
      setMonthlyInvestigationsError(null);
      const investigations = await fetchMonthlyInvestigations(patientId);
      setMonthlyInvestigations(investigations);
    } catch (err: any) {
      console.error('Error loading monthly investigations:', err);
      if (err.message?.includes('Authentication failed') || err.message?.includes('No authentication token')) {
        setMonthlyInvestigationsError('Authentication failed. Please log in again.');
      } else {
        setMonthlyInvestigationsError('Failed to load monthly investigations. Please try again.');
      }
      setMonthlyInvestigations([]);
    } finally {
      setMonthlyInvestigationsLoading(false);
    }
  }, [patientId]);

  const loadHemoglobinTrend = useCallback(async () => {
    if (!patientId) return;
    try {
      setHemoglobinTrendLoading(true);
      setHemoglobinTrendError(null);
      const trendData = await fetchHemoglobinTrend(patientId);
      setHemoglobinTrend(trendData);
    } catch (err: any) {
      console.error('Error loading hemoglobin trend:', err);
      if (err.message?.includes('Authentication failed') || err.message?.includes('No authentication token')) {
        setHemoglobinTrendError('Authentication failed. Please log in again.');
      } else {
        setHemoglobinTrendError('Failed to load hemoglobin trend. Please try again.');
      }
      setHemoglobinTrend(null);
    } finally {
      setHemoglobinTrendLoading(false);
    }
  }, [patientId]);

  const loadAIPredictions = useCallback(async () => {
    if (!patientId) return;
    try {
      setAIPredictionsLoading(true);
      setAIPredictionsError(null);
      
      // Call backend endpoints which handle data fetching automatically
      const predictions = await fetchAIPredictions(patientId);
      setAIPredictions(predictions);
    } catch (err: any) {
      console.error('Error loading AI predictions:', err);
      if (err.message?.includes('Authentication failed') || err.message?.includes('No authentication token')) {
        setAIPredictionsError('Authentication failed. Please log in again.');
      } else {
        setAIPredictionsError('Failed to load AI predictions. Please try again.');
      }
      setAIPredictions(null);
    } finally {
      setAIPredictionsLoading(false);
    }
  }, [patientId]);

  return {
    dialysisSessions,
    dialysisSessionsLoading,
    dialysisSessionsError,
    loadDialysisSessions,
    monthlyInvestigations,
    monthlyInvestigationsLoading,
    monthlyInvestigationsError,
    loadMonthlyInvestigations,
    hemoglobinTrend,
    hemoglobinTrendLoading,
    hemoglobinTrendError,
    loadHemoglobinTrend,
    aiPredictions,
    aiPredictionsLoading,
    aiPredictionsError,
    loadAIPredictions,
  };
};