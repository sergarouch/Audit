import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conclusionsAPI } from '../services/api';

interface Finding {
  attribute_id: number;
  attribute_name: string;
  status: string;
  details?: string;
  recommendation?: string;
}

interface Conclusion {
  id: number;
  work_paper_id: number;
  overall_score: number;
  compliance_summary: any;
  findings: Finding[];
  cpa_conclusion_text: string;
  generated_at: string;
}

function ConclusionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conclusion, setConclusion] = useState<Conclusion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConclusion();
  }, [id]);

  const loadConclusion = async () => {
    try {
      const res = await conclusionsAPI.get(Number(id));
      setConclusion(res.data);
    } catch (error) {
      console.error('Error loading conclusion:', error);
      alert('Error loading conclusion');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!conclusion) return;

    // Simple CSV export (can be enhanced to use a library like xlsx)
    const headers = ['Attribute Name', 'Status', 'Details', 'Recommendation'];
    const rows = conclusion.findings.map(f => [
      f.attribute_name,
      f.status,
      f.details || '',
      f.recommendation || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-conclusion-${conclusion.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!conclusion) {
    return <div className="p-8">Conclusion not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="text-indigo-600 hover:text-indigo-500 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Audit Conclusion</h1>
            </div>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
            >
              Export to CSV
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Header with Score */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Audit Conclusion Report</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Generated: {new Date(conclusion.generated_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getScoreColor(conclusion.overall_score)}`}>
                  {conclusion.overall_score.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Compliance Score</div>
              </div>
            </div>
          </div>

          {/* Compliance Summary */}
          {conclusion.compliance_summary && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Compliance Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {conclusion.compliance_summary.total_attributes || 0}
                  </div>
                  <div className="text-sm text-gray-500">Total Attributes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {conclusion.compliance_summary.passed || 0}
                  </div>
                  <div className="text-sm text-gray-500">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {conclusion.compliance_summary.failed || 0}
                  </div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {conclusion.compliance_summary.warnings || 0}
                  </div>
                  <div className="text-sm text-gray-500">Warnings</div>
                </div>
              </div>
            </div>
          )}

          {/* CPA Conclusion Text */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">CPA Conclusion</h3>
            <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
              {conclusion.cpa_conclusion_text.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={i} className="font-bold text-gray-900 mt-4">{line.replace(/\*\*/g, '')}</p>;
                }
                return <p key={i} className="mb-2">{line}</p>;
              })}
            </div>
          </div>

          {/* Findings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Detailed Findings</h3>
            <div className="space-y-4">
              {conclusion.findings.map((finding, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-md font-medium text-gray-900">{finding.attribute_name}</h4>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(finding.status)}`}>
                      {finding.status.toUpperCase()}
                    </span>
                  </div>
                  {finding.details && (
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Details:</span> {finding.details}
                    </p>
                  )}
                  {finding.recommendation && (
                    <p className="text-sm text-indigo-700">
                      <span className="font-medium">Recommendation:</span> {finding.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConclusionDetail;
