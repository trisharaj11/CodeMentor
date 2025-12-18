import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { toast } from 'sonner';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Analytics = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-zinc-400">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-zinc-400">No analytics data available</div>
        </div>
      </div>
    );
  }

  const ratingData = {
    labels: ['Beginner', 'Interview-Ready', 'Production-Grade'],
    datasets: [
      {
        data: [
          stats.ratingDistribution['Beginner'] || 0,
          stats.ratingDistribution['Interview-Ready'] || 0,
          stats.ratingDistribution['Production-Grade'] || 0
        ],
        backgroundColor: ['#3B82F6', '#F59E0B', '#10B981'],
        borderColor: ['#3B82F620', '#F59E0B20', '#10B98120'],
        borderWidth: 2
      }
    ]
  };

  const languageData = {
    labels: Object.keys(stats.languageDistribution),
    datasets: [
      {
        label: 'Submissions by Language',
        data: Object.values(stats.languageDistribution),
        backgroundColor: '#7C3AED',
        borderColor: '#7C3AED40',
        borderWidth: 1
      }
    ]
  };

  const categoryData = {
    labels: Object.keys(stats.categoryDistribution),
    datasets: [
      {
        label: 'Submissions by Category',
        data: Object.values(stats.categoryDistribution),
        backgroundColor: '#10B981',
        borderColor: '#10B98140',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#FAFAFA',
          font: {
            family: 'JetBrains Mono',
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        ticks: { color: '#A1A1AA' },
        grid: { color: '#27272A' }
      },
      x: {
        ticks: { color: '#A1A1AA' },
        grid: { color: '#27272A' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#FAFAFA',
          font: {
            family: 'JetBrains Mono',
            size: 12
          },
          padding: 20
        }
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="mb-8" data-testid="analytics-header">
          <h1 className="text-4xl font-mono font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-zinc-400">Visualize your coding progress and insights</p>
        </div>

        {/* Overall Stats */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-8" data-testid="overall-stats">
          <h2 className="text-2xl font-mono font-bold mb-4">Overall Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Total Submissions</p>
              <p className="text-4xl font-mono font-bold text-violet-400" data-testid="total-submissions-stat">{stats.totalSubmissions}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-1">Beginner</p>
              <p className="text-4xl font-mono font-bold text-blue-400" data-testid="beginner-stat">{stats.ratingDistribution['Beginner'] || 0}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-1">Interview-Ready</p>
              <p className="text-4xl font-mono font-bold text-amber-400" data-testid="interview-ready-stat">{stats.ratingDistribution['Interview-Ready'] || 0}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-1">Production-Grade</p>
              <p className="text-4xl font-mono font-bold text-emerald-400" data-testid="production-grade-stat">{stats.ratingDistribution['Production-Grade'] || 0}</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8" data-testid="rating-chart">
            <h2 className="text-2xl font-mono font-bold mb-6">Rating Distribution</h2>
            <div style={{ height: '300px' }}>
              <Doughnut data={ratingData} options={doughnutOptions} />
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8" data-testid="language-chart">
            <h2 className="text-2xl font-mono font-bold mb-6">Language Distribution</h2>
            <div style={{ height: '300px' }}>
              <Bar data={languageData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8" data-testid="category-chart">
          <h2 className="text-2xl font-mono font-bold mb-6">Category Distribution</h2>
          <div style={{ height: '300px' }}>
            <Bar data={categoryData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
