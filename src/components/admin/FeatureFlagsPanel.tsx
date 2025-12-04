import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, AlertCircle, CheckCircle, Flag } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface FeatureFlagsPanelProps {
  token: string;
}

export function FeatureFlagsPanel({ token }: FeatureFlagsPanelProps) {
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [newFeatureName, setNewFeatureName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e760034/features`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setFeatures(result.features || {});
      }
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFeatures = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e760034/admin/features`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
          body: JSON.stringify({ features }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Features saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save features' });
      }
    } catch (error) {
      console.error('Error saving features:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (name: string) => {
    setFeatures({ ...features, [name]: !features[name] });
  };

  const addFeature = () => {
    if (!newFeatureName.trim()) return;
    
    const featureName = newFeatureName.trim();
    setFeatures({ ...features, [featureName]: true });
    setNewFeatureName('');
  };

  const removeFeature = (name: string) => {
    const newFeatures = { ...features };
    delete newFeatures[name];
    setFeatures(newFeatures);
  };

  const presetFeatures = [
    { name: 'showBasicInfo', label: 'Show Basic Info Section', description: 'Display name, email, and company fields' },
    { name: 'showCategories', label: 'Show Categories Section', description: 'Display suggestion category selection' },
    { name: 'showRating', label: 'Show Rating Section', description: 'Display star rating component' },
    { name: 'showEngagementOptions', label: 'Show Engagement Options', description: 'Display contact and subscribe checkboxes' },
    { name: 'showWhatWeWantSection', label: 'Show "What We Want" Section', description: 'Display the introductory bullet points' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Flag className="w-6 h-6 text-blue-600" />
          <h2>Feature Flags Management</h2>
        </div>
        <p className="text-gray-600">
          Enable or disable features on the public feedback form. Changes take effect immediately for all users.
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Preset Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="mb-4">Form Components</h3>
        <div className="space-y-3">
          {presetFeatures.map((preset) => {
            const isEnabled = features[preset.name] !== false; // Default to true
            return (
              <div
                key={preset.name}
                className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-all"
              >
                <div className="flex-1">
                  <h4 className="text-gray-900">{preset.label}</h4>
                  <p className="text-gray-500">{preset.description}</p>
                </div>
                <button
                  onClick={() => toggleFeature(preset.name)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="mb-4">Custom Feature Flags</h3>
        
        {/* Add New Feature */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newFeatureName}
            onChange={(e) => setNewFeatureName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addFeature()}
            placeholder="Enter feature name (e.g., enableNewDesign)"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addFeature}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Feature
          </button>
        </div>

        {/* Custom Features List */}
        <div className="space-y-2">
          {Object.entries(features)
            .filter(([name]) => !presetFeatures.some(p => p.name === name))
            .map(([name, enabled]) => (
              <div
                key={name}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <code className="text-blue-600">{name}</code>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleFeature(name)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => removeFeature(name)}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          
          {Object.keys(features).filter(name => !presetFeatures.some(p => p.name === name)).length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No custom features yet. Add one above to get started.
            </p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <button
          onClick={saveFeatures}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save All Changes
            </>
          )}
        </button>
      </div>

      {/* Usage Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-blue-900 mb-2">💡 How to Use Feature Flags</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Toggle any switch to enable/disable that feature on the public form</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Create custom flags for A/B testing or gradual feature rollouts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Changes are saved to the database and apply to all users instantly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Don't forget to click "Save All Changes" after making modifications</span>
          </li>
        </ul>
      </div>
    </div>
  );
}