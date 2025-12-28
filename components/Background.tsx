
import React, { useEffect, useRef } from 'react';

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: Star[] = [];
    const clouds: NebulaCloud[] = [];
    const dust: CosmicDust[] = [];
    
    const starCount = width < 768 ? 500 : 1500;
    const cloudCount = 18; 
    const dustCount = width < 768 ? 1500 : 4500; 

    class Star {
      x: number; y: number; z: number; pz: number;
      size: number; brightness: number;

      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = (Math.random() - 0.5) * width * 10;
        this.y = (Math.random() - 0.5) * height * 10;
        this.z = initial ? Math.random() * width : width;
        this.pz = this.z;
        this.size = Math.random() * 1.0 + 0.1;
        this.brightness = Math.random() * 0.8 + 0.2;
      }

      update(speed: number) {
        this.pz = this.z;
        this.z -= speed;
        if (this.z < 1) this.reset();
      }

      draw() {
        const sx = (this.x / this.z) * (width / 2) + width / 2;
        const sy = (this.y / this.z) * (height / 2) + height / 2;
        const px = (this.x / this.pz) * (width / 2) + width / 2;
        const py = (this.y / this.pz) * (height / 2) + height / 2;

        const alpha = Math.min(1, 1 - this.z / width) * this.brightness;
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.lineWidth = (1 - this.z / width) * 1.2;
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
    }

    class CosmicDust {
        x: number; y: number; vx: number; vy: number;
        size: number; alpha: number; phase: number;
        isSpore: boolean;

        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.isSpore = Math.random() > 0.92; 
            this.vx = (Math.random() - 0.5) * (this.isSpore ? 2.5 : 0.5);
            this.vy = (Math.random() - 0.5) * (this.isSpore ? 2.5 : 0.5);
            this.size = this.isSpore ? Math.random() * 1.2 + 0.2 : Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.4 + 0.05;
            this.phase = Math.random() * Math.PI * 2;
        }

        draw(moodColor: string) {
            this.x += this.vx;
            this.y += this.vy;
            this.phase += 0.04;
            if (this.x < 0) this.x = width; if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height; if (this.y > height) this.y = 0;

            const glow = this.alpha + Math.sin(this.phase) * 0.15;
            const finalColor = this.isSpore ? '#FFFFFF' : moodColor;
            
            ctx.fillStyle = finalColor + Math.floor(glow * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class NebulaCloud {
      x: number; y: number; size: number;
      vx: number; vy: number; opacity: number; phase: number;

      constructor() {
        this.size = Math.random() * width * 2.2 + width * 0.5;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.02;
        this.vy = (Math.random() - 0.5) * 0.02;
        this.opacity = Math.random() * 0.05 + 0.01; 
        this.phase = Math.random() * Math.PI * 2;
      }

      draw(moodColor: string) {
        this.x += this.vx; this.y += this.vy; this.phase += 0.001;
        if (this.x < -this.size) this.x = width + this.size;
        if (this.x > width + this.size) this.x = -this.size;
        
        const bloom = this.opacity + Math.sin(this.phase) * 0.01;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        grad.addColorStop(0, moodColor + Math.floor(bloom * 255).toString(16).padStart(2, '0'));
        grad.addColorStop(0.5, moodColor + '05');
        grad.addColorStop(1, 'transparent');

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < starCount; i++) stars.push(new Star());
    for (let i = 0; i < cloudCount; i++) clouds.push(new NebulaCloud());
    for (let i = 0; i < dustCount; i++) dust.push(new CosmicDust());

    const animate = () => {
      const moodColor = getComputedStyle(document.documentElement).getPropertyValue('--mood-color').trim() || '#00F0FF';
      ctx.fillStyle = '#010102';
      ctx.fillRect(0, 0, width, height);

      clouds.forEach(cloud => cloud.draw(moodColor));
      dust.forEach(d => d.draw(moodColor));
      stars.forEach(star => {
        star.update(0.6);
        star.draw();
      });

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);
    const handleResize = () => {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width; canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default Background;
