import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Login } from './components/Login';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { EmployeeHistory } from './components/employee/EmployeeHistory';
import { EmployeeProfile } from './components/employee/EmployeeProfile';
import { CheckInOut } from './components/employee/CheckInOut';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAttendance } from './components/admin/AdminAttendance';
import { AdminEmployees } from './components/admin/AdminEmployees';
import { AdminSchedules } from './components/admin/AdminSchedules';
import { AdminDepartments } from './components/admin/AdminDepartments';
import { AdminProfile } from './components/admin/AdminProfile';

export type UserRole = 'employee' | 'admin' | null;

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        {userRole === 'employee' ? (
          <>
            <Route path="/employee" element={<EmployeeDashboard onLogout={handleLogout} />} />
            <Route path="/employee/check-in" element={<CheckInOut type="in" />} />
            <Route path="/employee/check-out" element={<CheckInOut type="out" />} />
            <Route path="/employee/history" element={<EmployeeHistory />} />
            <Route path="/employee/profile" element={<EmployeeProfile onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/employee" replace />} />
          </>
        ) : (
          <>
            <Route path="/admin" element={<AdminDashboard onLogout={handleLogout} />} />
            <Route path="/admin/attendance" element={<AdminAttendance onLogout={handleLogout} />} />
            <Route path="/admin/employees" element={<AdminEmployees onLogout={handleLogout} />} />
            <Route path="/admin/schedules" element={<AdminSchedules onLogout={handleLogout} />} />
            <Route path="/admin/departments" element={<AdminDepartments onLogout={handleLogout} />} />
            <Route path="/admin/profile" element={<AdminProfile onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}