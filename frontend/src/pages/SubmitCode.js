import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SubmitCode = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('javascript');
  const [category, setCategory] = useState('DSA');
  const [problemDescription, setProblemDescription] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error('Please write some code');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/code/submit`,
        {
          language,
          category,
          problemDescription,
          code
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Code submitted successfully!');
      navigate(`/review/${response.data.submissionId}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const getLanguageForMonaco = () => {
    const langMap = {
      'javascript': 'javascript',
      'python': 'python',
      'cpp': 'cpp'
    };
    return langMap[language] || 'javascript';
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="mb-8" data-testid="submit-code-header">
          <h1 className="text-4xl font-mono font-bold mb-2">Submit Code for Review</h1>
          <p className="text-zinc-400">Get AI-powered feedback on your code</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-zinc-300 mb-2 block">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-zinc-950/50 border-zinc-800 text-zinc-100" data-testid="language-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="javascript" data-testid="language-javascript">JavaScript</SelectItem>
                  <SelectItem value="python" data-testid="language-python">Python</SelectItem>
                  <SelectItem value="cpp" data-testid="language-cpp">C++</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-zinc-300 mb-2 block">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-zinc-950/50 border-zinc-800 text-zinc-100" data-testid="category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="DSA" data-testid="category-dsa">DSA (Data Structures & Algorithms)</SelectItem>
                  <SelectItem value="MERN" data-testid="category-mern">MERN Stack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-zinc-300 mb-2 block">Problem Description</Label>
            <Textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="bg-zinc-950/50 border-zinc-800 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 rounded-lg text-zinc-100 placeholder:text-zinc-600 min-h-[100px]"
              placeholder="Describe the problem you're solving..."
              required
              data-testid="problem-description-input"
            />
          </div>

          <div>
            <Label className="text-zinc-300 mb-2 block">Code</Label>
            <div className="monaco-editor-wrapper" data-testid="code-editor">
              <Editor
                height="500px"
                language={getLanguageForMonaco()}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  cursorBlinking: 'smooth',
                  padding: { top: 16, bottom: 16 }
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-8 py-3 rounded-lg transition-all neon-glow neon-glow-hover"
            disabled={loading}
            data-testid="submit-button"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Code...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit for Review
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SubmitCode;
