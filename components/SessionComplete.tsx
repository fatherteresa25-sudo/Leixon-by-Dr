
import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Zap } from 'lucide-react';
import { playSound } from '../utils/sound';

interface SessionCompleteProps {
    onReplay: () => void;
    onNewSession: () => void;
}

const SessionComplete: React.FC<SessionCompleteProps> = ({ onReplay, onNewSession }) => {
    return (
        <motion.div 
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white text-black mb-6 shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                    <Zap size={48} fill="black" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">Journey Complete</h1>
                <p className="text-gray-400 font-mono text-sm tracking-[0.5em] uppercase">Where to next?</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full px-4">
                
                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { playSound('click'); onReplay(); }}
                    className="flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-white/30 transition-all group"
                    onMouseEnter={() => playSound('hover')}
                >
                    <RotateCcw size={40} className="text-gray-400 group-hover:text-white transition-colors" />
                    <span className="font-bold text-gray-300 group-hover:text-white tracking-widest uppercase">Restart Journey</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(0,240,255,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { playSound('success'); onNewSession(); }}
                    className="flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-neon-blue transition-all group shadow-[0_0_0_transparent] hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]"
                    onMouseEnter={() => playSound('hover')}
                >
                    <Zap size={40} className="text-gray-400 group-hover:text-neon-blue transition-colors" />
                    <span className="font-bold text-gray-300 group-hover:text-white tracking-widest uppercase">New Target</span>
                </motion.button>

            </div>
        </motion.div>
    );
};

export default SessionComplete;
