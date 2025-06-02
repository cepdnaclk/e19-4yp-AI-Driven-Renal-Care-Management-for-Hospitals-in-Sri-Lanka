import React, { useState, useEffect } from 'react';
import { HeadingLarge, HeadingMedium } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Table } from 'baseui/table-semantic';
import { Button } from 'baseui/button';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types';

// Mock data
const mockSubmissions = [
  {
    id: '1',
    patientId: '101',
    patientName: 'John Doe',
    type: 'Dialysis Session',
    date: '2025-05-29',
    status: 'Completed',
    reviewedBy: 'Dr. Smith',
    reviewDate: '2025-05-30'
  },
  {
    id: '2',
    patientId: '102',
    patientName: 'Sarah Smith',
    type: 'Monthly Investigation',
    date: '2025-05-15',
    status: 'Completed',
    reviewedBy: 'Dr. Johnson',
    reviewDate: '2025-05-16'
  },
  {
    id: '3',
    patientId: '103',
    patientName: 'Michael Johnson',
    type: 'Dialysis Session',
    date: '2025-05-30',
    status: 'Pending Review',
    reviewedBy: '',
    reviewDate: ''
  },
  {
    id: '4',
    patientId: '104',
    patientName: 'Emily Davis',
    type: 'Monthly Investigation',
    date: '2025-05-28',
    status: 'Pending Review',
    reviewedBy: '',
    reviewDate: ''
  },
  {
    id: '5',
    patientId: '105',
    patientName: 'Robert Wilson',
    type: 'Dialysis Session',
    date: '2025-05-27',
    status: 'Completed',
    reviewedBy: 'Dr. Williams',
    reviewDate: '2025-05-28'
  }
];

const NurseSubmissionStatus: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, this would fetch from an API
    setSubmissions(mockSubmissions);
    setPendingCount(mockSubmissions.filter(s => s.status === 'Pending Review').length);
  }, []);

  const handleViewPatient = (patientId: string) => {
    navigate(`/nurse/patients/${patientId}`);
  };

  return (
    <Block>
      <HeadingLarge>Submission Status</HeadingLarge>
      
      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
        <Cell span={12}>
          <Card>
            <StyledBody>
              <Block display="flex" justifyContent="space-between" alignItems="center" marginBottom="16px">
                <HeadingMedium marginTop="0" marginBottom="0">
                  Recent Submissions {pendingCount > 0 && `(${pendingCount} pending review)`}
                </HeadingMedium>
              </Block>
              
              <Table
                columns={['ID', 'Patient', 'Type', 'Date', 'Status', 'Reviewed By', 'Review Date', 'Actions']}
                data={submissions.map(submission => [
                  submission.id,
                  submission.patientName,
                  submission.type,
                  submission.date,
                  <Block
                    key={`status-${submission.id}`}
                    color={submission.status === 'Completed' ? 'positive' : 'warning'}
                  >
                    {submission.status}
                  </Block>,
                  submission.reviewedBy || '-',
                  submission.reviewDate || '-',
                  <Button
                    key={`action-${submission.id}`}
                    size="compact"
                    onClick={() => handleViewPatient(submission.patientId)}
                  >
                    View Patient
                  </Button>
                ])}
                emptyMessage="No submissions found"
              />
            </StyledBody>
          </Card>
        </Cell>
      </Grid>
    </Block>
  );
};

export default NurseSubmissionStatus;
