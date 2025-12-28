
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordData } from '../types';
import { playSound } from '../utils/sound';
import { Zap, Award } from 'lucide-react';

interface ParagraphViewProps {
  text: string;
  targetWords: WordData[];
  mode: 'PREVIEW' | 'REVIEW';
  onContinue: () => void;
}

const ParagraphView: React.FC<ParagraphViewProps> = ({ text, targetWords, mode, onContinue }) => {
  const wordList = targetWords.map(w => w.word).join('|');
  const regex = new RegExp(`(${wordList})`, 'gi');
  const parts = text.split(regex);
  const [hoveredWord, setHoveredWord] = useState<WordData | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const lastTapRef = useRef<number>(0);

  const handleFinishClick = () => {
    playSound('success');
    if (mode === 'REVIEW') {
        setShowThankYou(true);
    } else {
        onContinue();
    }
  };

  const handleThankYouDoubleTap = () => {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
          playSound('click');
          onContinue();
      }
      lastTapRef.current = now;
  };

  const isReview = mode === 'REVIEW';
  const accentColor = isReview ? '#FFD700' : '#00F0FF';

  return (
    <motion.div 
      className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden bg-[#020202] p-6 md:p-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <style>{`
        .neural-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .neural-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .neural-scroll::-webkit-scrollbar-thumb {
          background: ${accentColor}88;
          border-radius: 10px;
          box-shadow: 0 0 10px ${accentColor}44;
        }
        .neural-scroll {
          scrollbar-width: thin;
          scrollbar-color: ${accentColor}88 transparent;
          scroll-behavior: smooth;
        }
      `}</style>

      <AnimatePresence mode="wait">
        {showThankYou ? (
            <motion.div 
                key="thank-you"
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black cursor-pointer overflow-hidden px-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleThankYouDoubleTap}
            >
                <div className="text-center relative z-20 w-full max-w-4xl">
                    <motion.div 
                        initial={{ scale: 0, rotate: -180 }} 
                        animate={{ scale: 1, rotate: 0 }} 
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-32 h-32 bg-neon-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_80px_#FFD700]"
                    >
                        <Award size={64} className="text-black" />
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-6xl md:text-9xl font-black text-white tracking-tighter mb-4 uppercase"
                    >
                        Mastery<br/>
                        <span className="text-neon-gold">Unlocked</span>
                    </motion.h1>
                    <p className="text-white/20 font-mono text-[10px] tracking-[0.5em] uppercase mt-8 animate-pulse">Double tap to continue</p>
                </div>
            </motion.div>
        ) : (
            <div className="w-full max-w-4xl flex flex-col items-center gap-12 relative">
              {/* Centered Header Section */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center z-10"
              >
                  <div className={`font-mono text-[10px] tracking-[0.5em] mb-3 font-bold ${isReview ? 'text-neon-gold' : 'text-neon-blue'}`}>
                      {isReview ? 'INTEGRATING NARRATIVE' : 'CONTEXTUAL ANALYSIS'}
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-none">
                      {isReview ? 'Final Synthesis' : 'Hub Overview'}
                  </h1>
              </motion.div>

              {/* Centered Scrollable Card */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full rounded-[3.5rem] relative overflow-hidden group shadow-4xl"
                style={{ 
                    backgroundColor: 'rgba(10, 10, 15, 0.4)', 
                    border: `1px solid ${accentColor}22`,
                    backdropFilter: 'blur(50px)'
                }}
              >
                  <div className="max-h-[55vh] md:max-h-[50vh] overflow-y-auto neural-scroll p-10 md:p-16">
                      <div className="text-2xl md:text-4xl leading-relaxed font-sans text-gray-200 font-normal tracking-tight relative z-10 break-words max-w-full text-center">
                         {parts.map((part, i) => {
                            const matchedWord = targetWords.find(w => w.word.toLowerCase() === part.toLowerCase());
                            if (matchedWord) {
                                return (
                                    <span 
                                        key={i}
                                        className={`relative inline-block font-bold transition-all px-2 rounded-lg cursor-help mx-1
                                            ${mode === 'PREVIEW' 
                                                ? 'text-neon-blue border-b-2 border-neon-blue/30' 
                                                : 'text-neon-gold border-b-2 border-neon-gold/30 hover:bg-neon-gold hover:text-black hover:scale-105'
                                            }
                                        `}
                                    >
                                        {part}
                                    </span>
                                );
                            }
                            return <span key={i} className="opacity-80">{part}</span>;
                         })}
                      </div>
                  </div>
                  
                  {/* Subtle edge fade to indicate more content */}
                  <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#020202]/40 to-transparent pointer-events-none z-20" />
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#020202]/40 to-transparent pointer-events-none z-20" />
              </motion.div>

              {/* Centered Action Button */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full flex justify-center mt-4"
              >
                 <motion.button
                    onClick={handleFinishClick}
                    className={`group relative w-full max-w-md h-20 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-6 shadow-2xl
                        ${isReview ? 'bg-neon-gold border-4 border-white/30' : 'bg-[#151515] border border-white/10'}
                    `}
                 >
                    <span className={`text-xl font-bold font-display tracking-[0.2em] uppercase ${isReview ? 'text-black' : 'text-white'}`}>
                        {isReview ? 'Confirm Mastery' : 'Begin Forge'}
                    </span>
                    <Zap size={20} className={isReview ? 'text-black' : 'text-neon-blue'} />
                 </motion.button>
              </motion.div>
            </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ParagraphView;
