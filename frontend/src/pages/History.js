import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Search, Calendar } from 'lucide-react';
import { Input } from '../components/ui/input';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const History = () => {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [searchQuery, languageFilter, categoryFilter, submissions]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/code/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(response.data);
      setFilteredSubmissions(response.data);
    } catch (error) {
      toast.error('Failed to load submission history');
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    if (searchQuery) {
      filtered = filtered.filter(sub =>
        sub.problemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (languageFilter !== 'all') {
      filtered = filtered.filter(sub => sub.language === languageFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(sub => sub.category === categoryFilter);
    }

    setFilteredSubmissions(filtered);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-zinc-400">Loading history...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="mb-8" data-testid="history-header">
          <h1 className="text-4xl font-mono font-bold mb-2">Submission History</h1>
          <p className="text-zinc-400">View and review your past code submissions</p>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-950/50 border-zinc-800 pl-10 text-zinc-100"
                data-testid="search-input"
              />
            </div>

            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100"
              data-testid="language-filter"
            >
              <option value="all">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100"
              data-testid="category-filter"
            >
              <option value="all">All Categories</option>
              <option value="DSA">DSA</option>
              <option value="MERN">MERN</option>
            </select>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4" data-testid="submissions-list">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
              <p className="text-zinc-400">No submissions found</p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <Link
                key={submission.id}
                to={`/review/${submission.id}`}
                className="block bg-zinc-900/50 border border-zinc-800 hover:border-violet-500/30 rounded-xl p-6 transition-all"
                data-testid={`submission-item-${submission.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded-lg text-sm font-mono">
                        {submission.language}
                      </span>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-mono">
                        {submission.category}
                      </span>
                    </div>
                    <p className="text-zinc-100 font-medium mb-2 line-clamp-2">
                      {submission.problemDescription}
                    </p>
                    <div className="flex items-center text-zinc-500 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(submission.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
