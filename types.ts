
export interface WordData {
  word: string;
  definition: string;
  sarcasticDefinition: string; 
  phonetic: string;
  origin: string;
  contextSentence: string;
  moodColor: string; // HEX code
  glowIntensity?: number; // 0.0 to 1.0: Control brightness
  glowSpread?: number; // 10 to 200: Control radius of atmosphere
  fontVibe?: 'SERIF' | 'MONO' | 'SANS';
  nativeContexts: {
    label: string; 
    description: string; 
    sentence: string; 
    connotation: string; 
    significance: string; 
  }[];
  usageGuide: string;
  synonyms: { word: string; definition: string }[]; 
  antonyms: { word: string; definition: string }[]; 
  psychologicalTrigger: string; 
  visualPrompt: string; 
  memeTemplate: string; 
  imageUrl?: string; 
  quiz: {
    question: string;
    options: string[]; 
    answer: string;
    explanation: string;
  }[]; 
}

export interface LearningSession {
  topic: string;
  fullText: string;
  words: WordData[];
}

export enum AppState {
  IDLE = 'IDLE',
  TEXT_SELECTION = 'TEXT_SELECTION',
  GENERATING = 'GENERATING',
  PARAGRAPH_PREVIEW = 'PARAGRAPH_PREVIEW',
  LEARNING_SEQUENCE = 'LEARNING_SEQUENCE',
  PARAGRAPH_REVIEW = 'PARAGRAPH_REVIEW',
  FINAL_ASSESSMENT = 'FINAL_ASSESSMENT',
  SESSION_COMPLETE = 'SESSION_COMPLETE',
  CUSTOM_VIEW = 'CUSTOM_VIEW',
  FORGE_WIZARD = 'FORGE_WIZARD',
}
