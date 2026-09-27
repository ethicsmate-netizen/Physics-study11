import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { ChapterGrid } from './components/layout/ChapterGrid';
import { Kinematics2DLab } from './modules/kinematics2d/Kinematics2DLab';
import { Kinematics1DLab } from './modules/kinematics1d/Kinematics1DLab';
import { NlmFrictionLab } from './modules/nlmFriction/NlmFrictionLab';
import { VectorsLab } from './modules/vectors/VectorsLab';
import { CircularMotionLab } from './modules/circularMotion/CircularMotionLab';
import { WorkEnergyLab } from './modules/workEnergy/WorkEnergyLab';
import { CenterOfMassLab } from './modules/centerOfMass/CenterOfMassLab';
import { RotationalDynamicsLab } from './modules/rotationalDynamics/RotationalDynamicsLab';
import { ShmLab } from './modules/shm/ShmLab';
import { ThermodynamicsLab } from './modules/thermodynamics/ThermodynamicsLab';
import { CHAPTERS, Chapter } from './data/chapters';
import { ArrowLeft } from 'lucide-react';
import { MockTestArena } from './modules/mockTest/MockTestArena';

export const App: React.FC = () => {
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [initialTab, setInitialTab] = useState<'simulation' | 'theory'>('simulation');
  const [isTestArenaOpen, setIsTestArenaOpen] = useState<boolean>(false);

  const handleSelectChapter = (chapterId: string | null, tab: 'simulation' | 'theory' = 'simulation') => {
    setActiveChapterId(chapterId);
    setInitialTab(tab);
    setIsTestArenaOpen(false);
  };

  const selectedChapter: Chapter | undefined = CHAPTERS.find(
    (c) => c.id === activeChapterId
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-zinc-800 selection:text-white">
      <Navbar
        activeChapterId={activeChapterId}
        onSelectChapter={(id) => handleSelectChapter(id, 'simulation')}
        activeTab={initialTab}
        onSelectTab={(tab) => setInitialTab(tab)}
        isTestArena={isTestArenaOpen}
        onOpenTestArena={() => {
          setIsTestArenaOpen(true);
          setActiveChapterId(null);
        }}
      />

      <main className="flex-1">
        {isTestArenaOpen && (
          <MockTestArena onBackToHome={() => setIsTestArenaOpen(false)} />
        )}

        {!isTestArenaOpen && !activeChapterId && (
          <ChapterGrid
            onSelectChapter={(id, tab) => handleSelectChapter(id, tab || 'simulation')}
            onOpenTestArena={() => setIsTestArenaOpen(true)}
          />
        )}

        {!isTestArenaOpen && activeChapterId === 'kinematics_1d' && (
          <Kinematics1DLab
            initialTab={initialTab}
            onNavigateChapter={(id, tab) => handleSelectChapter(id, tab || 'theory')}
          />
        )}

        {activeChapterId === 'kinematics_2d' && (
          <Kinematics2DLab
            initialTab={initialTab}
            onNavigateChapter={(id, tab) => handleSelectChapter(id, tab || 'theory')}
          />
        )}

        {activeChapterId === 'nlm_friction' && (
          <NlmFrictionLab
            initialTab={initialTab}
            onNavigateChapter={(id, tab) => handleSelectChapter(id, tab || 'theory')}
          />
        )}

        {activeChapterId === 'units_vectors' && (
          <VectorsLab
            initialTab={initialTab}
            onNavigateChapter={(id, tab) => handleSelectChapter(id, tab || 'theory')}
          />
        )}

        {activeChapterId === 'circular_motion' && (
          <CircularMotionLab
            initialTab={initialTab}
            onNavigateChapter={(id, tab) => handleSelectChapter(id, tab || 'theory')}
          />
        )}

        {activeChapterId === 'work_energy' && (
          <WorkEnergyLab
            initialTab={initialTab}
            onNavigateChapter={(id, tab) => handleSelectChapter(id, tab || 'theory')}
          />
        )}

        {activeChapterId === 'center_of_mass' && (
          <CenterOfMassLab
            initialTab={initialTab}
            onNavigateChapter={(id, tab) => handleSelectChapter(id, tab || 'theory')}
          />
        )}

        {activeChapterId === 'rotational_dynamics' && (
          <RotationalDynamicsLab
            initialTab={initialTab}
            onNavigateChapter={(id, tab) => handleSelectChapter(id, tab || 'theory')}
          />
        )}

        {activeChapterId === 'shm' && (
          <ShmLab
            initialTab={initialTab}
            onNavigateChapter={(id, tab) => handleSelectChapter(id, tab || 'theory')}
          />
        )}

        {activeChapterId === 'thermodynamics' && (
          <ThermodynamicsLab
            initialTab={initialTab}
            onNavigateChapter={(id, tab) => handleSelectChapter(id, tab || 'theory')}
          />
        )}

        {/* Fallback for planned chapters */}
        {activeChapterId &&
          !['kinematics_1d', 'kinematics_2d', 'nlm_friction', 'units_vectors', 'circular_motion', 'work_energy', 'center_of_mass', 'rotational_dynamics', 'shm', 'thermodynamics'].includes(activeChapterId) && (
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
              <button
                onClick={() => setActiveChapterId(null)}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 mb-6 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Chapters</span>
              </button>

              <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-zinc-400">
                      {selectedChapter?.number.toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {selectedChapter?.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-medium text-zinc-100">
                    {selectedChapter?.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    {selectedChapter?.description}
                  </p>
                </div>

                <div className="text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-lg border border-zinc-850">
                  Allen Theory Reference: <span className="font-mono text-zinc-200">{selectedChapter?.pdfName}</span>
                </div>

                <div>
                  <span className="text-xs font-medium text-zinc-300 block mb-2">
                    Core Curriculum Concepts
                  </span>
                  <ul className="space-y-1.5">
                    {selectedChapter?.keyConcepts.map((kc, i) => (
                      <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                        <span className="text-zinc-600">•</span>
                        <span>{kc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">
                    Interactive simulation scheduled next.
                  </span>
                  <button
                    onClick={() => setActiveChapterId('kinematics_2d')}
                    className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium transition-colors"
                  >
                    Launch Kinematics 2D Lab
                  </button>
                </div>
              </div>
            </div>
          )}
      </main>

      <footer className="border-t border-zinc-900 py-6 px-4 text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-zinc-400">
            Physics Imagined — Minimalist Learning for JEE & NEET
          </div>
          <div className="font-mono text-[11px] text-zinc-400">
            React & Canvas Engine
          </div>
        </div>
      </footer>
    </div>
  );
};
