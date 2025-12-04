import { useState, useEffect } from 'react';
import { PublicFeedbackForm } from './components/PublicFeedbackForm';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { projectId, publicAnonKey } from './utils/supabase/info';

export default function App() {
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    // Check for existing admin session
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setAdminToken(savedToken);
    }

    // Load feature flags
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
      setLoadingFeatures(false);
    }
  };

  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    setView('admin');
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('adminToken');
    setView('public');
  };

  // Check URL for admin access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setView('admin');
    }
  }, []);

  if (loadingFeatures) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Public view
  if (view === 'public') {
    return (
      <>
        <PublicFeedbackForm features={features} />
        
        {/* Hidden admin access button */}
        <button
          onClick={() => setView('admin')}
          className="fixed bottom-4 right-4 w-12 h-12 bg-gray-200 rounded-full opacity-10 hover:opacity-100 transition-opacity"
          title="Admin Access"
        />
      </>
    );
  }

  // Admin view
  if (adminToken) {
    return <AdminDashboard token={adminToken} onLogout={handleAdminLogout} />;
  }

  return <AdminLogin onLogin={handleAdminLogin} />;
}
