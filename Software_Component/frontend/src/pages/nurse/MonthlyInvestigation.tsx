import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import { AddInvestigationModal } from '../../components/AddInvestigationModal';
import monthlyInvestigationService, { MonthlyInvestigationData } from '../../services/monthlyInvestigationService';

const NurseMonthlyInvestigation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [investigations, setInvestigations] = useState<MonthlyInvestigationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchInvestigations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await monthlyInvestigationService.getPatientInvestigations(id!);
      setInvestigations(response.investigations);
    } catch (err) {
      setError('Failed to load monthly investigations');
      console.error('Error fetching investigations:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchInvestigations();
    }
  }, [id, fetchInvestigations]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedInvestigations = [...investigations].sort((a, b) => {
    const aValue = a[sortField as keyof MonthlyInvestigationData];
    const bValue = b[sortField as keyof MonthlyInvestigationData];

    // Handle undefined/null values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
    if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleModalSubmit = async (formData: any) => {
    try {
      const investigationData = {
        date: formData.date,
        scrPreHD: formData.scrPreHD ? parseFloat(formData.scrPreHD) : undefined,
        scrPostHD: formData.scrPostHD ? parseFloat(formData.scrPostHD) : undefined,
        bu_pre_hd: formData.bu_pre_hd ? parseFloat(formData.bu_pre_hd) : undefined,
        bu_post_hd: formData.bu_post_hd ? parseFloat(formData.bu_post_hd) : undefined,
        hb: formData.hb ? parseFloat(formData.hb) : undefined,
        serumNaPreHD: formData.serumNaPreHD ? parseFloat(formData.serumNaPreHD) : undefined,
        serumNaPostHD: formData.serumNaPostHD ? parseFloat(formData.serumNaPostHD) : undefined,
        serumKPreHD: formData.serumKPreHD ? parseFloat(formData.serumKPreHD) : undefined,
        serumKPostHD: formData.serumKPostHD ? parseFloat(formData.serumKPostHD) : undefined,
        sCa: formData.sCa ? parseFloat(formData.sCa) : undefined,
        sPhosphate: formData.sPhosphate ? parseFloat(formData.sPhosphate) : undefined,
        albumin: formData.albumin ? parseFloat(formData.albumin) : undefined,
        ua: formData.ua ? parseFloat(formData.ua) : undefined,
        hco: formData.hco ? parseFloat(formData.hco) : undefined,
        al: formData.al ? parseFloat(formData.al) : undefined,
        hbA1C: formData.hbA1C ? parseFloat(formData.hbA1C) : undefined,
        pth: formData.pth ? parseFloat(formData.pth) : undefined,
        vitD: formData.vitD ? parseFloat(formData.vitD) : undefined,
        serumIron: formData.serumIron ? parseFloat(formData.serumIron) : undefined,
        serumFerritin: formData.serumFerritin ? parseFloat(formData.serumFerritin) : undefined,
        notes: formData.notes || undefined
      };

      await monthlyInvestigationService.createInvestigation(id!, investigationData);
      setShowModal(false);
      fetchInvestigations();
      alert('Monthly investigation saved successfully');
    } catch (err) {
      console.error('Error saving investigation:', err);
      alert('Failed to save monthly investigation');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatValue = (value: number | undefined) => {
    return value !== undefined ? value.toString() : '-';
  };

  if (loading) {
    return <LoadingSpinner message="Loading monthly investigations..." />;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
        <button onClick={fetchInvestigations} style={{ padding: '8px 16px' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Monthly Investigations</h1>
          <h2>Patient ID: {id}</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Add New Investigation
        </button>
      </div>

      <AddInvestigationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        patientId={id!}
      />

      <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <h3>Investigation History ({investigations.length} records)</h3>
        </div>

        {investigations.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
            No monthly investigations found for this patient.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th
                    onClick={() => handleSort('date')}
                    style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                  >
                    Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('hb')}
                    style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                  >
                    Hb {sortField === 'hb' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('scrPreHD')}
                    style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                  >
                    SCR Pre {sortField === 'scrPreHD' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('scrPostHD')}
                    style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                  >
                    SCR Post {sortField === 'scrPostHD' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('bu_pre_hd')}
                    style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                  >
                    BU Pre {sortField === 'bu_pre_hd' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('bu_post_hd')}
                    style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                  >
                    BU Post {sortField === 'bu_post_hd' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('serumKPreHD')}
                    style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                  >
                    K+ Pre {sortField === 'serumKPreHD' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('serumKPostHD')}
                    style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                  >
                    K+ Post {sortField === 'serumKPostHD' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('sCa')}
                    style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                  >
                    Ca {sortField === 'sCa' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('sPhosphate')}
                    style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                  >
                    P {sortField === 'sPhosphate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('albumin')}
                    style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                  >
                    Albumin {sortField === 'albumin' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedInvestigations.map((investigation) => (
                  <tr key={investigation.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{formatDate(investigation.date)}</td>
                    <td style={{ padding: '12px' }}>{formatValue(investigation.hb)}</td>
                    <td style={{ padding: '12px' }}>{formatValue(investigation.scrPreHD)}</td>
                    <td style={{ padding: '12px' }}>{formatValue(investigation.scrPostHD)}</td>
                    <td style={{ padding: '12px' }}>{formatValue(investigation.bu_pre_hd)}</td>
                    <td style={{ padding: '12px' }}>{formatValue(investigation.bu_post_hd)}</td>
                    <td style={{ padding: '12px' }}>{formatValue(investigation.serumKPreHD)}</td>
                    <td style={{ padding: '12px' }}>{formatValue(investigation.serumKPostHD)}</td>
                    <td style={{ padding: '12px' }}>{formatValue(investigation.sCa)}</td>
                    <td style={{ padding: '12px' }}>{formatValue(investigation.sPhosphate)}</td>
                    <td style={{ padding: '12px' }}>{formatValue(investigation.albumin)}</td>
                    <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {investigation.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseMonthlyInvestigation;