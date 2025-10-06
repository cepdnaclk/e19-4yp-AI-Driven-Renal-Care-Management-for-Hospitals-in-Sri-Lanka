import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Define your types

interface DialysisSession {
  date: string;
  preWeight: number;
  postWeight: number;
  ufGoal: number;
  bloodPressurePre: string;  // format "systolic/diastolic"
  bloodPressurePost: string; // format "systolic/diastolic"
}

interface MonthlyInvestigation {
  date: string;
  hemoglobin: number;
  potassium: number;
  phosphorus: number;
  albumin: number;
  creatinine: number;
}

interface WeightTrendData {
  date: string;
  preWeight: number;
  postWeight: number;
  ufGoal: number;
}

interface BpTrendData {
  date: string;
  preSystolic: number;
  preDiastolic: number;
  postSystolic: number;
  postDiastolic: number;
}

interface LabTrendData {
  date: string;
  hemoglobin: number;
  potassium: number;
  phosphorus: number;
  albumin: number;
  creatinine: number;
}

// Mock data for patients keyed by patientId

const mockDialysisSessions: Record<string, DialysisSession[]> = {
  'patient1': [
    {
      date: '2024-01-01',
      preWeight: 70,
      postWeight: 67,
      ufGoal: 3,
      bloodPressurePre: '140/90',
      bloodPressurePost: '130/85',
    },
    {
      date: '2024-01-03',
      preWeight: 71,
      postWeight: 68,
      ufGoal: 3,
      bloodPressurePre: '138/88',
      bloodPressurePost: '128/82',
    },
    // Add more sample sessions here...
  ],
  'patient2': [
    {
      date: '2024-01-01',
      preWeight: 80,
      postWeight: 76,
      ufGoal: 4,
      bloodPressurePre: '150/95',
      bloodPressurePost: '140/90',
    },
    // Add more sample sessions here...
  ],
};

const mockMonthlyInvestigations: Record<string, MonthlyInvestigation[]> = {
  'patient1': [
    {
      date: '2024-01-01',
      hemoglobin: 10.5,
      potassium: 4.8,
      phosphorus: 5.5,
      albumin: 3.8,
      creatinine: 8.0,
    },
    {
      date: '2024-02-01',
      hemoglobin: 10.8,
      potassium: 4.7,
      phosphorus: 5.3,
      albumin: 3.9,
      creatinine: 7.8,
    },
    // Add more sample investigations here...
  ],
  'patient2': [
    {
      date: '2024-01-01',
      hemoglobin: 9.5,
      potassium: 5.0,
      phosphorus: 6.0,
      albumin: 3.5,
      creatinine: 9.0,
    },
    // Add more sample investigations here...
  ],
};

const NurseTrendAnalysis: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [dialysisSessions, setDialysisSessions] = useState<DialysisSession[]>([]);
  const [monthlyInvestigations, setMonthlyInvestigations] = useState<MonthlyInvestigation[]>([]);
  const [weightTrendData, setWeightTrendData] = useState<WeightTrendData[]>([]);
  const [bpTrendData, setBpTrendData] = useState<BpTrendData[]>([]);
  const [labTrendData, setLabTrendData] = useState<LabTrendData[]>([]);

  useEffect(() => {
    if (patientId) {
      setDialysisSessions(mockDialysisSessions[patientId] || []);
      setMonthlyInvestigations(mockMonthlyInvestigations[patientId] || []);
    }
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

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
      </div>
    </div>
  );
};

export default NurseTrendAnalysis;
