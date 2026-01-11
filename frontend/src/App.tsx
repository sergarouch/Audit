import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import AuditorDashboard from './pages/AuditorDashboard';
import ConclusionDetail from './pages/ConclusionDetail';

function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles: string[] }) {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  
  const user = JSON.parse(userStr);
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'manager' ? '/manager' : '/auditor'} replace />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditor"
          element={
            <ProtectedRoute allowedRoles={['auditor']}>
              <AuditorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conclusions/:id"
          element={
            <ProtectedRoute allowedRoles={['manager', 'auditor']}>
              <ConclusionDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
