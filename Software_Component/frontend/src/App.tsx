import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Auth Components
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout Components
import Layout from './components/layout/Layout';

// Role-based Pages
import NurseDashboard from './pages/nurse/Dashboard';
import NursePatientSearch from './pages/nurse/NursePatientSearch';
import NursePatientProfile from './pages/nurse/PatientProfile';
import NurseDialysisSession from './pages/nurse/DialysisSession';
import NurseMonthlyInvestigation from './pages/nurse/MonthlyInvestigation';
import NurseSubmissionStatus from './pages/nurse/SubmissionStatus';
import NurseNotifications from './pages/nurse/Notifications';
import NurseTrendAnalysis from './pages/nurse/TrendAnalysis';
import AddPatient from './pages/nurse/AddNewPatient';

import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatientSearch from './pages/doctor/DoctorPatientSearch';
import DoctorPatientProfile from './pages/doctor/PatientProfile';
import DoctorClinicalDecisions from './pages/doctor/ClinicalDecisions';
import DoctorNotifications from './pages/doctor/Notifications';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUserManagement from './pages/admin/UserManagement';

// Types
import { User, Role } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simulate authentication check
  useEffect(() => {
    const checkAuth = () => {
      // In a real app, this would check with a backend API
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
        <Route path="/login"
          element={
            user ? (
              <Navigate
                to={ user.role === Role.NURSE ? "/nurse/dashboard" : (user.role === Role.DOCTOR ? "/doctor/dashboard" : "/admin/dashboard")}
                replace //redirection will not allow the user to go back to the previous page using the browser's back button
              />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
 
        {/* Nurse Routes */}
        <Route path="/nurse" element={  // Parent route for all nurse paths. Only users with the Role.NURSE role can access children.
          <ProtectedRoute user={user} allowedRoles={[Role.NURSE]}>
            <Layout user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<NurseDashboard />} />
          <Route path="patients" element={<NursePatientSearch />} />
          <Route path="patients/:id" element={<NursePatientProfile />} />
          <Route path="patients/:id/dialysis-session" element={<NurseDialysisSession />} />
          <Route path="patients/:id/monthly-investigation" element={<NurseMonthlyInvestigation />} />
          <Route path="submission-status" element={<NurseSubmissionStatus />} />
          <Route path="notifications" element={<NurseNotifications />} />
          <Route path="trend-analysis/:patientId" element={<NurseTrendAnalysis />} />
          <Route path="patients/add" element={<AddPatient />} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor" element={
          <ProtectedRoute user={user} allowedRoles={[Role.DOCTOR]}>
            <Layout user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="patients" element={<DoctorPatientSearch />} />
          <Route path="patients/:id" element={<DoctorPatientProfile />} />
          <Route path="patients/:id/clinical-decisions" element={<DoctorClinicalDecisions />} />
          <Route path="notifications" element={<DoctorNotifications />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute user={user} allowedRoles={[Role.ADMIN]}>
            <Layout user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="user-management" element={<AdminUserManagement />} />
        </Route>

        {/* Default Routes */}
        <Route path="/" element={
          user ? (
            <Navigate
              to={ user.role === Role.NURSE ? "/nurse/dashboard" : user.role === Role.DOCTOR ? "/doctor/dashboard" : "/admin/dashboard" }
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;