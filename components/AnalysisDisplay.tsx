
import React from 'react';
import { AnalysisResult } from '../types';
import EmotionRadarChart from './EmotionRadarChart';

interface AnalysisDisplayProps {
  result: AnalysisResult;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
  const getSentimentColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getIntensityColor = (score: number) => {
    if (score > 75) return 'text-orange-600';
    if (score > 50) return 'text-yellow-600';
    return 'text-indigo-600';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center ${getSentimentColor(result.sentiment.label)}`}>
          <span className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Sentiment</span>
          <span className="text-2xl font-bold">{result.sentiment.label}</span>
          <span className="text-sm mt-2 font-medium">Confidence: {(result.sentiment.confidence * 100).toFixed(0)}%</span>
        </div>
        
        <div className="p-6 rounded-2xl border-2 border-slate-100 bg-white flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">Emotional Intensity</span>
          <span className={`text-2xl font-bold ${getIntensityColor(result.intensityScore)}`}>
            {result.intensityScore.toFixed(0)}/100
          </span>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
             <div 
               className="h-full bg-indigo-500 transition-all duration-1000" 
               style={{ width: `${result.intensityScore}%` }}
             />
          </div>
        </div>

        <div className="p-6 rounded-2xl border-2 border-slate-100 bg-white flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">Analysis Date</span>
          <span className="text-xl font-semibold text-slate-700">
            {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-sm text-slate-400 mt-2">
            {new Date(result.timestamp).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <i className="fa-solid fa-chart-pie mr-2 text-indigo-500"></i>
            Emotion Map
          </h3>
          <EmotionRadarChart data={result.emotions} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <i className="fa-solid fa-brain mr-2 text-purple-500"></i>
            Psychological Summary
          </h3>
          <p className="text-slate-600 leading-relaxed mb-6">
            {result.summary}
          </p>
          <div className="mt-auto">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Key Phrases</h4>
            <div className="flex flex-wrap gap-2">
              {result.keyPhrases.map((phrase, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-sm border border-slate-200">
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <i className="fa-solid fa-quote-left mr-2 text-slate-400"></i>
          Original Content
        </h3>
        <p className="text-slate-500 italic text-sm leading-relaxed border-l-4 border-slate-200 pl-4">
          "{result.originalText}"
        </p>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
