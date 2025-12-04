import { useState, useEffect } from 'react';
import {
  BarChart3,
  LogOut,
  Trash2,
  Calendar,
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Filter,
  Download,
  Settings,
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { FeatureFlagsPanel } from './FeatureFlagsPanel';
import { SettingsPanel } from './SettingsPanel';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';

interface Feedback {
  id: string;
  name: string;
  email: string;
  company: string;
  categories: string[];
  suggestion: string;
  rating: number;
  contactMe: boolean;
  subscribe: boolean;
  timestamp: string;
}

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

export function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'feedback' | 'features' | 'settings'>('overview');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e760034/admin/feedback`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setFeedback(result.feedback);
      } else {
        console.error('Failed to fetch feedback:', result);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e760034/admin/feedback/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Token': token,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setFeedback(feedback.filter(f => f.id !== id));
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Name', 'Email', 'Company', 'Categories', 'Suggestion', 'Rating', 'Contact Me', 'Subscribe'];
    const rows = feedback.map(f => [
      new Date(f.timestamp).toLocaleDateString(),
      f.name || 'Anonymous',
      f.email || 'N/A',
      f.company || 'N/A',
      f.categories.join('; '),
      f.suggestion.replace(/"/g, '""'),
      f.rating || 'N/A',
      f.contactMe ? 'Yes' : 'No',
      f.subscribe ? 'Yes' : 'No',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rastechno-feedback-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Analytics calculations
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating} ★`,
    count: feedback.filter(f => f.rating === rating).length,
  }));

  const categoryData = [
    { name: 'Services', value: feedback.filter(f => f.categories.includes('services')).length, color: '#3B82F6' },
    { name: 'Consultancy', value: feedback.filter(f => f.categories.includes('consultancy')).length, color: '#8B5CF6' },
    { name: 'Technology', value: feedback.filter(f => f.categories.includes('technology')).length, color: '#06B6D4' },
    { name: 'General', value: feedback.filter(f => f.categories.includes('general')).length, color: '#10B981' },
  ].filter(d => d.value > 0);

  // Group by date for timeline
  const timelineData = feedback.reduce((acc, f) => {
    const date = new Date(f.timestamp).toLocaleDateString();
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ date, count: 1 });
    }
    return acc;
  }, [] as { date: string; count: number }[]).slice(-7);

  const stats = {
    total: feedback.length,
    avgRating: feedback.length > 0 
      ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating > 0).length).toFixed(1)
      : 'N/A',
    contactRequests: feedback.filter(f => f.contactMe).length,
    subscribers: feedback.filter(f => f.subscribe).length,
  };

  const filteredFeedback = filter === 'all' 
    ? feedback 
    : feedback.filter(f => f.categories.includes(filter));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RaS Techno Admin Panel
            </h1>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'feedback', label: 'All Feedback', icon: MessageSquare },
              { id: 'features', label: 'Feature Flags', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-500">Total Feedback</h3>
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-gray-900">{stats.total}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-500">Average Rating</h3>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-gray-900">{stats.avgRating} / 5</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-500">Contact Requests</h3>
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-gray-900">{stats.contactRequests}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-500">Newsletter Signups</h3>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-gray-900">{stats.subscribers}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Rating Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="mb-4">Rating Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="mb-4">Feedback by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="mb-4">Submissions Timeline (Last 7 Days)</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === 'feedback' && (
          <>
            {/* Filter and Download */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="services">Services</option>
                  <option value="consultancy">Consultancy</option>
                  <option value="technology">Technology</option>
                  <option value="general">General</option>
                </select>
                <span className="text-gray-600">
                  {filteredFeedback.length} {filteredFeedback.length === 1 ? 'result' : 'results'}
                </span>
              </div>

              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              {filteredFeedback.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900">
                          {item.name || 'Anonymous'}
                        </h3>
                        {item.rating > 0 && (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{item.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-gray-500">
                        {item.email && (
                          <span className="flex items-center gap-1">
                            {item.email}
                          </span>
                        )}
                        {item.company && <span>• {item.company}</span>}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {item.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-gray-700 mb-4">{item.suggestion}</p>

                  {(item.contactMe || item.subscribe) && (
                    <div className="flex gap-4 text-gray-600 pt-4 border-t border-gray-100">
                      {item.contactMe && (
                        <span className="flex items-center gap-1">
                          ✓ Wants contact
                        </span>
                      )}
                      {item.subscribe && (
                        <span className="flex items-center gap-1">
                          ✓ Newsletter signup
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {filteredFeedback.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No feedback submissions yet</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'features' && <FeatureFlagsPanel token={token} />}
        
        {activeTab === 'settings' && <SettingsPanel token={token} />}
      </div>
    </div>
  );
}