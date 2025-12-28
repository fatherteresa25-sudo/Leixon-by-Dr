
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform, useMotionTemplate } from 'framer-motion';
import { WordData } from '../types';
import { Compass, Activity, Target, ShieldCheck } from 'lucide-react';
import { playSound } from '../utils/sound';

interface NexusViewProps {
  data: WordData;
  imageUrl: string | null;
  onNextWord: () => void;
  onPrevWord: () => void;
  page: number;
  setPage: (page: number, direction: number) => void;
}

const NexusView: React.FC<NexusViewProps> = ({ data, imageUrl, onNextWord, onPrevWord, page, setPage }) => {
  const lockInput = useRef(false);

  // Perspective Tilt (Locked Logic)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseXSpring = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const mouseYSpring = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-7, 7]);
  const cardTransform = useMotionTemplate`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const paginate = (dir: number) => {
    if (lockInput.current) return;
    const next = page + dir;
    if (next >= 0 && next < 7) {
      playSound('transition');
      setPage(next, dir);
      lockInput.current = true;
      setTimeout(() => lockInput.current = false, 400);
    } else if (dir > 0) onNextWord();
    else onPrevWord();
  };

  const getFontClass = () => {
    if (data.fontVibe === 'SERIF') return 'font-serif italic tracking-tight';
    if (data.fontVibe === 'MONO') return 'font-mono tracking-widest uppercase';
    return 'font-sans tracking-tighter uppercase font-black';
  };

  const MoodGlow = (baseOpacity = 0.4) => {
    const intensity = data.glowIntensity ?? 1;
    const spread = data.glowSpread ?? 120;
    return (
      <motion.div 
        className="absolute inset-0 z-[-1] pointer-events-none blur-[100px]"
        style={{ 
            background: `radial-gradient(circle at center, ${data.moodColor}88 0%, transparent 70%)`,
            filter: `blur(${spread}px)`,
            opacity: baseOpacity * intensity
        }}
        animate={{ opacity: [(baseOpacity * intensity) * 0.4, baseOpacity * intensity, (baseOpacity * intensity) * 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    );
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 md:p-8 overflow-hidden select-none"
         onClick={(e) => {
           const x = e.clientX;
           if (x < window.innerWidth * 0.15) onPrevWord();
           else if (x > window.innerWidth * 0.85) onNextWord();
           else if (x < window.innerWidth / 2) paginate(-1);
           else paginate(1);
         }}>
      
      <div className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center pointer-events-none px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 1.05 }}
            className="w-full h-full max-h-[88vh] flex flex-col items-center justify-center text-center gap-4 pointer-events-auto overflow-hidden relative"
          >
            {/* PAGE 0: HERO WORD (Strict Centering & Scaling) */}
            {page === 0 && (
              <div className="w-full flex-1 flex flex-col items-center justify-center space-y-4 overflow-hidden py-4">
                <motion.div style={{ transform: cardTransform }} className="relative w-full shrink-0 flex flex-col items-center justify-center py-6">
                  {MoodGlow(0.6)}
                  <h1 className={`${getFontClass()} text-[clamp(2.2rem,14vw,8.5rem)] leading-[0.85] text-white drop-shadow-4xl break-all uppercase px-4 w-full`}>
                    {data.word}
                  </h1>
                  <p className="mt-4 font-mono text-[clamp(7px,2vw,11px)] tracking-[0.7em] text-white/40 uppercase font-black">
                    {data.phonetic}
                  </p>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl mx-auto shrink overflow-hidden">
                    {[
                        { label: 'Definition', text: data.definition, icon: Activity },
                        { label: 'Origin', text: data.origin, icon: Compass }
                    ].map((item, i) => (
                        <div key={i} className="p-5 md:p-7 rounded-[2rem] bg-white/[0.04] border border-white/5 backdrop-blur-3xl relative overflow-hidden group">
                            <div className="flex items-center gap-2 justify-center mb-3 opacity-30 text-[8px] font-mono tracking-widest uppercase font-bold group-hover:opacity-100 transition-opacity">
                                <item.icon size={10} /> {item.label}
                            </div>
                            <p className="text-base md:text-xl font-light text-white/90 leading-snug break-words line-clamp-3">{item.text}</p>
                        </div>
                    ))}
                </div>
              </div>
            )}

            {/* PAGE 1: VISUAL SYNTHESIS */}
            {page === 1 && (
               <div className="w-full h-full flex flex-col items-center justify-center max-w-4xl space-y-6 overflow-hidden">
                  <div className="flex-1 w-full max-h-[55%] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-5xl relative bg-black/40">
                      {imageUrl && <img src={imageUrl} className="w-full h-full object-cover" alt="Visual" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent" />
                  </div>
                  <div className="overflow-y-auto custom-scrollbar px-6 max-h-[35%] flex items-center justify-center">
                    <p className="text-xl md:text-4xl font-serif italic text-white/95 leading-tight">
                      "{data.sarcasticDefinition}"
                    </p>
                  </div>
               </div>
            )}

            {/* CONTEXT PAGES (2-5) Locked Vertical Center */}
            {(page >= 2 && page <= 5) && (
                <motion.div 
                    style={{ border: `1px solid ${data.moodColor}33` }}
                    className="w-full h-full max-h-[80vh] p-8 md:p-14 rounded-[3.5rem] bg-white/[0.01] backdrop-blur-4xl relative overflow-hidden flex flex-col justify-center"
                >
                    {MoodGlow(0.2)}
                    <div className="shrink-0 mb-8">
                      <span className="inline-block px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[8px] font-mono tracking-[0.4em] text-white/50 uppercase font-black" style={{ color: data.moodColor }}>
                          {page < 4 ? data.nativeContexts[page-2]?.label : 'PRACTICAL_LOGIC'}
                      </span>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center overflow-hidden">
                      <h3 className="text-[clamp(1.4rem,7vw,4.5rem)] font-black text-white tracking-tighter leading-[1] mb-8 uppercase break-words px-2">
                          {page < 4 ? `"${data.nativeContexts[page-2]?.description}"` : `"${data.nativeContexts[page-4]?.sentence}"`}
                      </h3>
                      
                      <div className="pt-8 border-t border-white/5 overflow-y-auto custom-scrollbar pr-2 max-h-[35%] text-left">
                          <p className="text-base md:text-2xl font-serif italic text-gray-400 font-light leading-relaxed">
                              {page < 4 ? data.nativeContexts[page-2]?.significance : data.nativeContexts[page-4]?.significance}
                          </p>
                      </div>
                    </div>
                </motion.div>
            )}

            {/* PAGE 6: POLARITIES - HARD-LOCKED DIMENSIONS & VERTICAL CENTERING */}
            {page === 6 && (
                <div className="w-full h-full max-h-[85vh] flex flex-col items-center justify-center gap-6 p-2">
                    {/* Synonym Card */}
                    <div className="w-full max-w-4xl p-8 md:p-12 rounded-[3rem] border border-white/10 bg-white/[0.03] relative overflow-hidden group flex flex-col items-center justify-center min-h-[40%] flex-1">
                        {MoodGlow(0.3)}
                        <div className="text-[9px] font-mono tracking-widest text-white/30 mb-4 uppercase flex items-center gap-2"><Target size={12}/> SYNONYM</div>
                        <h2 className="text-[clamp(1.8rem,10vw,7rem)] font-black text-white tracking-tighter uppercase mb-3 leading-none break-all px-4 w-full">{data.synonyms[0]?.word}</h2>
                        <p className="text-gray-400 text-base md:text-2xl font-serif italic max-w-[80%]">"{data.synonyms[0]?.definition}"</p>
                    </div>

                    {/* Antonym Card */}
                    <div className="w-full max-w-4xl p-8 md:p-12 rounded-[3rem] border border-white/10 bg-black/40 relative overflow-hidden group flex flex-col items-center justify-center min-h-[40%] flex-1">
                        <div className="text-[9px] font-mono tracking-widest text-white/30 mb-4 uppercase flex items-center gap-2"><ShieldCheck size={12}/> ANTONYM</div>
                        <h2 className="text-[clamp(1.8rem,10vw,7rem)] font-black text-neon-pink tracking-tighter uppercase mb-3 leading-none break-all px-4 w-full">{data.antonyms[0]?.word}</h2>
                        <p className="text-gray-500 text-base md:text-2xl font-serif italic max-w-[80%]">"{data.antonyms[0]?.definition}"</p>
                    </div>
                </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NexusView;
