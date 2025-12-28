import React from 'react';
import { motion } from 'framer-motion';
import { WordData } from '../types';
import { playSound } from '../utils/sound';

interface BookSceneProps {
  data: WordData;
  onWordClick: () => void;
  isFocusing: boolean;
}

const BookScene: React.FC<BookSceneProps> = ({ data, onWordClick, isFocusing }) => {
  const parts = data.contextSentence.split(new RegExp(`(${data.word})`, 'gi'));

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-20 p-8 perspective-1000"
      initial={{ opacity: 0 }}
      animate={{ opacity: isFocusing ? 0 : 1, scale: isFocusing ? 1.5 : 1, filter: isFocusing ? "blur(20px)" : "blur(0px)" }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      <div className="max-w-5xl w-full relative" style={{ transformStyle: "preserve-3d" }}>
        {/* Floating Book Container */}
        <motion.div 
          className="font-sans text-3xl md:text-6xl leading-relaxed text-gray-300 text-center tracking-wide font-medium"
          initial={{ y: 50, opacity: 0, rotateX: 20 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {parts.map((part, i) => {
            const isTarget = part.toLowerCase() === data.word.toLowerCase();
            return isTarget ? (
              <motion.span
                key={i}
                className="hover-target inline-block font-black text-neon-gold relative px-2 mx-1 z-10 cursor-none drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"
                onClick={onWordClick}
                whileHover={{ scale: 1.2, textShadow: "0 0 40px #FFD700", color: "#FFF" }}
                onMouseEnter={() => playSound('hover')}
                style={{ display: 'inline-block' }}
              >
                {part}
                <span className="absolute -inset-2 border-2 border-neon-gold/30 rounded-lg animate-pulse opacity-50"></span>
              </motion.span>
            ) : (
              <span key={i} className="hover-target hover:text-white transition-colors duration-300 inline-block px-1" onMouseEnter={() => playSound('hover')}>
                  {part}
              </span>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BookScene;
