import React, { useEffect, useRef } from 'react';
import { updateSnakeSound, playSound } from '../utils/sound';

const SnakeCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const mouse = useRef({ x: -100, y: -100 });
  const lastMouse = useRef({ x: -100, y: -100 });
  const isHovering = useRef(false);
  
  // Ribbon History
  const points = useRef<{x: number, y: number, life: number}[]>([]);
  const MAX_POINTS = 20;

  // Particles
  const particles = useRef<{x: number, y: number, vx: number, vy: number, life: number, color: string, size: number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let hue = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY, target;
      if (e instanceof MouseEvent) {
         clientX = e.clientX;
         clientY = e.clientY;
         target = e.target as HTMLElement;
      } else if (e.touches && e.touches[0]) {
         clientX = e.touches[0].clientX;
         clientY = e.touches[0].clientY;
         target = document.elementFromPoint(clientX, clientY) as HTMLElement;
      } else return;

      mouse.current = { x: clientX, y: clientY };
      const isInteractive = target?.closest('.hover-target') || target?.tagName === 'BUTTON' || target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      isHovering.current = !!isInteractive;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);
    handleResize();

    const animate = () => {
      // Move time declaration to top
      const time = Date.now() / 100;

      hue = (hue + 2) % 360;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sound
      const speed = Math.sqrt((mouse.current.x - lastMouse.current.x)**2 + (mouse.current.y - lastMouse.current.y)**2);
      updateSnakeSound(speed, isHovering.current);

      lastMouse.current = { ...mouse.current };

      // Update Ribbon Points
      // Add new point at head
      points.current.unshift({ x: mouse.current.x, y: mouse.current.y, life: 1.0 });
      // Remove old
      if (points.current.length > MAX_POINTS) points.current.pop();

      // Magic Sparkles Logic
      if (speed > 2 || isHovering.current) {
          const count = isHovering.current ? 3 : 1;
          for(let i=0; i<count; i++) {
              particles.current.push({
                  x: mouse.current.x + (Math.random()-0.5) * 10,
                  y: mouse.current.y + (Math.random()-0.5) * 10,
                  vx: (Math.random()-0.5),
                  vy: (Math.random()-0.5) + (isHovering.current ? -1 : 0), // Float up if magic
                  life: 1.0,
                  color: isHovering.current ? '#FFD700' : `hsl(${hue}, 100%, 70%)`,
                  size: Math.random() * 2
              });
          }
      }

      // Draw Ribbon (Liquid Line)
      if (points.current.length > 2) {
          ctx.beginPath();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          // Spline through points
          ctx.moveTo(points.current[0].x, points.current[0].y);
          
          for (let i = 1; i < points.current.length - 1; i++) {
              const p0 = points.current[i];
              const p1 = points.current[i + 1];
              const midX = (p0.x + p1.x) / 2;
              const midY = (p0.y + p1.y) / 2;
              ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          }
          
          ctx.shadowBlur = isHovering.current ? 20 : 10;
          ctx.shadowColor = isHovering.current ? '#FFD700' : '#00F0FF';
          
          // Dynamic gradient stroke
          const grad = ctx.createLinearGradient(
              points.current[0].x, points.current[0].y, 
              points.current[points.current.length-1].x, points.current[points.current.length-1].y
          );
          grad.addColorStop(0, isHovering.current ? '#FFF' : '#00F0FF');
          grad.addColorStop(1, 'transparent');
          
          ctx.strokeStyle = grad;
          ctx.lineWidth = isHovering.current ? 4 : Math.max(1, speed/5);
          ctx.stroke();
      }

      // Draw Particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
          const p = particles.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.04;
          
          if (p.life <= 0) {
              particles.current.splice(i, 1);
              continue;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
          ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw Head (Magical Orb)
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FFF';
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(mouse.current.x, mouse.current.y, isHovering.current ? 3 : 2, 0, Math.PI*2);
      ctx.fill();

      // Orbital Rings for Pen Mode
      if (isHovering.current) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(mouse.current.x, mouse.current.y, 8, 4, time/5, 0, Math.PI*2);
          ctx.stroke();
          
          ctx.strokeStyle = '#00F0FF';
          ctx.beginPath();
          ctx.ellipse(mouse.current.x, mouse.current.y, 8, 4, -time/5, 0, Math.PI*2);
          ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[100] pointer-events-none mix-blend-screen"
    />
  );
};

export default SnakeCursor;