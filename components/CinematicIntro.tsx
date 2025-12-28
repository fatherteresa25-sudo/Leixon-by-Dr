
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../utils/sound';
import { Zap } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
  words?: any[]; 
}

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete, words = [] }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Fast paced montage logic
    if (index >= words.length) {
        setTimeout(onComplete, 800);
        return;
    }

    const timer = setTimeout(() => {
        playSound('click');
        setIndex(prev => prev + 1);
    }, 450); // Slightly adjusted timing for weight

    return () => clearTimeout(timer);
  }, [index, words.length, onComplete]);

  // Kinetic Text Variants
  const wordVariants = {
    initial: { scale: 2, opacity: 0, y: 50, rotateX: 45 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 15, mass: 0.8 } 
    },
    exit: { 
      scale: 0.5, 
      opacity: 0, 
      filter: "blur(10px)",
      transition: { duration: 0.2 } 
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden perspective-container cursor-none">
        
        {/* Dynamic Background Strobe */}
        <motion.div 
            key={index}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent z-0 pointer-events-none mix-blend-overlay"
        />

        <AnimatePresence mode="wait">
            {index < words.length ? (
                <motion.div
                    key={index}
                    className="relative z-10 flex flex-col items-center justify-center"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={wordVariants}
                >
                    <motion.div 
                      className="flex items-center gap-2 mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="h-[1px] w-12 bg-neon-blue/50"></div>
                      <h2 className="text-neon-blue font-mono text-xs tracking-[0.5em] uppercase">INCOMING // {index + 1}</h2>
                      <div className="h-[1px] w-12 bg-neon-blue/50"></div>
                    </motion.div>

                    <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 italic font-display uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transform perspective-1000">
                        {words[index]?.word}
                    </h1>
                </motion.div>
            ) : (
                <motion.div
                    key="final"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative z-10 flex flex-col items-center gap-6"
                >
                    <motion.div 
                      className="p-8 rounded-full bg-white text-black relative"
                      animate={{ boxShadow: ["0 0 0px white", "0 0 50px white", "0 0 0px white"] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                        <Zap size={64} fill="black" />
                    </motion.div>
                    <h1 className="text-5xl font-black text-white tracking-widest uppercase">READY</h1>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default CinematicIntro;
