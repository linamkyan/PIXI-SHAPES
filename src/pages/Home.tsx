import { useEffect, useRef } from 'react';
import { createGame } from '@/game/controllers/GameController';

const ASPECT_RATIO = 600 / 900;
const MAX_WIDTH = 900;

const DOT_COLORS = ['#7bff4e', '#ff4dc4', '#4d9fff', '#be4dff', '#00e5cc'];

interface Dot {
  x: number; y: number;
  vx: number; vy: number;
  r: number; color: string; alpha: number;
}

function makeDots(w: number, h: number): Dot[] {
  return Array.from({ length: 200 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    r: Math.random() * 2 + 0.5,
    color: DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)],
    alpha: Math.random() * 0.65 + 0.25,
  }));
}

export default function Home() {
  const statsRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = bgRef.current!;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let dots: Dot[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      dots = makeDots(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;

        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    const statsEl = statsRef.current!;
    const gameEl = gameRef.current!;
    const controlsEl = controlsRef.current!;

    const initialWidth = Math.min(gameEl.offsetWidth || MAX_WIDTH, MAX_WIDTH);
    const initialHeight = Math.round(initialWidth * ASPECT_RATIO);

    let cancelled = false;
    let observer: ResizeObserver | null = null;

    const controller = createGame({
      gameWidth: initialWidth,
      gameHeight: initialHeight,
      gameContainer: gameEl,
      statsContainer: statsEl,
      controlsContainer: controlsEl,
    });

    controller.ready().then(() => {
      if (cancelled) return;

      controller.start();

      observer = new ResizeObserver(([entry]) => {
        const w = Math.min(Math.floor(entry.contentRect.width), MAX_WIDTH);
        const h = Math.round(w * ASPECT_RATIO);
        controller.resize(w, h);
      });

      observer.observe(gameEl);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      controller.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8" style={{ position: 'relative', overflow: 'hidden', background: '#0a0a0a' }}>
      <canvas ref={bgRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

      <div className="w-full" style={{ maxWidth: MAX_WIDTH, position: 'relative', zIndex: 1 }}>

        <div
          ref={statsRef}
          className="mb-3 px-1"
        />

        <div style={{
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 48px rgba(123,255,78,0.07), 0 2px 0 rgba(255,255,255,0.04) inset',
        }}>
          <div
            ref={gameRef}
            style={{ display: 'block', lineHeight: 0 }}
          />

          <div
            ref={controlsRef}
            style={{
              background: '#ffffff',
              padding: '12px 16px',
            }}
          />
        </div>

      </div>
    </div>
  );
}
