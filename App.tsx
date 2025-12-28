
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Added ArrowRight to imports
import { BrainCircuit, Rocket, Database, AlertCircle, Code2, ArrowRight } from 'lucide-react';
import Background from './components/Background';
import NexusView from './components/NexusView';
import ParagraphView from './components/ParagraphView';
import TextSelector from './components/TextSelector';
import SnakeCursor from './components/SnakeCursor';
import SessionComplete from './components/SessionComplete';
import FinalAssessment from './components/FinalAssessment';
import CustomForgeView from './components/CustomForgeView';
import CinematicIntro from './components/CinematicIntro';
import ForgeWizard from './components/ForgeWizard';
import { generateLearningSession, generateWordImage } from './services/geminiService';
import { LearningSession, AppState } from './types';
import { playSound, startAmbiance } from './utils/sound';

const NeuralForgeLoader = () => (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="relative w-48 h-48">
            <motion.div className="absolute inset-0 border-[4px] border-neon-blue rounded-full border-t-transparent shadow-[0_0_40px_#00F0FF]" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute inset-6 border-[4px] border-neon-purple rounded-full border-b-transparent shadow-[0_0_40px_#BD00FF]" animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
            <div className="absolute inset-0 flex items-center justify-center"><Rocket className="text-white animate-bounce" size={40} /></div>
        </div>
        <h2 className="mt-16 text-white font-mono text-sm uppercase tracking-[1em] font-black animate-pulse">Forging Your Path...</h2>
    </motion.div>
);

const ProgressHUD: React.FC<{ progress: number; moodColor: string }> = ({ progress, moodColor }) => {
    const railPath = "M 4 996 L 996 996 L 996 4 L 4 4 L 4 996";
    return (
        <div className="absolute inset-0 z-[100] pointer-events-none p-0 overflow-visible">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                <defs>
                    <filter id="lightningFractal" x="-30%" y="-30%" width="160%" height="160%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="4" result="noise">
                            <animate attributeName="seed" values="1;100" dur="1s" repeatCount="indefinite" />
                        </feTurbulence>
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
                    </filter>
                    <linearGradient id="electricGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor={moodColor} />
                        <stop offset="40%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor={moodColor} />
                    </linearGradient>
                </defs>
                <path d={railPath} fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.02" />
                <motion.path d={railPath} fill="none" stroke="url(#electricGrad)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: progress }} transition={{ duration: 0.6, ease: "easeOut" }} filter="url(#lightningFractal)" className="opacity-90" />
            </svg>
            <div className="absolute top-10 left-12 flex items-center gap-4 opacity-30">
                <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                <span className="font-mono text-[7px] tracking-[1.2em] uppercase text-white font-bold">NEURAL_SYNC_ACTIVE</span>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<'TOPIC' | 'TEXT' | 'FORGE'>('TOPIC');
  const [inputValue, setInputValue] = useState(''); 
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [session, setSession] = useState<LearningSession | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [forgeLayers, setForgeLayers] = useState<{ html: string; css: string; js: string }>({ html: '', css: '', js: '' });
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [wordDirection, setWordDirection] = useState(0); 
  const [images, setImages] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session && session.words[currentWordIndex]) {
        document.documentElement.style.setProperty('--mood-color', session.words[currentWordIndex].moodColor);
    }
  }, [currentWordIndex, session]);

  const initiateFlow = async (text: string, manualWords: string[] = []) => {
      startAmbiance();
      setError(null);
      if (mode === 'FORGE') {
          setAppState(AppState.FORGE_WIZARD);
          return;
      }
      setAppState(AppState.GENERATING);
      try {
          const result = await generateLearningSession(text, mode, manualWords);
          setSession(result);
          result.words.forEach((word, idx) => {
              generateWordImage(word.visualPrompt).then(img => img && setImages(p => ({ ...p, [idx]: img })));
          });
          setShowIntro(true);
          playSound('success');
      } catch (err) {
          setError("Connection failure. Check Neural Link.");
          setAppState(AppState.IDLE);
      }
  };

  const handleJsonLoad = (json: string) => {
    const data = JSON.parse(json) as LearningSession;
    setSession(data);
    setImages({});
    data.words.forEach((word, idx) => {
      if (word.imageUrl) setImages(prev => ({ ...prev, [idx]: word.imageUrl! }));
    });
    // Triggers full cinematic sequence for manual data
    setShowIntro(true);
    playSound('success');
  };

  const handleNextWord = () => {
      if (!session) return;
      if (currentWordIndex < session.words.length - 1) {
          setWordDirection(1);
          setCurrentWordIndex(prev => prev + 1);
          setCurrentPage(0);
      } else {
          setAppState(AppState.PARAGRAPH_REVIEW);
          playSound('success');
      }
  };

  const handlePrevWord = () => {
      if (currentWordIndex > 0) {
          setWordDirection(-1);
          setCurrentWordIndex(prev => prev + 1);
          setCurrentWordIndex(prev => prev - 1);
          setCurrentPage(6); 
      } else {
          setAppState(AppState.PARAGRAPH_PREVIEW);
      }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-white bg-[#010103]">
      <SnakeCursor />
      <Background />
      <AnimatePresence mode="wait">
        {showIntro && session && (
            <CinematicIntro key="intro" words={session.words} onComplete={() => { setShowIntro(false); setAppState(AppState.PARAGRAPH_PREVIEW); }} />
        )}
        
        {appState === AppState.IDLE && !showIntro && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 text-center">
            <h1 className="text-8xl md:text-[10rem] font-black text-white tracking-tighter uppercase mb-2 drop-shadow-3xl">LEXICON</h1>
            <h2 className="text-4xl md:text-6xl font-black text-neon-gold tracking-tighter uppercase mb-12">PRIME</h2>
            
            <div className="flex gap-2 mb-16 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-2xl">
                {['TOPIC', 'TEXT', 'FORGE'].map((m) => (
                    <button key={m} onClick={() => setMode(m as any)} className={`px-8 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all ${mode === m ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>
                      {m}
                    </button>
                ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if(inputValue.trim() || mode === 'FORGE') mode === 'TEXT' ? setAppState(AppState.TEXT_SELECTION) : initiateFlow(inputValue); }} className="w-full max-w-2xl flex flex-col items-center gap-8">
                <div className="w-full relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-[2rem] opacity-20 group-focus-within:opacity-40 blur-xl transition" />
                    {mode === 'TOPIC' ? (
                        <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Neural Subject Input..." className="relative w-full bg-black/80 border border-white/10 rounded-full px-10 py-6 text-2xl font-black text-center text-white focus:outline-none focus:border-white/40 transition-all backdrop-blur-3xl uppercase tracking-widest" />
                    ) : mode === 'TEXT' ? (
                        <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Contextual Data Buffer..." rows={4} className="relative w-full bg-black/80 border border-white/10 rounded-[2rem] px-10 py-8 text-lg font-serif text-center text-white focus:outline-none focus:border-white/40 transition-all backdrop-blur-3xl" />
                    ) : (
                        <div className="relative w-full py-12 bg-black/80 border border-white/10 rounded-[2.5rem] backdrop-blur-3xl flex flex-col items-center gap-3">
                           <Database size={40} className="text-neon-gold opacity-50" />
                           <h2 className="text-sm font-black tracking-[0.5em] text-white/40 uppercase">Manual_Data_Override</h2>
                        </div>
                    )}
                </div>
                <button type="submit" className="h-20 px-16 bg-white text-black rounded-full font-black tracking-widest flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-4xl group">
                    {mode === 'FORGE' ? 'OPEN FORGE' : 'INITIALIZE'} <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </button>
            </form>
          </motion.div>
        )}

        {appState === AppState.TEXT_SELECTION && <TextSelector initialText={inputValue} onBack={() => setAppState(AppState.IDLE)} onAnalyze={initiateFlow} />}
        {appState === AppState.GENERATING && <NeuralForgeLoader />}
        {appState === AppState.FORGE_WIZARD && <ForgeWizard onComplete={(l) => { setForgeLayers(l); setAppState(AppState.CUSTOM_VIEW); }} onJsonLoad={handleJsonLoad} onBack={() => setAppState(AppState.IDLE)} />}
        {appState === AppState.CUSTOM_VIEW && <CustomForgeView layers={forgeLayers} onClose={() => setAppState(AppState.IDLE)} />}
        {appState === AppState.PARAGRAPH_PREVIEW && session && <ParagraphView text={session.fullText} targetWords={session.words} mode="PREVIEW" onContinue={() => setAppState(AppState.LEARNING_SEQUENCE)} />}
        
        {appState === AppState.LEARNING_SEQUENCE && session && (
             <div className="absolute inset-0 z-30">
                 <ProgressHUD progress={(currentWordIndex * 7 + currentPage + 1) / (session.words.length * 7)} moodColor={session.words[currentWordIndex].moodColor} />
                 <AnimatePresence custom={wordDirection} mode="wait">
                    <motion.div key={currentWordIndex} initial={{ opacity: 0, x: wordDirection * 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -wordDirection * 100 }} className="absolute inset-0">
                        <NexusView data={session.words[currentWordIndex]} imageUrl={images[currentWordIndex] || null} onNextWord={handleNextWord} onPrevWord={handlePrevWord} page={currentPage} setPage={setCurrentPage} />
                    </motion.div>
                 </AnimatePresence>
             </div>
        )}

        {appState === AppState.PARAGRAPH_REVIEW && session && <ParagraphView text={session.fullText} targetWords={session.words} mode="REVIEW" onContinue={() => setAppState(AppState.FINAL_ASSESSMENT)} />}
        {appState === AppState.FINAL_ASSESSMENT && session && <FinalAssessment session={session} onComplete={() => setAppState(AppState.SESSION_COMPLETE)} />}
        {appState === AppState.SESSION_COMPLETE && <SessionComplete onReplay={() => { setCurrentWordIndex(0); setCurrentPage(0); setAppState(AppState.LEARNING_SEQUENCE); }} onNewSession={() => { setAppState(AppState.IDLE); setInputValue(''); }} />}
      </AnimatePresence>
    </div>
  );
};

export default App;
