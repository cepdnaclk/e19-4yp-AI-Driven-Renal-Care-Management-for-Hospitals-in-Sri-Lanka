import React from 'react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import lang from '../../../utils/lang.json';

interface TrendAnalysisTabProps {
  hemoglobinTrend: any;
  hemoglobinTrendLoading: boolean;
  hemoglobinTrendError: string | null;
}

export const TrendAnalysisTab: React.FC<TrendAnalysisTabProps> = ({
  hemoglobinTrend,
  hemoglobinTrendLoading,
  hemoglobinTrendError,
}) => {
  if (hemoglobinTrendLoading) {
    return (
      <div className="loading-container">
        <div>{lang.patient_profile.trend_analysis.loading}</div>
      </div>
    );
  }

  if (hemoglobinTrendError) {
    return (
      <div className="error-container">
        <div>{lang.error} {hemoglobinTrendError}</div>
      </div>
    );
  }

  if (hemoglobinTrend && hemoglobinTrend.trendData) {
    return (
      <div>
        {hemoglobinTrend.statistics && (
          <div className="statistics">
            <h3>{lang.patient_profile.trend_analysis.statistics_title}</h3>
            <div className="stats-grid">
              <p><strong>{lang.patient_profile.trend_analysis.average}:</strong> {hemoglobinTrend.statistics.average?.toFixed(2)} g/dL</p>
              <p><strong>{lang.patient_profile.trend_analysis.min}:</strong> {hemoglobinTrend.statistics.min?.toFixed(2)} g/dL</p>
              <p><strong>{lang.patient_profile.trend_analysis.max}:</strong> {hemoglobinTrend.statistics.max?.toFixed(2)} g/dL</p>
              <p><strong>{lang.patient_profile.trend_analysis.trend}:</strong> {hemoglobinTrend.statistics.trend}</p>
              <p><strong>{lang.patient_profile.trend_analysis.normal_range}:</strong> {hemoglobinTrend.statistics.normalRange?.min}-{hemoglobinTrend.statistics.normalRange?.max} g/dL</p>
            </div>
          </div>
        )}

        <div className="chart-container">
          <h3>{lang.patient_profile.trend_analysis.chart_title}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={hemoglobinTrend.trendData.map((item: any) => ({ ...item, month: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), normalMin: hemoglobinTrend.statistics?.normalRange?.min || 12, normalMax: hemoglobinTrend.statistics?.normalRange?.max || 16 }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} label={{ value: 'Hemoglobin (g/dL)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: any, name: string) => { if (name === 'hb') return [`${value?.toFixed(2)} g/dL`, 'Hemoglobin']; if (name === 'normalMin') return [`${value} g/dL`, 'Normal Range Min']; if (name === 'normalMax') return [`${value} g/dL`, 'Normal Range Max']; return [value, name]; }} labelFormatter={(label) => `Month: ${label}`} />
              <Legend />
              <Area type="monotone" dataKey="normalMax" stackId="normal" stroke="rgba(0, 255, 0, 0.3)" fill="rgba(0, 255, 0, 0.1)" name="Normal Range" />
              <Area type="monotone" dataKey="normalMin" stackId="normal" stroke="rgba(0, 255, 0, 0.3)" fill="rgba(255, 255, 255, 1)" />
              <Line type="monotone" dataKey="hb" stroke="#8884d8" strokeWidth={3} dot={{ r: 6, strokeWidth: 2 }} name="Hemoglobin Level" />
              <Line type="monotone" dataKey="normalMin" stroke="rgba(0, 255, 0, 0.6)" strokeDasharray="5 5" dot={false} name="Normal Min (12 g/dL)" />
              <Line type="monotone" dataKey="normalMax" stroke="rgba(0, 255, 0, 0.6)" strokeDasharray="5 5" dot={false} name="Normal Max (16 g/dL)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="data-table">
          <h3>{lang.patient_profile.trend_analysis.detailed_data_title}</h3>
          <table>
            <thead>
              <tr>
                <th>{lang.patient_profile.trend_analysis.date}</th>
                <th>{lang.patient_profile.trend_analysis.hemoglobin}</th>
                <th>{lang.patient_profile.trend_analysis.status}</th>
              </tr>
            </thead>
            <tbody>
              {hemoglobinTrend.trendData.map((item: any, index: number) => (
                <tr key={index}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.hb?.toFixed(2)}</td>
                  <td className={`status-${item.status}`}>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>{lang.patient_profile.trend_analysis.no_data}</div>
  );
};