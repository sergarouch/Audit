import { useState } from 'react';
import { attributesAPI } from '../../services/api';

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

interface Props {
  attributes: Attribute[];
  onAttributeChange: () => void;
}

function AttributeManager({ attributes, onAttributeChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    attribute_type: 'validation_rule' as 'validation_rule' | 'checklist_criteria',
    rule_type: 'threshold',
    rule_parameters: { field: '', operator: '>', value: '' },
    criteria_text: '',
    is_required: true,
  });

  const handleCreate = () => {
    setEditingAttribute(null);
    setFormData({
      name: '',
      description: '',
      attribute_type: 'validation_rule',
      rule_type: 'threshold',
      rule_parameters: { field: '', operator: '>', value: '' },
      criteria_text: '',
      is_required: true,
    });
    setShowForm(true);
  };

  const handleEdit = (attr: Attribute) => {
    setEditingAttribute(attr);
    setFormData({
      name: attr.name,
      description: attr.description || '',
      attribute_type: attr.attribute_type,
      rule_type: attr.rule_type || 'threshold',
      rule_parameters: attr.rule_parameters || { field: '', operator: '>', value: '' },
      criteria_text: attr.criteria_text || '',
      is_required: attr.is_required !== undefined ? attr.is_required : true,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData: any = {
        name: formData.name,
        description: formData.description || undefined,
        attribute_type: formData.attribute_type,
      };

      if (formData.attribute_type === 'validation_rule') {
        submitData.rule_type = formData.rule_type;
        submitData.rule_parameters = {
          ...formData.rule_parameters,
          value: formData.rule_parameters.value === '' ? undefined : 
                 (isNaN(Number(formData.rule_parameters.value)) ? formData.rule_parameters.value : 
                  Number(formData.rule_parameters.value)),
        };
      } else {
        submitData.criteria_text = formData.criteria_text;
        submitData.is_required = formData.is_required;
      }

      if (editingAttribute) {
        await attributesAPI.update(editingAttribute.id, submitData);
      } else {
        await attributesAPI.create(submitData);
      }

      setShowForm(false);
      onAttributeChange();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error saving attribute');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return;
    try {
      await attributesAPI.delete(id);
      onAttributeChange();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error deleting attribute');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Attributes</h3>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          + Add Attribute
        </button>
      </div>

      {showForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Attribute Type</label>
              <select
                value={formData.attribute_type}
                onChange={(e) => setFormData({ ...formData, attribute_type: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="validation_rule">Validation Rule</option>
                <option value="checklist_criteria">Checklist Criteria</option>
              </select>
            </div>

            {formData.attribute_type === 'validation_rule' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rule Type</label>
                  <select
                    value={formData.rule_type}
                    onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="threshold">Threshold</option>
                    <option value="required_field">Required Field</option>
                    <option value="date_range">Date Range</option>
                  </select>
                </div>

                {formData.rule_type === 'threshold' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Field Name</label>
                      <input
                        type="text"
                        required
                        value={formData.rule_parameters.field}
                        onChange={(e) => setFormData({
                          ...formData,
                          rule_parameters: { ...formData.rule_parameters, field: e.target.value }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g., balance"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Operator</label>
                        <select
                          value={formData.rule_parameters.operator}
                          onChange={(e) => setFormData({
                            ...formData,
                            rule_parameters: { ...formData.rule_parameters, operator: e.target.value }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value=">">Greater than (&gt;)</option>
                          <option value=">=">Greater than or equal (&gt;=)</option>
                          <option value="<">Less than (&lt;)</option>
                          <option value="<=">Less than or equal (&lt;=)</option>
                          <option value="==">Equal (==)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Value</label>
                        <input
                          type="text"
                          required
                          value={formData.rule_parameters.value}
                          onChange={(e) => setFormData({
                            ...formData,
                            rule_parameters: { ...formData.rule_parameters, value: e.target.value }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="e.g., 0"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.rule_type === 'required_field' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Field Name</label>
                    <input
                      type="text"
                      required
                      value={formData.rule_parameters.field || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        rule_parameters: { ...formData.rule_parameters, field: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="e.g., account_name"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Criteria Text</label>
                  <input
                    type="text"
                    required
                    value={formData.criteria_text}
                    onChange={(e) => setFormData({ ...formData, criteria_text: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., Supporting documentation attached"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_required}
                      onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required</span>
                  </label>
                </div>
              </>
            )}

            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
              >
                {editingAttribute ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {attributes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No attributes defined yet</div>
        ) : (
          attributes.map((attr) => (
            <div key={attr.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{attr.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{attr.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                    {attr.attribute_type === 'validation_rule' ? 'Validation Rule' : 'Checklist Criteria'}
                  </span>
                  {attr.attribute_type === 'checklist_criteria' && attr.criteria_text && (
                    <p className="text-xs text-gray-600 mt-1">{attr.criteria_text}</p>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(attr)}
                    className="text-indigo-600 hover:text-indigo-500 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(attr.id)}
                    className="text-red-600 hover:text-red-500 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AttributeManager;
