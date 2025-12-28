
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit3, Sparkles } from 'lucide-react';
import { playSound } from '../utils/sound';

interface TextSelectorProps {
  initialText: string;
  onAnalyze: (text: string, selectedWords: string[]) => void;
  onBack: () => void;
}

const TextSelector: React.FC<TextSelectorProps> = ({ initialText, onAnalyze, onBack }) => {
  const [text, setText] = useState(initialText);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Split text into interactive tokens
  const tokens = text.split(/(\s+)/);

  const toggleWord = (word: string) => {
    const cleanWord = word.replace(/[^a-zA-Z0-9-]/g, "");
    if (!cleanWord) return;

    playSound('click');
    if (selectedWords.includes(cleanWord)) {
      setSelectedWords(prev => prev.filter(w => w !== cleanWord));
    } else {
      setSelectedWords(prev => [...prev, cleanWord]);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-4 md:p-6 bg-black/95 backdrop-blur-xl">
      <div className="max-w-4xl w-full flex flex-col h-full max-h-[90vh]">
        
        <div className="text-center mb-6 md:mb-8 shrink-0">
          <h2 className="text-neon-purple font-mono text-xs uppercase tracking-[0.4em] font-bold mb-2">MANUAL OVERRIDE</h2>
          <h1 className="text-3xl md:text-5xl font-black text-white">
            {isLocked ? "Select Target Words" : "Refine Your Text"}
          </h1>
        </div>

        <div className="flex-1 bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 overflow-y-auto custom-scrollbar relative">
          {!isLocked ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-full bg-transparent text-lg md:text-2xl font-serif text-gray-200 outline-none resize-none placeholder-gray-600 text-center leading-relaxed"
              placeholder="Paste your paragraph here..."
              autoFocus
            />
          ) : (
            <div className="text-lg md:text-2xl font-serif text-gray-300 leading-relaxed text-center">
              {tokens.map((token, i) => {
                 const clean = token.replace(/[^a-zA-Z0-9-]/g, "");
                 const isSelected = selectedWords.includes(clean);
                 const isSpace = !clean;

                 if (isSpace) return <span key={i}>{token}</span>;

                 return (
                   <motion.span
                     key={i}
                     onClick={() => toggleWord(clean)}
                     className={`inline-block cursor-pointer px-1 rounded-md transition-all duration-200 border border-transparent
                       ${isSelected 
                         ? 'bg-neon-gold text-black font-bold shadow-[0_0_15px_#FFD700] scale-110 mx-1' 
                         : 'hover:bg-white/10 hover:border-white/20 active:bg-white/20'
                       }
                     `}
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                   >
                     {token}
                   </motion.span>
                 );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-center gap-4 md:gap-6 shrink-0">
          {!isLocked ? (
            <>
              <button onClick={onBack} className="px-8 py-4 rounded-full border border-white/20 text-gray-400 font-bold tracking-widest hover:bg-white/10 active:scale-95" onMouseEnter={() => playSound('hover')}>
                BACK
              </button>
              <button 
                onClick={() => { if(text.trim()) setIsLocked(true); playSound('click'); }}
                className="px-10 py-4 bg-white text-black rounded-full font-black tracking-widest hover:bg-neon-blue hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                onMouseEnter={() => playSound('hover')}
              >
                LOCK TEXT <Check size={20} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setIsLocked(false); setSelectedWords([]); playSound('click'); }} className="px-8 py-4 rounded-full border border-white/20 text-gray-400 font-bold tracking-widest hover:bg-white/10 active:scale-95 flex items-center justify-center gap-2" onMouseEnter={() => playSound('hover')}>
                <Edit3 size={18} /> EDIT
              </button>
              <button 
                onClick={() => { 
                  if(selectedWords.length > 0) onAnalyze(text, selectedWords); 
                  else alert("Select at least one word!");
                }}
                className={`px-12 py-4 rounded-full font-black tracking-widest transition-all shadow-lg flex items-center justify-center gap-2
                  ${selectedWords.length > 0 ? 'bg-neon-purple text-white hover:bg-purple-500 hover:scale-105 active:scale-95 shadow-[0_0_30px_#BD00FF]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                `}
                disabled={selectedWords.length === 0}
                onMouseEnter={() => playSound('hover')}
              >
                ANALYZE <Sparkles size={20} />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default TextSelector;
