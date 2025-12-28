
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LearningSession } from '../types';
import { Brain, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { playSound } from '../utils/sound';

interface FinalAssessmentProps {
    session: LearningSession;
    onComplete: () => void;
}

const FinalAssessment: React.FC<FinalAssessmentProps> = ({ session, onComplete }) => {
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    const currentWord = session.words[step];
    const quiz = currentWord.quiz[0]; 

    const handleAnswer = (option: string) => {
        if (selected) return;
        const correct = option === quiz.answer;
        setSelected(option);
        setIsCorrect(correct);
        if (correct) {
            setScore(prev => prev + 1);
            playSound('success');
        } else {
            playSound('click');
        }
        setTimeout(() => setShowExplanation(true), 600);
    };

    const nextStep = () => {
        if (step < session.words.length - 1) {
            setStep(prev => prev + 1);
            setSelected(null);
            setIsCorrect(null);
            setShowExplanation(false);
        } else {
            onComplete();
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
            {/* Progress Bar (Locked) */}
            <div className="absolute top-8 md:top-12 left-0 right-0 px-8 md:px-16 flex justify-between items-center z-10">
                <div className="flex gap-2 w-full max-w-md mx-auto">
                    {session.words.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-700 flex-1 ${step >= i ? 'bg-white shadow-[0_0_10px_white]' : 'bg-white/10'}`} />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={`${step}-${showExplanation}`} 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 1.05, opacity: 0 }} 
                    className="w-full h-full max-h-[85vh] text-center relative z-10 flex flex-col items-center justify-center overflow-hidden"
                >
                    {!showExplanation ? (
                        <div className="w-full flex flex-col items-center gap-8 md:gap-12 overflow-hidden">
                            <motion.div className="shrink-0 p-6 rounded-full bg-white/5 border border-white/10">
                               <Brain size={40} className="text-white animate-pulse" />
                            </motion.div>
                            <div className="overflow-y-auto custom-scrollbar max-h-[40vh] px-4">
                                <h2 className="text-[clamp(1.5rem,5vw,4.5rem)] font-black text-white tracking-tighter leading-tight uppercase">
                                {quiz.question}
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-4xl mx-auto shrink-0 px-2">
                                {quiz.options.map((opt, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleAnswer(opt)} 
                                        className={`p-8 md:p-12 text-center rounded-[2.5rem] md:rounded-[3.5rem] border-2 transition-all font-black text-xl md:text-3xl relative overflow-hidden uppercase tracking-tighter shadow-2xl
                                            ${selected === opt 
                                                ? (isCorrect ? 'bg-white border-white text-black' : 'bg-neon-pink border-neon-pink text-white') 
                                                : 'bg-white/[0.03] border-white/10 hover:bg-white hover:text-black hover:scale-105 active:scale-95'
                                            }
                                        `}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-8 w-full max-w-3xl overflow-hidden h-full justify-center">
                            <div className={`shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-4xl ${isCorrect ? 'bg-white' : 'bg-neon-pink'}`}>
                                {isCorrect ? <CheckCircle2 size={48} className="text-black" /> : <XCircle size={48} className="text-white" />}
                            </div>
                            <div 
                                className="p-8 md:p-14 rounded-[3rem] w-full text-center relative overflow-hidden flex flex-col max-h-[50vh]"
                                style={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    border: `1px solid ${isCorrect ? 'rgba(255,255,255,0.2)' : 'rgba(255,0,85,0.2)'}`,
                                    backdropFilter: 'blur(50px)'
                                }}
                            >
                                <p className="shrink-0 text-xl md:text-4xl text-white font-black leading-tight mb-6 uppercase tracking-tighter">
                                    {isCorrect ? 'Logic Sync Perfect' : `Correction: ${quiz.answer}`}
                                </p>
                                <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
                                    <p className="text-lg md:text-2xl text-gray-400 italic font-light leading-relaxed font-serif">
                                        {quiz.explanation}
                                    </p>
                                </div>
                            </div>
                            <button onClick={nextStep} className="shrink-0 px-12 py-5 bg-white text-black rounded-full font-black tracking-[0.3em] uppercase flex items-center gap-4 hover:scale-110 active:scale-95 transition-all shadow-5xl">
                                CONTINUE <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default FinalAssessment;
