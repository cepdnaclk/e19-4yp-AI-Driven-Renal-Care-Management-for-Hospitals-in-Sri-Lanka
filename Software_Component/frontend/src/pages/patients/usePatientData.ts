import { useState, useCallback } from 'react';
import { fetchMonthlyInvestigations, fetchDialysisSessions, fetchHemoglobinTrend, fetchAIPrediction } from './PatientService';

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
      const investigations = await fetchMonthlyInvestigations(patientId);
      if (investigations && investigations.length > 0) {
        const latestInvestigation = investigations[0];
        const predictionData = {
          patient_id: patientId,
          albumin: latestInvestigation.albumin || 35.2,
          bu_post_hd: latestInvestigation.bu || 8.5,
          bu_pre_hd: latestInvestigation.bu || 25.3,
          s_ca: latestInvestigation.sCa || 2.3,
          scr_post_hd: latestInvestigation.scrPostHD || 450,
          scr_pre_hd: latestInvestigation.scrPreHD || 890,
          serum_k_post_hd: latestInvestigation.serumKPostHD || 3.8,
          serum_k_pre_hd: latestInvestigation.serumKPreHD || 5.2,
          serum_na_pre_hd: latestInvestigation.serumNaPreHD || 138,
          ua: latestInvestigation.ua || 400,
          hb_diff: -0.5,
          hb: latestInvestigation.hb || 9
        };
        const prediction = await fetchAIPrediction(predictionData);
        setAIPredictions(prediction);
      } else {
        setAIPredictionsError('No investigation data available for AI prediction');
        setAIPredictions(null);
      }
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