"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  decay: number;
  color: string;
  blur: number;
  isCluster?: boolean;
}

interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: string;
  blur: number;
}

export const CursorParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color Palette: Cyan, Electric Blue, Violet/Purple, White
    const colors = [
      "rgba(0, 219, 233, ",    // Cyan
      "rgba(56, 189, 248, ",   // Sky Blue
      "rgba(192, 132, 252, ",  // Light Violet
      "rgba(129, 140, 248, ",  // Indigo
      "rgba(255, 255, 255, ",  // White
      "rgba(224, 231, 255, ",  // Ice White
    ];

    // Mouse Tracking State
    let mouseX = width / 2;
    let mouseY = height / 2;
    let lastMouseX = mouseX;
    let lastMouseY = mouseY;
    let mouseVx = 0;
    let mouseVy = 0;
    let isMouseMoving = false;
    let lastMoveTime = Date.now();

    // Particle Pools
    const particles: Particle[] = [];
    const MAX_CURSOR_PARTICLES = 140;

    // Ambient Particles (Background depth field)
    const ambientParticles: AmbientParticle[] = [];
    const AMBIENT_COUNT = Math.min(45, Math.floor((width * height) / 35000));

    for (let i = 0; i < AMBIENT_COUNT; i++) {
      ambientParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25 - 0.05,
        size: Math.random() < 0.2 ? Math.random() * 4 + 2 : Math.random() * 2 + 1,
        baseAlpha: Math.random() * 0.25 + 0.05,
        alpha: 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        blur: Math.random() < 0.3 ? Math.random() * 6 + 3 : 0,
      });
    }

    const spawnCursorParticles = (x: number, y: number, vx: number, vy: number) => {
      const speed = Math.hypot(vx, vy);
      // Faster mouse movement spawns more particles
      const count = Math.min(4, Math.max(1, Math.floor(speed * 0.25) + 1));

      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_CURSOR_PARTICLES) {
          particles.shift(); // Evict oldest
        }

        const isLargeOrb = Math.random() < 0.22;
        const isCluster = Math.random() < 0.18;
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Spread slightly around cursor
        const spreadAngle = Math.random() * Math.PI * 2;
        const spreadDist = Math.random() * 18 + 4;
        const spawnX = x + Math.cos(spreadAngle) * spreadDist;
        const spawnY = y + Math.sin(spreadAngle) * spreadDist;

        // Velocity inherits from mouse with random turbulence
        const inheritedVx = vx * 0.18 + (Math.random() - 0.5) * 1.4;
        const inheritedVy = vy * 0.18 + (Math.random() - 0.5) * 1.4 - 0.2; // slight upward drift

        const size = isLargeOrb
          ? Math.random() * 6 + 4
          : Math.random() * 2.5 + 1.2;

        const maxAlpha = isLargeOrb ? 0.45 : 0.75;

        particles.push({
          x: spawnX,
          y: spawnY,
          vx: inheritedVx,
          vy: inheritedVy,
          size,
          alpha: maxAlpha,
          maxAlpha,
          decay: isLargeOrb ? Math.random() * 0.012 + 0.008 : Math.random() * 0.022 + 0.014,
          color,
          blur: isLargeOrb ? Math.random() * 8 + 4 : Math.random() * 3,
          isCluster,
        });

        // Spawn a tight sub-particle if cluster
        if (isCluster && particles.length < MAX_CURSOR_PARTICLES) {
          particles.push({
            x: spawnX + (Math.random() - 0.5) * 6,
            y: spawnY + (Math.random() - 0.5) * 6,
            vx: inheritedVx * 0.9,
            vy: inheritedVy * 0.9,
            size: size * 0.6,
            alpha: maxAlpha * 0.9,
            maxAlpha: maxAlpha * 0.9,
            decay: Math.random() * 0.02 + 0.015,
            color,
            blur: isLargeOrb ? 4 : 1,
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = Math.max(1, now - lastMoveTime);
      lastMoveTime = now;

      mouseX = e.clientX;
      mouseY = e.clientY;

      mouseVx = ((mouseX - lastMouseX) / dt) * 12;
      mouseVy = ((mouseY - lastMouseY) / dt) * 12;

      lastMouseX = mouseX;
      lastMouseY = mouseY;
      isMouseMoving = true;

      spawnCursorParticles(mouseX, mouseY, mouseVx, mouseVy);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let lastTime = performance.now();

    const render = (now: number) => {
      const delta = Math.min(32, now - lastTime) / 1000;
      lastTime = now;

      if (!document.hidden) {
        ctx.clearRect(0, 0, width, height);

        // 1. Render Ambient Background Field
        for (let i = 0; i < ambientParticles.length; i++) {
          const p = ambientParticles[i];
          p.x += p.vx;
          p.y += p.vy;

          // Wrap edges
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Pulsing alpha
          p.pulsePhase += p.pulseSpeed;
          p.alpha = p.baseAlpha + Math.sin(p.pulsePhase) * (p.baseAlpha * 0.5);

          ctx.save();
          if (p.blur > 0) {
            ctx.shadowColor = `${p.color}0.8)`;
            ctx.shadowBlur = p.blur;
          }
          const safeAlpha = Math.max(0, p.alpha).toFixed(2);
          ctx.fillStyle = `${p.color}${safeAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 2. Render Interactive Cursor Particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];

          // Physics update
          p.x += p.vx;
          p.y += p.vy;

          // Drag / Friction & upward buoyancy
          p.vx *= 0.96;
          p.vy = p.vy * 0.96 - 0.04;

          // Alpha fade out
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          // Render Particle
          ctx.save();
          if (p.blur > 0) {
            ctx.shadowColor = `${p.color}0.9)`;
            ctx.shadowBlur = p.blur;
          }

          const currentAlpha = Math.max(0, Math.min(1, p.alpha));
          ctx.fillStyle = `${p.color}${currentAlpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (currentAlpha / p.maxAlpha * 0.4 + 0.6), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden"
    />
  );
};
