
export interface EmotionScore {
  emotion: string;
  score: number; // 0 to 1
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  originalText: string;
  sentiment: {
    label: 'Positive' | 'Negative' | 'Neutral';
    score: number; // -1 to 1
    confidence: number;
  };
  emotions: EmotionScore[];
  keyPhrases: string[];
  summary: string;
  intensityScore: number; // 0 to 100
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
