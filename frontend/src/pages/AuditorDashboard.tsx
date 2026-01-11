import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workPapersAPI, conclusionsAPI } from '../services/api';
import WorkPaperSubmission from '../components/WorkPaperSubmission/WorkPaperSubmission';

interface WorkPaper {
  id: number;
  title: string;
  description?: string;
  status: string;
  submitted_at: string;
}

function AuditorDashboard() {
  const [workPapers, setWorkPapers] = useState<WorkPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkPapers();
  }, []);

  const loadWorkPapers = async () => {
    try {
      const res = await workPapersAPI.getAll();
      setWorkPapers(res.data);
    } catch (error) {
      console.error('Error loading work papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleViewConclusion = async (workPaperId: number) => {
    try {
      const res = await conclusionsAPI.getByWorkPaper(workPaperId);
      navigate(`/conclusions/${res.data.id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        alert('No conclusion found. Please run an audit first by clicking "Run Audit".');
      }
    }
  };

  const handleRunAudit = async (workPaperId: number) => {
    try {
      await workPapersAPI.audit(workPaperId);
      alert('Audit completed! View the conclusion to see results.');
      loadWorkPapers();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error running audit');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Audit Work Papers</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Auditor Dashboard</span>
              <button
                onClick={handleLogout}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WorkPaperSubmission onSubmissionSuccess={loadWorkPapers} />

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Work Papers</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {workPapers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No work papers submitted yet</div>
              ) : (
                workPapers.map((paper) => (
                  <div key={paper.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{paper.title}</h3>
                        {paper.description && (
                          <p className="text-sm text-gray-500 mt-1">{paper.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Status: <span className={`font-medium ${
                            paper.status === 'audited' ? 'text-green-600' : 'text-yellow-600'
                          }`}>{paper.status}</span> | 
                          Submitted: {new Date(paper.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {paper.status === 'pending' && (
                          <button
                            onClick={() => handleRunAudit(paper.id)}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            Run Audit
                          </button>
                        )}
                        {paper.status === 'audited' && (
                          <button
                            onClick={() => handleViewConclusion(paper.id)}
                            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            View Conclusion
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditorDashboard;
