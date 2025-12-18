import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FileCode, TrendingUp, Clock, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/analytics/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-zinc-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const totalSubmissions = stats?.totalSubmissions || 0;
  const ratingDist = stats?.ratingDistribution || {};
  const recentSubmissions = stats?.recentSubmissions || [];

  return (
    <div>
      <Navbar />
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="mb-8" data-testid="dashboard-header">
          <h1 className="text-4xl font-mono font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-zinc-400">Track your progress and improve your coding skills</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6" data-testid="stat-total-submissions">
            <div className="flex items-center justify-between mb-2">
              <FileCode className="w-8 h-8 text-violet-500" />
              <span className="text-3xl font-mono font-bold">{totalSubmissions}</span>
            </div>
            <p className="text-zinc-400">Total Submissions</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6" data-testid="stat-interview-ready">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-emerald-500" />
              <span className="text-3xl font-mono font-bold">{ratingDist['Interview-Ready'] || 0}</span>
            </div>
            <p className="text-zinc-400">Interview Ready</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6" data-testid="stat-production-grade">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-mono font-bold">{ratingDist['Production-Grade'] || 0}</span>
            </div>
            <p className="text-zinc-400">Production Grade</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6" data-testid="stat-beginner">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-mono font-bold">{ratingDist['Beginner'] || 0}</span>
            </div>
            <p className="text-zinc-400">Beginner Level</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-8" data-testid="quick-actions">
          <h2 className="text-2xl font-mono font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/submit">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-3 rounded-lg transition-all neon-glow neon-glow-hover" data-testid="submit-code-button">
                <FileCode className="w-4 h-4 mr-2" />
                Submit New Code
              </Button>
            </Link>
            <Link to="/history">
              <Button className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-6 py-3 rounded-lg transition-all" data-testid="view-history-button">
                View History
              </Button>
            </Link>
            <Link to="/analytics">
              <Button className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-6 py-3 rounded-lg transition-all" data-testid="view-analytics-button">
                View Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8" data-testid="recent-submissions">
          <h2 className="text-2xl font-mono font-bold mb-6">Recent Submissions</h2>
          {recentSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400 mb-4">No submissions yet</p>
              <Link to="/submit">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-3 rounded-lg transition-all" data-testid="first-submission-button">
                  Submit Your First Code
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <Link
                  key={submission.id}
                  to={`/review/${submission.id}`}
                  className="block bg-zinc-950/50 border border-zinc-800 hover:border-violet-500/30 rounded-lg p-6 transition-all"
                  data-testid={`submission-card-${submission.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-lg mb-1">{submission.language} - {submission.category}</p>
                      <p className="text-zinc-400 text-sm line-clamp-2">{submission.problemDescription}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-500 text-sm">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
