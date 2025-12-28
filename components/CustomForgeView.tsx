
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Cpu, Maximize2 } from 'lucide-react';
import { playSound } from '../utils/sound';

interface CustomForgeViewProps {
  layers: { html: string; css: string; js: string };
  onClose: () => void;
}

const CustomForgeView: React.FC<CustomForgeViewProps> = ({ layers, onClose }) => {
  const sandboxDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700;900&family=Rajdhani:wght@400;600;700&family=Space+Grotesk:wght@300;500;700&display=swap" rel="stylesheet">
          <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Outfit', 'sans-serif'],
                    display: ['Rajdhani', 'sans-serif'],
                    mono: ['Space Grotesk', 'monospace'],
                  },
                  colors: {
                    'neon-gold': '#FFD700',
                    'neon-blue': '#00F0FF',
                    'neon-purple': '#BD00FF',
                  }
                }
              }
            }
          </script>
          <style>
            /* GLOBAL RESET FOR ALIGNMENT */
            html, body, #forge-root { 
              height: 100%; 
              width: 100%; 
              margin: 0; 
              padding: 0;
              overflow: hidden;
              background: transparent;
              color: white;
              display: flex;
              flex-direction: column;
              font-family: 'Outfit', sans-serif;
            }
            * { box-sizing: border-box; scrollbar-width: none; }
            ::-webkit-scrollbar { width: 0px; }
            
            /* Cinematic Utilities */
            .cinematic-glow { box-shadow: 0 0 30px rgba(0, 240, 255, 0.2); }
            .neon-border { border: 1px solid rgba(255, 255, 255, 0.1); }
            
            ${layers.css}
          </style>
        </head>
        <body>
          <div id="forge-root">
            ${layers.html}
          </div>
          <script type="text/babel">
            try {
              ${layers.js}
            } catch (err) {
              const errorDiv = document.createElement('div');
              errorDiv.style.cssText = "color: #FF0055; font-family: monospace; padding: 40px; background: rgba(0,0,0,0.8); z-index: 9999; position: fixed; inset: 0;";
              errorDiv.innerHTML = "<h1>Neural Error Detected</h1><p>" + err.message + "</p>";
              document.body.appendChild(errorDiv);
            }
          </script>
        </body>
      </html>
    `;
  }, [layers]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-[#020205] flex flex-col"
    >
      <div className="h-14 px-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
             <div className="w-2 h-2 rounded-full bg-red-500/50" />
             <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
             <div className="w-2 h-2 rounded-full bg-green-500/50" />
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <Cpu className="text-neon-gold" size={14} />
            <span className="font-mono text-[9px] tracking-[0.4em] text-white/40 uppercase">RENDER_ENGINE_V3</span>
          </div>
        </div>
        <button 
          onClick={() => { playSound('click'); onClose(); }}
          className="p-2 hover:bg-white/5 rounded-lg transition-all group border border-transparent hover:border-white/10"
        >
          <X className="text-white/30 group-hover:text-white" size={20} />
        </button>
      </div>

      <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <iframe
          srcDoc={sandboxDoc}
          title="Forge Sandbox"
          className="w-full h-full border-none bg-transparent"
          sandbox="allow-scripts allow-popups allow-forms"
        />
      </div>
    </motion.div>
  );
};

export default CustomForgeView;
