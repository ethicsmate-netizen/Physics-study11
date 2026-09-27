import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Zap,
  AlertTriangle,
  Award,
  CheckCircle2,
  Circle,
  FlaskConical,
  Filter,
  ExternalLink,
  Flame,
  Target,
  GraduationCap
} from 'lucide-react';
import { BlockMath } from './MathBlock';
import { TheoryCrossNavigator } from './TheoryCrossNavigator';

export type ExamTarget = 'all' | 'jee_main' | 'jee_adv' | 'neet';

export interface FormulaItem {
  title: string;
  latex: string;
  variables?: string;
  conditions: string;
  shortcut?: string;
  examTarget?: ExamTarget[];
}

export interface ExaminerTrap {
  title: string;
  trap: string;
  reality: string;
  severity?: 'critical' | 'high';
  examTarget?: ExamTarget[];
}

export interface SolvedArchetype {
  examTag: string; // e.g. "JEE Main 2024", "JEE Advanced", "NEET 2024"
  title: string;
  problem: string;
  conceptUsed: string;
  kotaShortcut?: string;
  solutionLatex?: string[];
  solutionExplanation: string;
  takeaway: string;
  examTarget?: ExamTarget[];
}

export interface ExamMatrixData {
  jeeMain: { weightage: string; difficulty: string; keyFocus: string };
  jeeAdv: { weightage: string; difficulty: string; keyFocus: string };
  neet: { weightage: string; difficulty: string; keyFocus: string };
}

const chapterDefaults: Record<string, { number: number; pdfName: string }> = {
  vectors: { number: 1, pdfName: 'Allen Physics Vol 1 - Vectors & Calculus' },
  kinematics1d: { number: 2, pdfName: 'Allen Physics Vol 1 - Motion in 1D' },
  kinematics2d: { number: 3, pdfName: 'Allen Physics Vol 1 - Motion in 2D & Projectiles' },
  nlm: { number: 4, pdfName: 'Allen Physics Vol 1 - Laws of Motion & Friction' },
  circular_motion: { number: 5, pdfName: 'Allen Physics Vol 1 - Circular Motion Dynamics' },
  work_energy: { number: 6, pdfName: 'Allen Physics Vol 1 - Work, Energy & Power' },
  center_of_mass: { number: 7, pdfName: 'Allen Physics Vol 2 - Center of Mass & Collisions' },
  rotational_dynamics: { number: 8, pdfName: 'Allen Physics Vol 2 - Rotational Motion' },
  shm: { number: 9, pdfName: 'Allen Physics Vol 2 - Simple Harmonic Motion' },
  thermodynamics: { number: 10, pdfName: 'Allen Physics Vol 2 - Thermal Physics & Thermodynamics' },
};

export interface ExamStudyGuideLayoutProps {
  chapterId: string;
  chapterNumber?: number;
  chapterTitle: string;
  pdfName?: string;
  subtitle?: string;
  description?: string;
  conceptsContent: React.ReactNode;
  formulaSheet: FormulaItem[];
  examinerTraps: ExaminerTrap[];
  pyqArchetypes?: SolvedArchetype[];
  pyqs?: SolvedArchetype[];
  examMatrix: ExamMatrixData;
  checklist: string[];
  labName?: string;
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const ExamStudyGuideLayout: React.FC<ExamStudyGuideLayoutProps> = ({
  chapterId,
  chapterNumber,
  chapterTitle,
  pdfName,
  subtitle,
  description,
  conceptsContent,
  formulaSheet,
  examinerTraps,
  pyqArchetypes,
  pyqs,
  examMatrix,
  checklist,
  labName = 'Interactive Simulation',
  onNavigateChapter,
}) => {
  const [studyTab, setStudyTab] = useState<'concepts' | 'formulas' | 'traps' | 'pyqs' | 'matrix'>('concepts');
  const [targetExam, setTargetExam] = useState<ExamTarget>('all');
  const [checkedTopics, setCheckedTopics] = useState<Record<string, boolean>>({});

  const finalChapterNumber = chapterNumber ?? chapterDefaults[chapterId]?.number ?? 1;
  const finalPdfName = pdfName ?? chapterDefaults[chapterId]?.pdfName ?? 'Allen Kota Study Module';
  const finalDescription = description || subtitle;
  const rawPYQs = pyqArchetypes || pyqs || [];

  // Load checklist state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`study_checklist_${chapterId}`);
      if (saved) {
        setCheckedTopics(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read checklist from localStorage', e);
    }
  }, [chapterId]);

  const toggleTopic = (index: number) => {
    const updated = { ...checkedTopics, [index]: !checkedTopics[index] };
    setCheckedTopics(updated);
    try {
      localStorage.setItem(`study_checklist_${chapterId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save checklist to localStorage', e);
    }
  };

  const completedCount = checklist.filter((_, i) => !!checkedTopics[i]).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100) || 0;

  // Filter formulas based on targetExam
  const filteredFormulas = formulaSheet.filter((f) => {
    if (targetExam === 'all') return true;
    if (!f.examTarget || f.examTarget.length === 0) return true;
    return f.examTarget.includes('all') || f.examTarget.includes(targetExam);
  });

  // Filter traps based on targetExam
  const filteredTraps = examinerTraps.filter((t) => {
    if (targetExam === 'all') return true;
    if (!t.examTarget || t.examTarget.length === 0) return true;
    return t.examTarget.includes('all') || t.examTarget.includes(targetExam);
  });

  // Filter PYQs based on targetExam
  const filteredPYQs = rawPYQs.filter((q) => {
    if (targetExam === 'all') return true;
    if (!q.examTarget || q.examTarget.length === 0) return true;
    return q.examTarget.includes('all') || q.examTarget.includes(targetExam);
  });

  return (
    <div className="space-y-6 text-zinc-300 max-w-5xl mx-auto py-2 text-sm leading-relaxed">
      {/* Top Study Guide Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950/80 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                CH {finalChapterNumber.toString().padStart(2, '0')} STUDY GUIDE
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Allen Kota Syllabus • JEE & NEET
              </span>
              <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline truncate max-w-[280px]">
                {finalPdfName}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              {chapterTitle}
            </h2>
            {finalDescription && (
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                {finalDescription}
              </p>
            )}
          </div>

          {/* Quick Action: Jump to Interactive Lab */}
          {onNavigateChapter && (
            <button
              onClick={() => onNavigateChapter(chapterId, 'simulation')}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 hover:text-sky-200 border border-sky-500/30 transition-all font-medium text-xs shadow-sm whitespace-nowrap self-start md:self-center group"
            >
              <FlaskConical className="w-4 h-4 text-sky-400 group-hover:rotate-12 transition-transform" />
              <span>Launch {labName}</span>
              <ExternalLink className="w-3 h-3 text-sky-400/80" />
            </button>
          )}
        </div>

        {/* Exam Target Selector & Study Mode Pills */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
          {/* Study Mode Tabs */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/90 overflow-x-auto max-w-full">
            <button
              onClick={() => setStudyTab('concepts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                studyTab === 'concepts'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Concepts & Notes</span>
            </button>
            <button
              onClick={() => setStudyTab('formulas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                studyTab === 'formulas'
                  ? 'bg-amber-400 text-zinc-950 font-semibold shadow-sm'
                  : 'text-amber-300/80 hover:text-amber-200 hover:bg-zinc-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>2. Formula & Tricks</span>
            </button>
            <button
              onClick={() => setStudyTab('traps')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                studyTab === 'traps'
                  ? 'bg-rose-500 text-white font-semibold shadow-sm'
                  : 'text-rose-400/80 hover:text-rose-300 hover:bg-zinc-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>3. Examiner Traps</span>
            </button>
            <button
              onClick={() => setStudyTab('pyqs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                studyTab === 'pyqs'
                  ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-sm'
                  : 'text-emerald-400/80 hover:text-emerald-300 hover:bg-zinc-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>4. Solved PYQs</span>
            </button>
            <button
              onClick={() => setStudyTab('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                studyTab === 'matrix'
                  ? 'bg-indigo-500 text-white font-semibold shadow-sm'
                  : 'text-indigo-400/80 hover:text-indigo-300 hover:bg-zinc-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>5. Exam Matrix ({progressPercent}%)</span>
            </button>
          </div>

          {/* Exam Target Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500 text-[11px] font-mono flex items-center gap-1">
              <Filter className="w-3 h-3" /> Focus:
            </span>
            {(['all', 'jee_main', 'jee_adv', 'neet'] as ExamTarget[]).map((mode) => {
              const label =
                mode === 'all'
                  ? 'All Exams'
                  : mode === 'jee_main'
                  ? '🎯 JEE Main'
                  : mode === 'jee_adv'
                  ? '⚡ JEE Advanced'
                  : '🩺 NEET';
              const isSelected = targetExam === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setTargetExam(mode)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-zinc-200 text-zinc-900 font-semibold shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB 1: CORE CONCEPTS & IN-DEPTH NOTES */}
      {studyTab === 'concepts' && (
        <div className="space-y-6">
          {conceptsContent}
        </div>
      )}

      {/* TAB 2: FORMULA CHEAT SHEET & KOTA SHORTCUTS */}
      {studyTab === 'formulas' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200 font-semibold block text-sm">
                High-Speed Formula Sheet & Kota Classroom Shortcuts
              </strong>
              <span>
                Every formula below includes critical boundary conditions (when it holds and when it fails), plus Kota shortcuts for lightning-fast problem-solving in JEE Main & NEET.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFormulas.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-zinc-100">
                      {item.title}
                    </span>
                    {item.examTarget && item.examTarget.length > 0 && !item.examTarget.includes('all') && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700">
                        {item.examTarget.map((t) => t.replace('_', ' ').toUpperCase()).join(', ')}
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 shadow-inner">
                    <BlockMath math={item.latex} />
                  </div>

                  {item.variables && (
                    <p className="text-[11px] text-zinc-400 font-mono">
                      {item.variables}
                    </p>
                  )}

                  <div className="text-xs text-zinc-400 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850/80">
                    <span className="text-zinc-300 font-medium">Valid When: </span>
                    <span>{item.conditions}</span>
                  </div>
                </div>

                {item.shortcut && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-start gap-2">
                    <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-200 block text-[11px] uppercase tracking-wider font-semibold">
                        Kota Speed Trick / Shortcut:
                      </strong>
                      <span>{item.shortcut}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EXAMINER TRAPS & NEGATIVE MARKING ALERTS */}
      {studyTab === 'traps' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200/90 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-200 font-semibold block text-sm">
                Negative Marking Prevention Guide (Examiner's Traps)
              </strong>
              <span>
                90% of students lose marks not from lack of knowledge, but by falling into classic traps carefully set by NTA and IIT question makers. Master these common mistakes before exam day!
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredTraps.map((trap, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                      TRAP #{idx + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {trap.title}
                    </h4>
                  </div>
                  {trap.severity === 'critical' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-700 font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> HIGH NEGATIVE MARK RISK
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* The Mistake */}
                  <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs space-y-1.5">
                    <span className="text-rose-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1">
                      ❌ Common Student Blunder:
                    </span>
                    <p className="text-zinc-300 leading-relaxed">
                      {trap.trap}
                    </p>
                  </div>

                  {/* The Reality / Correction */}
                  <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs space-y-1.5">
                    <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1">
                      ✅ Correct Allen Physics Method:
                    </span>
                    <p className="text-zinc-300 leading-relaxed">
                      {trap.reality}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SOLVED BENCHMARK PYQ ARCHETYPES */}
      {studyTab === 'pyqs' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200/90 flex items-start gap-3">
            <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-200 font-semibold block text-sm">
                Canonical Exam Archetypes (JEE Main, Advanced & NEET)
              </strong>
              <span>
                These benchmark questions represent the recurring structural templates tested year after year. Focus on the concept deduction and the speed shortcuts!
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {filteredPYQs.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                      {item.examTag}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {item.title}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
                    Concept: {item.conceptUsed}
                  </span>
                </div>

                {/* Problem Statement */}
                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-850 text-xs text-zinc-200 leading-relaxed font-mono">
                  {item.problem}
                </div>

                {/* Kota Shortcut */}
                {item.kotaShortcut && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                    <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-200 text-[11px] uppercase tracking-wider block font-semibold">
                        Kota Speed Shortcut (Save 2 Minutes in Exam):
                      </strong>
                      <span>{item.kotaShortcut}</span>
                    </div>
                  </div>
                )}

                {/* Detailed Solution */}
                <div className="space-y-2 text-xs">
                  <span className="text-zinc-300 font-semibold block text-[11px] uppercase tracking-wider">
                    Step-by-Step Rigorous Solution:
                  </span>
                  {item.solutionLatex && item.solutionLatex.map((step, sIdx) => (
                    <div key={sIdx} className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-850">
                      <BlockMath math={step} />
                    </div>
                  ))}
                  <p className="text-zinc-300 leading-relaxed mt-2 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/80">
                    {item.solutionExplanation}
                  </p>
                </div>

                {/* Takeaway */}
                <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-800/30 text-xs text-sky-300 flex items-start gap-2">
                  <Target className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sky-200 text-[11px] uppercase tracking-wider block font-semibold">
                      Key Exam Takeaway:
                    </strong>
                    <span>{item.takeaway}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXAM MATRIX & INTERACTIVE REVISION CHECKLIST */}
      {studyTab === 'matrix' && (
        <div className="space-y-6">
          {/* Weightage Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-amber-300 uppercase tracking-wider">
                  JEE Main
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  NTA Standard
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="text-zinc-400">
                  Weightage: <strong className="text-white">{examMatrix.jeeMain.weightage}</strong>
                </div>
                <div className="text-zinc-400">
                  Typical Difficulty: <span className="text-zinc-200">{examMatrix.jeeMain.difficulty}</span>
                </div>
                <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-850 leading-normal">
                  <span className="text-zinc-300 font-medium">Core Focus: </span>
                  {examMatrix.jeeMain.keyFocus}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-purple-300 uppercase tracking-wider">
                  JEE Advanced
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  IIT Matrix
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="text-zinc-400">
                  Weightage: <strong className="text-white">{examMatrix.jeeAdv.weightage}</strong>
                </div>
                <div className="text-zinc-400">
                  Typical Difficulty: <span className="text-zinc-200">{examMatrix.jeeAdv.difficulty}</span>
                </div>
                <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-850 leading-normal">
                  <span className="text-zinc-300 font-medium">Core Focus: </span>
                  {examMatrix.jeeAdv.keyFocus}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-emerald-300 uppercase tracking-wider">
                  NEET (UG)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  NMC Medical
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="text-zinc-400">
                  Weightage: <strong className="text-white">{examMatrix.neet.weightage}</strong>
                </div>
                <div className="text-zinc-400">
                  Typical Difficulty: <span className="text-zinc-200">{examMatrix.neet.difficulty}</span>
                </div>
                <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-850 leading-normal">
                  <span className="text-zinc-300 font-medium">Core Focus: </span>
                  {examMatrix.neet.keyFocus}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Revision Checklist */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Topic Mastery & Self-Assessment Checklist</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Check off each concept as you achieve 100% confidence. Your progress is saved automatically.
                </p>
              </div>
              <div className="text-xs font-mono px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 font-semibold">
                {completedCount} / {checklist.length} Mastered ({progressPercent}%)
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-850">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {checklist.map((topic, idx) => {
                const isChecked = !!checkedTopics[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleTopic(idx)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-zinc-200'
                        : 'bg-zinc-950/60 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                    )}
                    <span className={`text-xs ${isChecked ? 'line-through text-zinc-500' : ''}`}>
                      {topic}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Embedded Universal Cross-Chapter Navigator */}
      <TheoryCrossNavigator currentChapterId={chapterId} onNavigateChapter={onNavigateChapter} />
    </div>
  );
};
