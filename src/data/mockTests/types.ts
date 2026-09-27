export type ExamPattern = 'jee_main' | 'jee_adv';

export type QuestionType = 'single' | 'multiple' | 'numerical' | 'paragraph';

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface QuestionSolution {
  stepByStep: string[];
  finalAnswer: string;
  kotaShortcut?: string;
  conceptKey?: string;
}

export interface Question {
  id: string;
  chapterId: string;
  chapterTitle: string;
  type: QuestionType;
  examTarget: 'jee_main' | 'jee_adv' | 'both';
  allenSection?: 'JM' | 'JA' | 'O2';
  title: string;
  paragraphId?: string;
  paragraphTitle?: string;
  paragraphText?: string;
  text: string;
  options?: QuestionOption[];
  correctAnswers: string[]; // ['A'] for single/para, ['A', 'C'] for multi
  numericalAnswer?: number;
  numericalTolerance?: number; // e.g. 0.05
  solution: QuestionSolution;
}

export type QuestionStatus =
  | 'not_visited'
  | 'not_answered'
  | 'answered'
  | 'marked_review'
  | 'answered_marked_review';

export interface UserResponse {
  questionId: string;
  selectedOptions: string[];
  numericalValue: string;
  status: QuestionStatus;
  timeSpentSeconds: number;
}

export interface QuestionScoredResult {
  question: Question;
  response?: UserResponse;
  marksAwarded: number;
  maxMarks: number;
  isCorrect: boolean;
  isPartial: boolean;
  isIncorrect: boolean;
  isUnattempted: boolean;
}

export interface TopicScoreSummary {
  chapterId: string;
  chapterTitle: string;
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  marks: number;
  maxMarks: number;
}

export interface SectionScoreSummary {
  sectionName: string;
  type: QuestionType;
  total: number;
  correct: number;
  incorrect: number;
  marks: number;
  maxMarks: number;
}

export interface TestScoreReport {
  pattern: ExamPattern;
  totalScore: number;
  maxScore: number;
  percentage: number;
  accuracy: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  partialCount: number;
  unattemptedCount: number;
  totalTimeSeconds: number;
  scoredQuestions: QuestionScoredResult[];
  topicBreakdown: Record<string, TopicScoreSummary>;
  sectionBreakdown: SectionScoreSummary[];
}

export interface ExamSectionConfig {
  id: string;
  name: string;
  type: QuestionType;
  questionIndices: number[]; // 0-based indices in test questions array
  markingDescription: string;
  correctMarks: number;
  negativeMarks: number;
  hasPartialMarks?: boolean;
}
