import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ManagerDashboard from './pages/ManagerDashboard';
import AuditorDashboard from './pages/AuditorDashboard';
import ConclusionDetail from './pages/ConclusionDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/auditor" element={<AuditorDashboard />} />
        <Route path="/conclusions/:id" element={<ConclusionDetail />} />
        <Route path="/" element={<Navigate to="/manager" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
