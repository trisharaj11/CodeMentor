import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ArrowLeft, Clock, Zap, AlertTriangle, CheckCircle, Code2, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import ReactDiffViewer from 'react-diff-viewer-continued';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReviewReport = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReview();
  }, [id]);

  const fetchReview = async () => {
    try {
      const response = await axios.get(`${API}/review/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load review');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-zinc-400">Loading review...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-zinc-400">Review not found</div>
        </div>
      </div>
    );
  }

  const { submission, review } = data;

  const getRatingColor = (rating) => {
    if (rating === 'Production-Grade') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (rating === 'Interview-Ready') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="mb-8">
          <Link to="/history">
            <Button variant="ghost" className="text-zinc-400 hover:text-white mb-4" data-testid="back-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Button>
          </Link>
          <h1 className="text-4xl font-mono font-bold mb-2" data-testid="review-title">Code Review Report</h1>
          <p className="text-zinc-400">{submission.language} - {submission.category}</p>
        </div>

        {/* Rating Badge */}
        <div className="mb-8">
          <div className={`inline-flex items-center px-6 py-3 rounded-lg border font-mono font-bold text-lg ${getRatingColor(review.rating)}`} data-testid="rating-badge">
            <Award className="w-5 h-5 mr-2" />
            {review.rating}
          </div>
        </div>

        {/* Problem Description */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-8" data-testid="problem-description-section">
          <h2 className="text-2xl font-mono font-bold mb-4">Problem Description</h2>
          <p className="text-zinc-300 leading-relaxed">{submission.problemDescription}</p>
        </div>

        {/* Complexity Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8" data-testid="time-complexity-card">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-violet-500 mr-3" />
              <h3 className="text-xl font-mono font-bold">Time Complexity</h3>
            </div>
            <p className="text-zinc-300 leading-relaxed">{review.timeComplexity}</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8" data-testid="space-complexity-card">
            <div className="flex items-center mb-4">
              <Zap className="w-6 h-6 text-emerald-500 mr-3" />
              <h3 className="text-xl font-mono font-bold">Space Complexity</h3>
            </div>
            <p className="text-zinc-300 leading-relaxed">{review.spaceComplexity}</p>
          </div>
        </div>

        {/* Edge Cases */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-8" data-testid="edge-cases-section">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 mr-3" />
            <h3 className="text-2xl font-mono font-bold">Missing Edge Cases</h3>
          </div>
          <ul className="space-y-2">
            {review.edgeCases.map((edge, idx) => (
              <li key={idx} className="flex items-start" data-testid={`edge-case-${idx}`}>
                <span className="text-amber-400 mr-2">•</span>
                <span className="text-zinc-300">{edge}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Code Structure */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-8" data-testid="code-structure-section">
          <div className="flex items-center mb-4">
            <Code2 className="w-6 h-6 text-blue-500 mr-3" />
            <h3 className="text-2xl font-mono font-bold">Code Structure Review</h3>
          </div>
          <p className="text-zinc-300 leading-relaxed">{review.codeStructure}</p>
        </div>

        {/* Optimization Suggestions */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-8" data-testid="optimization-section">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-500 mr-3" />
            <h3 className="text-2xl font-mono font-bold">Optimization Suggestions</h3>
          </div>
          <ul className="space-y-2">
            {review.optimizationSuggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start" data-testid={`optimization-${idx}`}>
                <span className="text-emerald-400 mr-2">•</span>
                <span className="text-zinc-300">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interview Readiness */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-8" data-testid="interview-readiness-section">
          <h3 className="text-2xl font-mono font-bold mb-4">Interview Readiness Feedback</h3>
          <p className="text-zinc-300 leading-relaxed">{review.interviewReadiness}</p>
        </div>

        {/* Code Comparison */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-8" data-testid="code-diff-section">
          <h3 className="text-2xl font-mono font-bold mb-6">Code Comparison: Original vs Optimized</h3>
          <div className="diff-viewer rounded-lg overflow-hidden border border-zinc-700">
            <ReactDiffViewer
              oldValue={submission.code}
              newValue={review.optimizedCode}
              splitView={true}
              leftTitle="Your Code"
              rightTitle="Optimized Code"
              styles={{
                variables: {
                  dark: {
                    diffViewerBackground: '#18181B',
                    diffViewerColor: '#FAFAFA',
                    addedBackground: '#10B98120',
                    addedColor: '#10B981',
                    removedBackground: '#EF444420',
                    removedColor: '#EF4444',
                    wordAddedBackground: '#10B98140',
                    wordRemovedBackground: '#EF444440',
                    addedGutterBackground: '#10B98110',
                    removedGutterBackground: '#EF444410',
                    gutterBackground: '#27272A',
                    gutterBackgroundDark: '#18181B',
                    highlightBackground: '#27272A',
                    highlightGutterBackground: '#3F3F46',
                  },
                },
              }}
              useDarkTheme={true}
            />
          </div>
        </div>

        {/* Interview Questions */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8" data-testid="interview-questions-section">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-6 h-6 text-violet-500 mr-3" />
            <h3 className="text-2xl font-mono font-bold">Interview Questions Based on Your Code</h3>
          </div>
          <ul className="space-y-4">
            {review.interviewQuestions.map((question, idx) => (
              <li key={idx} className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4" data-testid={`interview-question-${idx}`}>
                <span className="text-violet-400 font-mono font-bold mr-2">Q{idx + 1}:</span>
                <span className="text-zinc-300">{question}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Import Award icon from lucide-react
import { Award } from 'lucide-react';

export default ReviewReport;
