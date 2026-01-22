
export interface WritingFeedback {
  correctedText: string;
  explanations: string[];
  variations: {
    professional: string;
    friendly: string;
    simple: string;
  };
}

export interface ReadingSimplification {
  summary: string[];
  simpleVersion: string;
  difficultWords: Array<{ word: string; definition: string }>;
}

export interface VocabularyWord {
  word: string;
  definition: string;
  example: string;
  partOfSpeech: string;
}

export enum AppSection {
  WRITING = 'WRITING',
  READING = 'READING',
  VOCABULARY = 'VOCABULARY'
}
