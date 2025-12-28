
/* 
  LEXICON PRIME AUDIO ENGINE 
  Procedural Audio Synthesis for Cinematic UX
  100% Copyright Free (Generated via Web Audio API)
*/

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let reverbNode: ConvolverNode | null = null;

const initAudio = () => {
  if (audioCtx) return audioCtx;

  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  audioCtx = new AudioContext();

  // Master Limiter to prevent clipping
  const compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-10, audioCtx.currentTime);
  compressor.knee.setValueAtTime(30, audioCtx.currentTime);
  compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
  compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
  compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
  compressor.connect(audioCtx.destination);

  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.5; 
  masterGain.connect(compressor);

  // Short, Clean Reverb (Plate style)
  reverbNode = audioCtx.createConvolver();
  reverbNode.buffer = impulseResponse(audioCtx, 1.5, 3.0); 
  reverbNode.connect(masterGain);

  return audioCtx;
};

const impulseResponse = (ctx: AudioContext, duration: number, decay: number) => {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const n = i;
    // Tighter decay for UI sounds
    const envelope = Math.pow(1 - n / length, decay);
    left[i] = (Math.random() * 2 - 1) * envelope;
    right[i] = (Math.random() * 2 - 1) * envelope;
  }
  return impulse;
};

// --- SOUNDSCAPE GENERATOR ---
let ambianceNodes: { oscs: OscillatorNode[], gain: GainNode } | null = null;

export const startAmbiance = () => {
  const ctx = initAudio();
  if (ambianceNodes) return;

  const now = ctx.currentTime;
  const masterAmbianceGain = ctx.createGain();
  masterAmbianceGain.gain.setValueAtTime(0, now);
  masterAmbianceGain.gain.linearRampToValueAtTime(0.08, now + 4); 
  masterAmbianceGain.connect(masterGain!);

  const oscs: OscillatorNode[] = [];
  
  // 1. Deep Pad
  const pad1 = ctx.createOscillator();
  pad1.type = 'sine';
  pad1.frequency.value = 110; // A2
  pad1.connect(masterAmbianceGain);
  oscs.push(pad1);

  // 2. High Shimmer
  const pad2 = ctx.createOscillator();
  pad2.type = 'triangle';
  pad2.frequency.value = 220.5; // Slightly detuned A3
  const pad2Gain = ctx.createGain();
  pad2Gain.gain.value = 0.05;
  pad2.connect(pad2Gain);
  pad2Gain.connect(masterAmbianceGain);
  oscs.push(pad2);

  oscs.forEach(o => o.start(now));
  ambianceNodes = { oscs, gain: masterAmbianceGain };
};

export const updateSnakeSound = (speed: number, isHovering: boolean) => {
    // Optional: Keep silent or minimalist for this version to reduce fatigue
};

export const playSound = (type: 'hover' | 'click' | 'transition' | 'success') => {
  const ctx = initAudio();
  if (ctx.state === 'suspended') ctx.resume();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  // Routing
  osc.connect(gain);
  gain.connect(masterGain!); // Direct signal

  switch (type) {
    case 'hover':
        // High, short blip (Glassy)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.05);
        
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.1);
        break;

    case 'click':
        // Snappy click (Wood block / Switch)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.start(now);
        osc.stop(now + 0.1);
        break;

    case 'transition':
        // Whoosh (Low pass sweep)
        const noise = ctx.createBufferSource();
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(4000, now + 0.3);
        
        noise.connect(filter);
        filter.connect(gain);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        
        noise.start(now);
        break;

    case 'success':
        // Pleasant Chord (Major Triad)
        const freqs = [523.25, 659.25, 783.99]; // C Major
        const chordGain = ctx.createGain();
        chordGain.gain.value = 0.1;
        chordGain.connect(masterGain!);
        
        // Add reverb to success
        const wet = ctx.createGain();
        wet.gain.value = 0.4;
        chordGain.connect(wet);
        wet.connect(reverbNode!);

        freqs.forEach((f, i) => {
            const o = ctx.createOscillator();
            o.type = 'sine';
            o.frequency.value = f;
            
            const env = ctx.createGain();
            env.gain.setValueAtTime(0, now);
            env.gain.linearRampToValueAtTime(0.2, now + 0.05 + (i*0.02));
            env.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            
            o.connect(env);
            env.connect(chordGain);
            o.start(now);
            o.stop(now + 1);
        });
        break;
  }
};
