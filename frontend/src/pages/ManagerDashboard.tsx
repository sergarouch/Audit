import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attributesAPI, workPapersAPI, conclusionsAPI } from '../services/api';
import AttributeManager from '../components/AttributeManager/AttributeManager';

interface Attribute {
  id: number;
  name: string;
  description?: string;
  attribute_type: 'validation_rule' | 'checklist_criteria';
  rule_type?: string;
  rule_parameters?: any;
  criteria_text?: string;
  is_required?: boolean;
}

interface WorkPaper {
  id: number;
  title: string;
  status: string;
  submitted_at: string;
}

function ManagerDashboard() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [workPapers, setWorkPapers] = useState<WorkPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attrsRes, papersRes] = await Promise.all([
        attributesAPI.getAll(),
        workPapersAPI.getAll(),
      ]);
      setAttributes(attrsRes.data);
      setWorkPapers(papersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
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
        alert('No conclusion found for this work paper. Please run an audit first.');
      }
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
              <h1 className="text-xl font-semibold text-gray-900">Audit Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Manager Dashboard</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Audit Attributes</h2>
            <AttributeManager
              attributes={attributes}
              onAttributeChange={loadData}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Work Papers</h2>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {workPapers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No work papers submitted yet</div>
                ) : (
                  workPapers.map((paper) => (
                    <div key={paper.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{paper.title}</h3>
                          <p className="text-sm text-gray-500">
                            Status: {paper.status} | Submitted: {new Date(paper.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewConclusion(paper.id)}
                          className="ml-4 text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          View Conclusion
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
