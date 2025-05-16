
export interface User {
  id: string;
  username: string;
  questionnaireCompleted: boolean;
}

export interface QuestionnaireAnswers {
  [key: string]: string; // e.g. "question1": "Answer to question 1"
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface MentalStateAnalysis {
  overallSentiment: string;
  stressLevel: string;
  anxietyLevel: string;
  depressionLevel: string;
  summary: string;
}

export interface MentalStateVisualizationData {
  visualizationDataUri: string;
  analysisSummary: string;
}
