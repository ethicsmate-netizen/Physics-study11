import { ALL_QUESTIONS } from './testQuestions';
import {
  ExamPattern,
  ExamSectionConfig,
  Question,
  QuestionScoredResult,
  SectionScoreSummary,
  TestScoreReport,
  TopicScoreSummary,
  UserResponse,
} from './types';

/**
 * Generates an authentic mock test for the selected topic IDs and exam pattern.
 * Ensures exact question counts and distributions:
 * - JEE Main: 20 Single MCQs + 5 Numerical = 25 Questions (100 Marks)
 * - JEE Advanced: 4 Single + 6 Multiple Correct + 4 Paragraph (2 passages) + 4 Numerical = 18 Questions (60 Marks)
 */
export function generateMockTest(
  selectedTopicIds: string[],
  pattern: ExamPattern
): { questions: Question[]; sections: ExamSectionConfig[] } {
  // Filter questions belonging to selected topics
  const topicFiltered = ALL_QUESTIONS.filter((q) =>
    selectedTopicIds.includes(q.chapterId)
  );

  // Fallback to all questions if no match found
  const pool = topicFiltered.length > 0 ? topicFiltered : ALL_QUESTIONS;

  const singlesPool = pool.filter((q) => q.type === 'single');
  const multiPool = pool.filter((q) => q.type === 'multiple');
  const numPool = pool.filter((q) => q.type === 'numerical');
  const paraPool = pool.filter((q) => q.type === 'paragraph');

  // Helper to pick N items from a pool, cycling if needed to fill exact count
  function samplePool(items: Question[], count: number, idPrefix: string): Question[] {
    if (items.length === 0) {
      // Fallback to ALL_QUESTIONS of same type
      const globalSameType = ALL_QUESTIONS.filter((q) => q.type === items[0]?.type);
      items = globalSameType.length > 0 ? globalSameType : ALL_QUESTIONS;
    }

    // Shuffle pool deterministically / pseudo-randomly
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const result: Question[] = [];

    for (let i = 0; i < count; i++) {
      const base = shuffled[i % shuffled.length];
      result.push({
        ...base,
        id: `${idPrefix}_${i + 1}_${base.id}`,
      });
    }
    return result;
  }

  // Helper to sample paragraph questions in linked pairs (2 questions per paragraph)
  function sampleParagraphs(targetQuestionCount: number): Question[] {
    // Group paragraph questions by paragraphId
    const groups: Record<string, Question[]> = {};
    for (const q of paraPool.length > 0 ? paraPool : ALL_QUESTIONS.filter((x) => x.type === 'paragraph')) {
      const pid = q.paragraphId || 'generic_para';
      if (!groups[pid]) groups[pid] = [];
      groups[pid].push(q);
    }

    const groupKeys = Object.keys(groups).sort(() => Math.random() - 0.5);
    const result: Question[] = [];
    let groupIdx = 0;

    while (result.length < targetQuestionCount) {
      const key = groupKeys[groupIdx % groupKeys.length];
      const pair = groups[key] || [];
      for (const q of pair) {
        if (result.length < targetQuestionCount) {
          result.push({
            ...q,
            id: `p_${result.length + 1}_${q.id}`,
          });
        }
      }
      groupIdx++;
    }
    return result;
  }

  if (pattern === 'jee_main') {
    // JEE Main: 20 Single MCQs + 5 Numerical
    const section1Questions = samplePool(singlesPool, 20, 'main_s');
    const section2Questions = samplePool(numPool, 5, 'main_n');

    const testQuestions = [...section1Questions, ...section2Questions];

    const sections: ExamSectionConfig[] = [
      {
        id: 'sec_main_single',
        name: 'Section 1: Single Choice MCQs',
        type: 'single',
        questionIndices: Array.from({ length: 20 }, (_, i) => i),
        markingDescription: '+4 for Correct, -1 for Incorrect, 0 for Unattempted',
        correctMarks: 4,
        negativeMarks: 1,
      },
      {
        id: 'sec_main_num',
        name: 'Section 2: Numerical Value',
        type: 'numerical',
        questionIndices: Array.from({ length: 5 }, (_, i) => i + 20),
        markingDescription: '+4 for Correct, -1 for Incorrect, 0 for Unattempted',
        correctMarks: 4,
        negativeMarks: 1,
      },
    ];

    return { questions: testQuestions, sections };
  } else {
    // JEE Advanced: 4 Single + 6 Multiple Correct + 4 Paragraph (2 passages) + 4 Numerical = 18 Questions
    const sec1 = samplePool(singlesPool, 4, 'adv_single');
    const sec2 = samplePool(multiPool, 6, 'adv_multi');
    const sec3 = sampleParagraphs(4);
    const sec4 = samplePool(numPool, 4, 'adv_num');

    const testQuestions = [...sec1, ...sec2, ...sec3, ...sec4];

    const sections: ExamSectionConfig[] = [
      {
        id: 'sec_adv_single',
        name: 'Section 1: Single Correct',
        type: 'single',
        questionIndices: [0, 1, 2, 3],
        markingDescription: '+3 for Correct, -1 for Incorrect, 0 for Unattempted',
        correctMarks: 3,
        negativeMarks: 1,
      },
      {
        id: 'sec_adv_multi',
        name: 'Section 2: One or More Correct',
        type: 'multiple',
        questionIndices: [4, 5, 6, 7, 8, 9],
        markingDescription: '+4 for All Correct, -2 for Incorrect, +1 Partial Mark per correct option without error',
        correctMarks: 4,
        negativeMarks: 2,
        hasPartialMarks: true,
      },
      {
        id: 'sec_adv_para',
        name: 'Section 3: Paragraph Comprehension',
        type: 'paragraph',
        questionIndices: [10, 11, 12, 13],
        markingDescription: '+3 for Correct, -1 for Incorrect, 0 for Unattempted (2 Passages × 2 Questions)',
        correctMarks: 3,
        negativeMarks: 1,
      },
      {
        id: 'sec_adv_num',
        name: 'Section 4: Numerical Value',
        type: 'numerical',
        questionIndices: [14, 15, 16, 17],
        markingDescription: '+3 for Correct, 0 for Incorrect (No Negative Marking)',
        correctMarks: 3,
        negativeMarks: 0,
      },
    ];

    return { questions: testQuestions, sections };
  }
}

/**
 * Calculates score, accuracy, and detailed question-by-question result based on
 * the official marking schemes specified by the user.
 */
export function calculateTestScore(
  questions: Question[],
  responses: Record<string, UserResponse>,
  pattern: ExamPattern,
  totalTimeSeconds: number,
  sections: ExamSectionConfig[]
): TestScoreReport {
  let totalScore = 0;
  let maxScore = 0;
  let attemptedCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let partialCount = 0;
  let unattemptedCount = 0;

  const scoredQuestions: QuestionScoredResult[] = [];
  const topicMap: Record<string, TopicScoreSummary> = {};

  questions.forEach((q) => {
    const res = responses[q.id];
    let marksAwarded = 0;
    let isCorrect = false;
    let isPartial = false;
    let isIncorrect = false;
    let isUnattempted = true;

    // Determine max marks for this question based on section/pattern
    let qMaxMarks = 4;
    if (pattern === 'jee_main') {
      qMaxMarks = 4;
    } else {
      // JEE Advanced: 3 for Single, 4 for Multi, 3 for Para, 3 for Numerical
      if (q.type === 'single' || q.type === 'paragraph' || q.type === 'numerical') {
        qMaxMarks = 3;
      } else if (q.type === 'multiple') {
        qMaxMarks = 4;
      }
    }
    maxScore += qMaxMarks;

    // Evaluate response
    if (q.type === 'numerical') {
      const valStr = res?.numericalValue?.trim();
      if (!valStr || valStr === '') {
        isUnattempted = true;
        marksAwarded = 0;
      } else {
        isUnattempted = false;
        attemptedCount++;
        const val = parseFloat(valStr);
        const target = q.numericalAnswer ?? 0;
        const tol = q.numericalTolerance ?? 0.05;

        if (!isNaN(val) && Math.abs(val - target) <= tol) {
          isCorrect = true;
          marksAwarded = pattern === 'jee_main' ? 4 : 3;
        } else {
          isIncorrect = true;
          // In JEE Advanced numerical: NO negative marking (0 marks for wrong)
          marksAwarded = pattern === 'jee_main' ? -1 : 0;
        }
      }
    } else if (q.type === 'multiple' && pattern === 'jee_adv') {
      const selected = res?.selectedOptions || [];
      if (selected.length === 0) {
        isUnattempted = true;
        marksAwarded = 0;
      } else {
        isUnattempted = false;
        attemptedCount++;
        const correctSet = new Set(q.correctAnswers);
        const hasWrongOption = selected.some((opt) => !correctSet.has(opt));

        if (hasWrongOption) {
          isIncorrect = true;
          marksAwarded = -2; // -2 for wrong option chosen in multi-correct
        } else {
          // No wrong options chosen
          const correctChosenCount = selected.filter((opt) => correctSet.has(opt)).length;
          if (correctChosenCount === q.correctAnswers.length) {
            isCorrect = true;
            marksAwarded = 4; // Full marks
          } else {
            // Partial marks: +1 for each correct option chosen
            isPartial = true;
            marksAwarded = correctChosenCount * 1;
          }
        }
      }
    } else {
      // Single correct MCQ or Paragraph MCQ
      const selected = res?.selectedOptions || [];
      if (selected.length === 0) {
        isUnattempted = true;
        marksAwarded = 0;
      } else {
        isUnattempted = false;
        attemptedCount++;
        const userChoice = selected[0];
        const correctChoice = q.correctAnswers[0];

        if (userChoice === correctChoice) {
          isCorrect = true;
          marksAwarded = pattern === 'jee_main' ? 4 : 3;
        } else {
          isIncorrect = true;
          marksAwarded = -1;
        }
      }
    }

    if (isCorrect) correctCount++;
    else if (isPartial) partialCount++;
    else if (isIncorrect) incorrectCount++;
    else if (isUnattempted) unattemptedCount++;

    totalScore += marksAwarded;

    scoredQuestions.push({
      question: q,
      response: res,
      marksAwarded,
      maxMarks: qMaxMarks,
      isCorrect,
      isPartial,
      isIncorrect,
      isUnattempted,
    });

    // Update topic breakdown
    if (!topicMap[q.chapterId]) {
      topicMap[q.chapterId] = {
        chapterId: q.chapterId,
        chapterTitle: q.chapterTitle,
        total: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        marks: 0,
        maxMarks: 0,
      };
    }
    const t = topicMap[q.chapterId];
    t.total += 1;
    if (!isUnattempted) t.attempted += 1;
    if (isCorrect || isPartial) t.correct += 1;
    if (isIncorrect) t.incorrect += 1;
    t.marks += marksAwarded;
    t.maxMarks += qMaxMarks;
  });

  // Calculate section breakdowns
  const sectionBreakdown: SectionScoreSummary[] = sections.map((sec) => {
    let sMarks = 0;
    let sMaxMarks = 0;
    let sCorrect = 0;
    let sIncorrect = 0;

    sec.questionIndices.forEach((idx) => {
      const sq = scoredQuestions[idx];
      if (sq) {
        sMarks += sq.marksAwarded;
        sMaxMarks += sq.maxMarks;
        if (sq.isCorrect || sq.isPartial) sCorrect++;
        if (sq.isIncorrect) sIncorrect++;
      }
    });

    return {
      sectionName: sec.name,
      type: sec.type,
      total: sec.questionIndices.length,
      correct: sCorrect,
      incorrect: sIncorrect,
      marks: sMarks,
      maxMarks: sMaxMarks,
    };
  });

  const percentage = Math.max(0, Math.round((totalScore / maxScore) * 100));
  const accuracy = attemptedCount > 0 ? Math.round(((correctCount + partialCount) / attemptedCount) * 100) : 0;

  return {
    pattern,
    totalScore,
    maxScore,
    percentage,
    accuracy,
    totalQuestions: questions.length,
    attemptedCount,
    correctCount,
    incorrectCount,
    partialCount,
    unattemptedCount,
    totalTimeSeconds,
    scoredQuestions,
    topicBreakdown: topicMap,
    sectionBreakdown,
  };
}
