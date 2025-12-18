import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Zap, Target, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Glow */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.15), transparent 70%)'
          }}
        />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-8">
            <Code2 className="w-16 h-16 text-violet-500" />
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-mono font-bold mb-6 leading-tight" data-testid="hero-title">
            CodeMentor AI
          </h1>
          
          <p className="text-2xl lg:text-3xl text-zinc-400 mb-4 font-mono">
            Intelligent Code Reviewer
          </p>
          
          <p className="text-lg text-zinc-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your code with AI-powered analysis. Get instant feedback on time complexity, 
            edge cases, and optimization strategies—like having a FAANG interviewer at your fingertips.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Link to="/register" data-testid="get-started-button">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-8 py-6 text-lg rounded-lg transition-all neon-glow neon-glow-hover">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login" data-testid="login-button">
              <Button className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-8 py-6 text-lg rounded-lg transition-all">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-mono font-bold text-center mb-16" data-testid="features-title">
            Why CodeMentor AI?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800 hover:border-violet-500/30 transition-all duration-300 rounded-xl p-8" data-testid="feature-card-analysis">
              <Zap className="w-12 h-12 text-violet-500 mb-4" />
              <h3 className="text-2xl font-mono font-bold mb-3">Deep Analysis</h3>
              <p className="text-zinc-400 leading-relaxed">
                Get comprehensive code reviews including time/space complexity, edge cases, and optimization suggestions.
              </p>
            </div>
            
            <div className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800 hover:border-violet-500/30 transition-all duration-300 rounded-xl p-8" data-testid="feature-card-interview">
              <Target className="w-12 h-12 text-emerald-500 mb-4" />
              <h3 className="text-2xl font-mono font-bold mb-3">Interview Ready</h3>
              <p className="text-zinc-400 leading-relaxed">
                Receive interview-style feedback and questions to prepare you for technical interviews at top companies.
              </p>
            </div>
            
            <div className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800 hover:border-violet-500/30 transition-all duration-300 rounded-xl p-8" data-testid="feature-card-progress">
              <TrendingUp className="w-12 h-12 text-amber-500 mb-4" />
              <h3 className="text-2xl font-mono font-bold mb-3">Track Progress</h3>
              <p className="text-zinc-400 leading-relaxed">
                Monitor your improvement with detailed analytics and insights into your coding journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center glass rounded-2xl p-12">
          <h2 className="text-4xl font-mono font-bold mb-6" data-testid="cta-title">
            Ready to level up your code?
          </h2>
          <p className="text-xl text-zinc-400 mb-8">
            Join developers improving their coding skills with AI-powered feedback.
          </p>
          <Link to="/register" data-testid="cta-button">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-8 py-4 text-lg rounded-lg transition-all neon-glow neon-glow-hover">
              Start Free Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
