
import React, { useState } from 'react';
// Added AnimatePresence to imports
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Palette, Zap, ArrowRight, ArrowLeft, Terminal, Database, FileJson, Copy, CheckCircle } from 'lucide-react';
import { playSound } from '../utils/sound';

interface ForgeWizardProps {
  onComplete: (code: { html: string; css: string; js: string }) => void;
  onJsonLoad: (json: string) => void;
  onBack: () => void;
}

const ForgeWizard: React.FC<ForgeWizardProps> = ({ onComplete, onJsonLoad, onBack }) => {
  const [mode, setMode] = useState<'LAYER' | 'JSON' | 'PROTOCOL'>('JSON');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(0);
  const [layers, setLayers] = useState({
    html: '<!-- Use this for custom layouts -->\n<div id="app"></div>',
    css: '/* Custom Styles */',
    js: '// React Component\nconst App = () => (\n  <div className="flex items-center justify-center h-full">...</div>\n);\nconst root = ReactDOM.createRoot(document.getElementById("forge-root"));\nroot.render(<App />);'
  });
  const [jsonInput, setJsonInput] = useState('');

  const MASTER_PROMPT = `I am using the Lexicon Prime Learning Engine. Please generate a VALID JSON object for a vocabulary session.
  
RULES:
1. Topic: [INSERT TOPIC]
2. Words: Generate 3-5 high-level words.
3. Aesthetic: Neon HEX colors, "SERIF" or "MONO" fontVibes.
4. Content: Sarcastic definitions, deep etymology, 2-option quizzes.
5. Format: Match the following schema exactly (No markdown, just raw JSON):
{
  "topic": "string",
  "fullText": "A paragraph using all words",
  "words": [{
    "word": "string",
    "definition": "string",
    "sarcasticDefinition": "string",
    "phonetic": "string",
    "origin": "string",
    "contextSentence": "string",
    "moodColor": "#HEX",
    "nativeContexts": [{"label": "label", "description": "desc", "sentence": "sentence", "connotation": "pos/neg", "significance": "why"}],
    "synonyms": [{"word": "word", "definition": "def"}],
    "antonyms": [{"word": "word", "definition": "def"}],
    "visualPrompt": "Detailed AI image prompt",
    "quiz": [{"question": "q", "options": ["a", "b"], "answer": "a", "explanation": "why"}]
  }]
}`;

  const handleCopyProtocol = () => {
    navigator.clipboard.writeText(MASTER_PROMPT);
    setCopied(true);
    playSound('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJsonSubmit = () => {
    try {
      JSON.parse(jsonInput);
      playSound('success');
      onJsonLoad(jsonInput);
    } catch (e) {
      alert("Invalid JSON. Paste exactly what the AI gave you.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-[#010103] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col h-full max-h-[90vh]">
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-10 shrink-0">
          <button onClick={onBack} className="text-white/20 hover:text-white flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest transition-all">
            <ArrowLeft size={12} /> Abort Forge
          </button>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
            {['JSON', 'PROTOCOL', 'LAYER'].map((m) => (
              <button 
                key={m} 
                onClick={() => setMode(m as any)}
                className={`px-6 py-2.5 rounded-xl text-[9px] font-mono tracking-widest uppercase transition-all ${mode === m ? 'bg-white text-black shadow-2xl' : 'text-white/30 hover:text-white'}`}
              >
                {m === 'LAYER' ? 'Custom Fragment' : m === 'JSON' ? 'Data Injector' : 'Get Protocol'}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'PROTOCOL' && (
            <motion.div key="proto" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center">
               <div className="max-w-xl">
                 <div className="w-20 h-20 bg-neon-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-neon-gold/20">
                    <Database className="text-neon-gold" size={32} />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-widest mb-4">The Lexicon Protocol</h2>
                 <p className="text-white/40 text-sm italic mb-8">Copy this instructions blueprint and paste it into any free LLM (Claude/ChatGPT). It will generate perfectly formatted data that plugs directly into the app's cinematic engine.</p>
                 <button 
                  onClick={handleCopyProtocol}
                  className="h-20 w-full bg-white text-black rounded-full font-black tracking-widest flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-4xl"
                 >
                   {copied ? <CheckCircle size={24} /> : <Copy size={24} />}
                   {copied ? 'PROTOCOL SECURED' : 'COPY MASTER PROMPT'}
                 </button>
               </div>
            </motion.div>
          )}

          {mode === 'JSON' && (
            <motion.div key="json" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex-1 flex flex-col gap-6">
               <div className="bg-black/40 border border-white/5 rounded-[2.5rem] flex-1 overflow-hidden p-2 shadow-inner relative group">
                  <div className="absolute top-6 left-8 flex items-center gap-2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                    <FileJson size={14} className="text-neon-purple" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-white">Awaiting_Neural_Sequence...</span>
                  </div>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste the JSON output here..."
                    className="w-full h-full bg-transparent p-12 pt-16 font-mono text-sm text-neon-purple outline-none resize-none custom-scrollbar"
                    spellCheck={false}
                  />
               </div>
               <button 
                onClick={handleJsonSubmit}
                className="h-20 bg-neon-purple text-white rounded-full font-black tracking-widest flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(189,0,255,0.4)]"
               >
                 INITIALIZE NATIVE RENDER <Zap size={20} />
               </button>
            </motion.div>
          )}

          {mode === 'LAYER' && (
             <motion.div key="layer" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex-1 flex flex-col gap-6">
                <div className="flex justify-center gap-4 mb-4">
                  {['HTML', 'CSS', 'REACT'].map((l, i) => (
                    <button key={l} onClick={() => setStep(i)} className={`px-6 py-2 rounded-full font-mono text-[10px] border transition-all ${step === i ? 'bg-white text-black border-white' : 'border-white/10 text-white/40'}`}>{l}</button>
                  ))}
                </div>
                <div className="bg-black/40 border border-white/5 rounded-[2.5rem] flex-1 overflow-hidden p-2 shadow-inner">
                  <textarea
                    value={layers[step === 0 ? 'html' : step === 1 ? 'css' : 'js']}
                    onChange={(e) => setLayers({ ...layers, [step === 0 ? 'html' : step === 1 ? 'css' : 'js']: e.target.value })}
                    className="w-full h-full bg-transparent p-12 font-mono text-sm text-neon-blue outline-none resize-none custom-scrollbar"
                    spellCheck={false}
                  />
                </div>
                <button 
                  onClick={() => onComplete(layers)}
                  className="h-20 bg-white text-black rounded-full font-black tracking-widest flex items-center justify-center gap-4 hover:scale-105 transition-all"
                >
                  RENDER CUSTOM FRAGMENT <Layout size={20} />
                </button>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ForgeWizard;
