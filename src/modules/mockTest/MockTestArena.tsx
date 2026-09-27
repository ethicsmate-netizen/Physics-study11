import React, { useState } from 'react';
import { TopicSelector } from './TopicSelector';
import { CbtExamView } from './CbtExamView';
import { TestResultView } from './TestResultView';
import {
  ExamPattern,
  ExamSectionConfig,
  Question,
  TestScoreReport,
  UserResponse,
} from '../../data/mockTests/types';
import { generateMockTest, calculateTestScore } from '../../data/mockTests/testEngine';

interface MockTestArenaProps {
  onBackToHome: () => void;
}

type ArenaViewMode = 'config' | 'exam' | 'result';

export const MockTestArena: React.FC<MockTestArenaProps> = ({ onBackToHome }) => {
  const [viewMode, setViewMode] = useState<ArenaViewMode>('config');

  // Test session state
  const [currentPattern, setCurrentPattern] = useState<ExamPattern>('jee_main');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(60);

  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [activeSections, setActiveSections] = useState<ExamSectionConfig[]>([]);
  const [testReport, setTestReport] = useState<TestScoreReport | null>(null);

  // 1. Start Test handler
  const handleStartTest = (config: {
    pattern: ExamPattern;
    selectedTopicIds: string[];
    timeLimitMinutes: number;
  }) => {
    setCurrentPattern(config.pattern);
    setSelectedTopicIds(config.selectedTopicIds);
    setTimeLimitMinutes(config.timeLimitMinutes);

    const { questions, sections } = generateMockTest(
      config.selectedTopicIds,
      config.pattern
    );

    setActiveQuestions(questions);
    setActiveSections(sections);
    setViewMode('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Submit Test handler
  const handleSubmitTest = (
    responses: Record<string, UserResponse>,
    totalTimeSeconds: number
  ) => {
    const report = calculateTestScore(
      activeQuestions,
      responses,
      currentPattern,
      totalTimeSeconds,
      activeSections
    );

    setTestReport(report);
    setViewMode('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. Retake current test with fresh attempt
  const handleRetakeTest = () => {
    const { questions, sections } = generateMockTest(
      selectedTopicIds,
      currentPattern
    );
    setActiveQuestions(questions);
    setActiveSections(sections);
    setViewMode('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Configure new test
  const handleNewTest = () => {
    setViewMode('config');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {viewMode === 'config' && (
        <TopicSelector
          onStartTest={handleStartTest}
          onBackToHome={onBackToHome}
        />
      )}

      {viewMode === 'exam' && (
        <CbtExamView
          questions={activeQuestions}
          sections={activeSections}
          pattern={currentPattern}
          timeLimitMinutes={timeLimitMinutes}
          onSubmitTest={handleSubmitTest}
          onExitTest={handleNewTest}
        />
      )}

      {viewMode === 'result' && testReport && (
        <TestResultView
          report={testReport}
          onRetakeTest={handleRetakeTest}
          onNewTest={handleNewTest}
          onBackToHome={onBackToHome}
        />
      )}
    </div>
  );
};
