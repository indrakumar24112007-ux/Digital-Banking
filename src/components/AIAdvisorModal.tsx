import React, { useState } from 'react';
import { Sparkles, Brain, Loader2, Send, X, ShieldAlert, TrendingUp } from 'lucide-react';
import { bankEngine } from '../services/bankEngine.ts';
import { getLoggedInUserAccounts, getLoggedInUserLoans } from '../utils/userAccess.ts';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [advice, setAdvice] = useState<string | null>(null);

  if (!isOpen) return null;

  const state = bankEngine.getState();
  const activeUser = state.currentUser;
  const userAccounts = getLoggedInUserAccounts(state);
  const userLoans = getLoggedInUserLoans(state);

  const samplePrompts = [
    'Assess my loan eligibility and recommend optimal tenure & rate',
    'Compare interest yield: Savings (4%) vs Fixed Deposit (7.2%)',
    'Evaluate transaction security rules and fraud prevention',
    'Calculate debt-to-income and EMI repayment strategy',
  ];

  const handleAsk = async (queryText?: string) => {
    const query = queryText || prompt;
    if (!query.trim() || loading) return;

    setLoading(true);
    setAdvice(null);
    setThinkingSteps([
      'Initializing gemini-4-argon with thinkingLevel: ThinkingLevel.HIGH...',
      'Retrieving customer account ledger and credit history...',
    ]);

    try {
      const bankingContext = {
        user: activeUser,
        accounts: userAccounts,
        loans: userLoans,
        recentTransactions: state.transactions.slice(0, 5),
      };

      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, bankingContext }),
      });

      const data = await res.json();
      if (data.thinking) {
        setThinkingSteps(data.thinking);
      }
      setAdvice(data.advice || data.fallbackAdvice || 'Advisor returned no response.');
    } catch {
      setAdvice(
        'Unable to contact server. Ensure dev server is active and network is operational.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-500/20 rounded-xl border border-purple-500/40 text-purple-300">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                <span>AI Financial & Risk Intelligence</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                  gemini-4-argon • High Thinking
                </span>
              </h3>
              <p className="text-xs text-purple-200">
                Cognitive reasoning across OOAD credit, portfolio & security rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close Advisor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Quick Prompts */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Recommended Analysis Topics:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPrompt(p);
                    handleAsk(p);
                  }}
                  className="text-left p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/50 rounded-xl text-xs text-slate-300 transition flex items-center justify-between"
                >
                  <span className="line-clamp-1">{p}</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Thinking Steps Display */}
          {loading && (
            <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-purple-300 font-mono text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="font-bold">Thinking Mode Active (ThinkingLevel.HIGH)...</span>
              </div>
              <div className="space-y-1.5 pl-6 text-xs text-purple-200/80 font-mono">
                {thinkingSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5">
                    <span className="text-purple-400">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advice Output */}
          {advice && !loading && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold font-mono">
                <Sparkles className="w-4 h-4" />
                <span>Deep Reasoning Assessment Completed</span>
              </div>
              <div className="prose prose-invert prose-xs max-w-none text-slate-300 whitespace-pre-line text-sm leading-relaxed">
                {advice}
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask about loan eligibility, interest rates, portfolio yield, or security..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !prompt.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition flex items-center space-x-1.5 shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Analyze</span>
          </button>
        </div>
      </div>
    </div>
  );
};
