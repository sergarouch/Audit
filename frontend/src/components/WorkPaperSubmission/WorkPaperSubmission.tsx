import { useState } from 'react';
import { workPapersAPI } from '../../services/api';

interface Props {
  onSubmissionSuccess: () => void;
}

function WorkPaperSubmission({ onSubmissionSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formFields, setFormFields] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const addFormField = () => {
    setFormFields([...formFields, { key: '', value: '' }]);
  };

  const updateFormField = (index: number, key: string, value: string) => {
    const newFields = [...formFields];
    newFields[index] = { key, value };
    setFormFields(newFields);
  };

  const removeFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }

      // Build form_data object from fields
      const formDataObj: Record<string, any> = {};
      formFields.forEach((field) => {
        if (field.key) {
          // Try to parse as number if possible
          const numValue = Number(field.value);
          formDataObj[field.key] = isNaN(numValue) ? field.value : numValue;
        }
      });
      formData.append('form_data', JSON.stringify(formDataObj));

      // Add files
      files.forEach((file) => {
        formData.append('files', file);
      });

      await workPapersAPI.create(formData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setFormFields([{ key: '', value: '' }]);
      setFiles([]);
      
      onSubmissionSuccess();
      alert('Work paper submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error submitting work paper');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit Work Paper</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g., Q4 2023 Accounts Receivable"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={3}
            placeholder="Brief description of the work paper"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Form Data (Key-Value Pairs)
          </label>
          {formFields.map((field, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Key (e.g., balance, account_name)"
                value={field.key}
                onChange={(e) => updateFormField(index, e.target.value, field.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <input
                type="text"
                placeholder="Value"
                value={field.value}
                onChange={(e) => updateFormField(index, field.key, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {formFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFormField(index)}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addFormField}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
          >
            + Add Field
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Files (PDF, Excel, Images)</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png"
          />
          {files.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: {files.map(f => f.name).join(', ')}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Work Paper'}
        </button>
      </form>
    </div>
  );
}

export default WorkPaperSubmission;
