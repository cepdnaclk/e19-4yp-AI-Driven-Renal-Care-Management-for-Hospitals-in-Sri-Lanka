import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import trendAnalysisService, {
  DialysisSession,
  MonthlyInvestigation,
  WeightTrendData,
  BpTrendData,
  LabTrendData
} from '../../services/trendAnalysisService';

const NurseTrendAnalysis: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [dialysisSessions, setDialysisSessions] = useState<DialysisSession[]>([]);
  const [monthlyInvestigations, setMonthlyInvestigations] = useState<MonthlyInvestigation[]>([]);
  const [weightTrendData, setWeightTrendData] = useState<WeightTrendData[]>([]);
  const [bpTrendData, setBpTrendData] = useState<BpTrendData[]>([]);
  const [labTrendData, setLabTrendData] = useState<LabTrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendData = async () => {
      if (!patientId) return;

      try {
        setLoading(true);

        // Fetch dialysis sessions and monthly investigations in parallel
        const [sessionsData, investigationsData] = await Promise.all([
          trendAnalysisService.getPatientDialysisSessions(patientId),
          trendAnalysisService.getPatientMonthlyInvestigations(patientId)
        ]);

        setDialysisSessions(sessionsData);
        setMonthlyInvestigations(investigationsData);
      } catch (error) {
        console.error('Error fetching trend data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [patientId]);

  useEffect(() => {
    // Prepare weight trend data
    const weightData: WeightTrendData[] = dialysisSessions
      .map(session => ({
        date: session.date,
        preWeight: session.preWeight,
        postWeight: session.postWeight,
        ufGoal: session.ufGoal,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setWeightTrendData(weightData);

    // Prepare blood pressure trend data
    const bpData: BpTrendData[] = dialysisSessions
      .map(session => {
        const [preSystolicStr, preDiastolicStr] = session.bloodPressurePre.split('/');
        const [postSystolicStr, postDiastolicStr] = session.bloodPressurePost.split('/');
        return {
          date: session.date,
          preSystolic: parseInt(preSystolicStr),
          preDiastolic: parseInt(preDiastolicStr),
          postSystolic: parseInt(postSystolicStr),
          postDiastolic: parseInt(postDiastolicStr),
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setBpTrendData(bpData);

    // Prepare lab trend data
    const labData: LabTrendData[] = monthlyInvestigations
      .map(investigation => ({
        date: investigation.date,
        hemoglobin: investigation.hemoglobin,
        potassium: investigation.potassium,
        phosphorus: investigation.phosphorus,
        albumin: investigation.albumin,
        creatinine: investigation.creatinine,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setLabTrendData(labData);
  }, [dialysisSessions, monthlyInvestigations]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Trend Analysis</h1>
      <h2>Patient ID: {patientId}</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading trend data...</p>
        </div>
      ) : (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {weightTrendData.length === 0 && bpTrendData.length === 0 && labTrendData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
              <p>No trend data available for this patient.</p>
              <p>Data will appear here once dialysis sessions and lab investigations are recorded.</p>
            </div>
          ) : (
            <>
              {weightTrendData.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
                    <h3>Weight Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={weightTrendData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="preWeight"
                          name="Pre-Dialysis Weight"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="postWeight"
                          name="Post-Dialysis Weight"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="ufGoal"
                          name="UF Goal"
                          stroke="#ffc658"
                          fill="#ffc658"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {bpTrendData.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
                    <h3>Blood Pressure Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={bpTrendData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="preSystolic"
                          name="Pre-Dialysis Systolic"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="preDiastolic"
                          name="Pre-Dialysis Diastolic"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="postSystolic"
                          name="Post-Dialysis Systolic"
                          stroke="#ffc658"
                          fill="#ffc658"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="postDiastolic"
                          name="Post-Dialysis Diastolic"
                          stroke="#ff8042"
                          fill="#ff8042"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {labTrendData.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
                    <h3>Laboratory Parameter Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={labTrendData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="hemoglobin"
                          name="Hemoglobin"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="potassium"
                          name="Potassium"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="phosphorus"
                          name="Phosphorus"
                          stroke="#ffc658"
                          fill="#ffc658"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="albumin"
                          name="Albumin"
                          stroke="#ff8042"
                          fill="#ff8042"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NurseTrendAnalysis;
