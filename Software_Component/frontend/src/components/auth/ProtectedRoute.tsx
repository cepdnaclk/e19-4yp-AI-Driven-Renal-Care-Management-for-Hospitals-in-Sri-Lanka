import React from 'react';
import { Navigate } from 'react-router-dom';
import { User, Role } from '../../types';

interface ProtectedRouteProps {
  user: User | null;
  allowedRoles: Role[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  user, 
  allowedRoles, 
  children 
}) => {
  if (!user) {
    return <Navigate to="/login" replace /> // Not logged in, redirect to login
  }

  if (!allowedRoles.includes(user.role)) {
    // User doesn't have permission, redirect to appropriate dashboard
    if (user.role === Role.NURSE) {
      return <Navigate to="/nurse/dashboard" replace />
    } 
    else if (user.role === Role.DOCTOR) {
      return <Navigate to="/doctor/dashboard" replace />
    } 
    else {
      return <Navigate to="/admin/dashboard" replace />
    }
  }
  return <>{children}</>
}

export default ProtectedRoute