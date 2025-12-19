
import React, { useState, useEffect, useCallback } from 'react';
import { AnalysisResult, AnalysisStatus } from './types';
import { analyzeText } from './services/geminiService';
import AnalysisDisplay from './components/AnalysisDisplay';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('sentiment_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to local storage
  useEffect(() => {
    localStorage.setItem('sentiment_history', JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setStatus(AnalysisStatus.LOADING);
    setErrorMessage(null);

    try {
      const result = await analyzeText(inputText);
      const fullResult = result as AnalysisResult;
      
      setCurrentResult(fullResult);
      setHistory(prev => [fullResult, ...prev.slice(0, 9)]); // Keep last 10
      setStatus(AnalysisStatus.SUCCESS);
      setInputText('');
    } catch (error) {
      console.error("Analysis Error:", error);
      setStatus(AnalysisStatus.ERROR);
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred during analysis.");
    }
  };

  const selectHistoryItem = (item: AnalysisResult) => {
    setCurrentResult(item);
    setStatus(AnalysisStatus.SUCCESS);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('sentiment_history');
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <i className="fa-solid fa-microchip text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">SentimenLens</h1>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none">Emotion Intelligence</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
             <span className="text-sm text-slate-500 font-medium">Powered by Gemini AI</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Results */}
        <div className="lg:col-span-8 space-y-8">
          {/* Input Section */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-800">
              <i className="fa-solid fa-pen-nib mr-2 text-indigo-500"></i>
              What's on your mind?
            </h2>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste feedback, social media posts, or any text here to reveal the hidden emotional context..."
                className="w-full min-h-[160px] p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none resize-none text-slate-700 placeholder:text-slate-400"
              />
              <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                <button
                  onClick={handleAnalyze}
                  disabled={status === AnalysisStatus.LOADING || !inputText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-100 transition-all flex items-center space-x-2 active:scale-95"
                >
                  {status === AnalysisStatus.LOADING ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      <span>Analyze Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                {errorMessage}
              </div>
            )}
          </section>

          {/* Results Section */}
          <section>
            {currentResult ? (
              <AnalysisDisplay result={currentResult} />
            ) : (
              <div className="h-64 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
                  <i className="fa-solid fa-layer-group"></i>
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-500">No analysis active</p>
                  <p className="text-sm">Submit text above to see detailed emotion mapping</p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: History & Stats */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-full max-h-[calc(100vh-160px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800">Recent Analysis</h2>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  CLEAR ALL
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {history.length > 0 ? (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectHistoryItem(item)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all group ${
                      currentResult?.id === item.id 
                      ? 'border-indigo-500 bg-indigo-50/50' 
                      : 'border-slate-50 hover:border-slate-200 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        item.sentiment.label === 'Positive' ? 'bg-green-100 text-green-700' :
                        item.sentiment.label === 'Negative' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.sentiment.label}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-snug group-hover:text-indigo-700 transition-colors">
                      {item.originalText}
                    </p>
                  </button>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-2 opacity-60">
                  <i className="fa-solid fa-clock-rotate-left text-3xl"></i>
                  <p className="text-sm">History is empty</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="bg-indigo-50 rounded-2xl p-4 flex items-center space-x-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <i className="fa-solid fa-lightbulb"></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Pro Tip</p>
                  <p className="text-[11px] text-indigo-700 leading-tight">Paste dialogue or emails to detect subtle sarcasm or passive-aggression.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-slate-400 text-sm">
          <p>© 2024 SentimenLens AI. Intelligent Sentiment Analysis.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-indigo-500 transition-colors">API Status</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">Documentation</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
