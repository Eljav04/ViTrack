import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { checkAuth, logout } from './store/authSlice';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { EmployeeHistory } from './components/employee/EmployeeHistory';
import { EmployeeProfile } from './components/employee/EmployeeProfile';
import { CheckInOut } from './components/employee/CheckInOut';
import { DayOffPage } from './components/employee/DayOffPage';

import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAttendance } from './components/admin/AdminAttendance';
import { AdminEmployees } from './components/admin/AdminEmployees';
import { AdminSchedules } from './components/admin/AdminSchedules';
import { AdminDepartments } from './components/admin/AdminDepartments';
import { AdminProfile } from './components/admin/AdminProfile';

export type UserRole = 'employee' | 'admin' | 'boss' | null;

import { Toaster } from 'sonner';

export default function App() {
  const dispatch = useAppDispatch();
  const { isCheckingAuth } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (isCheckingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Employee Routes */}
          <Route path="/employee" element={
            <ProtectedRoute allowedRoles={['User']}>
              <EmployeeDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          <Route path="/employee/check-in" element={
            <ProtectedRoute allowedRoles={['User']}>
              <CheckInOut type="in" />
            </ProtectedRoute>
          } />
          <Route path="/employee/check-out" element={
            <ProtectedRoute allowedRoles={['User']}>
              <CheckInOut type="out" />
            </ProtectedRoute>
          } />
          <Route path="/employee/day-off" element={
            <ProtectedRoute allowedRoles={['User']}>
              <DayOffPage />
            </ProtectedRoute>
          } />
          <Route path="/employee/history" element={
            <ProtectedRoute allowedRoles={['User']}>
              <EmployeeHistory />
            </ProtectedRoute>
          } />
          <Route path="/employee/profile" element={
            <ProtectedRoute allowedRoles={['User']}>
              <EmployeeProfile onLogout={handleLogout} />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin', 'Boss']}>
              <AdminDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          <Route path="/admin/attendance" element={
            <ProtectedRoute allowedRoles={['Admin', 'Boss']}>
              <AdminAttendance onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          <Route path="/admin/employees" element={
            <ProtectedRoute allowedRoles={['Admin', 'Boss']}>
              <AdminEmployees onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          <Route path="/admin/schedules" element={
            <ProtectedRoute allowedRoles={['Admin', 'Boss']}>
              <AdminSchedules onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          <Route path="/admin/departments" element={
            <ProtectedRoute allowedRoles={['Admin', 'Boss']}>
              <AdminDepartments onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute allowedRoles={['Admin', 'Boss']}>
              <AdminProfile onLogout={handleLogout} />
            </ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}