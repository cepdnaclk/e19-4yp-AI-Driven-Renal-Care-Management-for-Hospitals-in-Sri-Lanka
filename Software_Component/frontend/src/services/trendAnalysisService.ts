import apiClient from './apiConfig';

export interface DialysisSession {
  date: string;
  preWeight: number;
  postWeight: number;
  ufGoal: number;
  bloodPressurePre: string;
  bloodPressurePost: string;
}

export interface MonthlyInvestigation {
  date: string;
  hemoglobin: number;
  potassium: number;
  phosphorus: number;
  albumin: number;
  creatinine: number;
}

export interface WeightTrendData {
  date: string;
  preWeight: number;
  postWeight: number;
  ufGoal: number;
}

export interface BpTrendData {
  date: string;
  preSystolic: number;
  preDiastolic: number;
  postSystolic: number;
  postDiastolic: number;
}

export interface LabTrendData {
  date: string;
  hemoglobin: number;
  potassium: number;
  phosphorus: number;
  albumin: number;
  creatinine: number;
}

export interface TrendAnalysisData {
  dialysisSessions: DialysisSession[];
  monthlyInvestigations: MonthlyInvestigation[];
  weightTrendData: WeightTrendData[];
  bpTrendData: BpTrendData[];
  labTrendData: LabTrendData[];
}

class TrendAnalysisService {
  // Get dialysis sessions for a patient
  async getPatientDialysisSessions(patientId: string): Promise<DialysisSession[]> {
    try {
      const response = await apiClient.get(`/dialysis-sessions/${patientId}`);
      // Transform the response to match our interface
      return response.data.sessions.map((session: any) => ({
        date: session.date,
        preWeight: session.preDialysis?.weight || 0,
        postWeight: session.postDialysis?.weight || 0,
        ufGoal: session.dialysisParameters?.ufGoal || 0,
        bloodPressurePre: session.preDialysis?.bloodPressure || '0/0',
        bloodPressurePost: session.postDialysis?.bloodPressure || '0/0',
      }));
    } catch (error) {
      console.error('Error fetching dialysis sessions:', error);
      return [];
    }
  }

  // Get monthly investigations for a patient
  async getPatientMonthlyInvestigations(patientId: string): Promise<MonthlyInvestigation[]> {
    try {
      const response = await apiClient.get(`/monthly-investigations/${patientId}`);
      // Transform the response to match our interface
      return response.data.investigations.map((investigation: any) => ({
        date: investigation.date,
        hemoglobin: investigation.hb || 0,
        potassium: investigation.serumKPreHD || 0,
        phosphorus: investigation.sPhosphate || 0,
        albumin: investigation.albumin || 0,
        creatinine: investigation.scrPreHD || 0,
      }));
    } catch (error) {
      console.error('Error fetching monthly investigations:', error);
      return [];
    }
  }

  // Get hemoglobin trend data specifically
  async getHemoglobinTrend(patientId: string, months: number = 6): Promise<any> {
    try {
      const response = await apiClient.get(`/trends/hb/${patientId}?months=${months}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hemoglobin trend:', error);
      return null;
    }
  }

  // Process trend data for charts
  processTrendData(dialysisSessions: DialysisSession[], monthlyInvestigations: MonthlyInvestigation[]): TrendAnalysisData {
    // Prepare weight trend data
    const weightTrendData: WeightTrendData[] = dialysisSessions
      .map(session => ({
        date: session.date,
        preWeight: session.preWeight,
        postWeight: session.postWeight,
        ufGoal: session.ufGoal,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Prepare blood pressure trend data
    const bpTrendData: BpTrendData[] = dialysisSessions
      .map(session => {
        const [preSystolicStr, preDiastolicStr] = session.bloodPressurePre.split('/');
        const [postSystolicStr, postDiastolicStr] = session.bloodPressurePost.split('/');
        return {
          date: session.date,
          preSystolic: parseInt(preSystolicStr) || 0,
          preDiastolic: parseInt(preDiastolicStr) || 0,
          postSystolic: parseInt(postSystolicStr) || 0,
          postDiastolic: parseInt(postDiastolicStr) || 0,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Prepare lab trend data
    const labTrendData: LabTrendData[] = monthlyInvestigations
      .map(investigation => ({
        date: investigation.date,
        hemoglobin: investigation.hemoglobin,
        potassium: investigation.potassium,
        phosphorus: investigation.phosphorus,
        albumin: investigation.albumin,
        creatinine: investigation.creatinine,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      dialysisSessions,
      monthlyInvestigations,
      weightTrendData,
      bpTrendData,
      labTrendData,
    };
  }
}

export default new TrendAnalysisService();