"use client";

import { useEffect, useRef } from "react";

// Fondo animado suave que mezcla "puntos humanos" y "puntos modelo" en órbitas.
// Pensado para dar vibra tipo red neuronal / constelación, sin distraer demasiado.

interface Particle {
  x: number;
  y: number;
  radius: number;
  angle: number;
  speed: number;
  orbitRadius: number;
  kind: "human" | "model";
}

const HUMAN_COLOR = "rgba(244, 244, 245, 0.9)"; // casi blanco
const MODEL_COLOR = "rgba(251, 191, 36, 0.85)"; // amber-400 más brillante

export function BackgroundOrbits() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      particles.length = 0;
      const { width, height } = canvas.getBoundingClientRect();
      const centerX = width / 2;
      const centerY = height / 2;

      const total = 140; // denso pero todavía razonable
      for (let i = 0; i < total; i++) {
        const kind: Particle["kind"] = i % 3 === 0 ? "human" : "model";
        const orbitRadius =
          Math.random() * Math.min(width, height) * (kind === "human" ? 0.35 : 0.6) +
          (kind === "human" ? 18 : 32);

        particles.push({
          x: centerX,
          y: centerY,
          radius: kind === "human" ? 2.1 + Math.random() * 1.4 : 1.6,
          angle: Math.random() * Math.PI * 2,
          speed:
            (kind === "human" ? 0.0007 : 0.0014) * (0.5 + Math.random() * 1.3),
          orbitRadius,
          kind,
        });
      }
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const { width, height } = rect;
      const centerX = width / 2;
      const centerY = height / 2;

      // Limpiamos pero dejamos el gradiente del layout visible debajo
      ctx.clearRect(0, 0, width, height);

      // líneas de conexión
      ctx.lineWidth = 0.75;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed;
        const wobble = Math.sin(p.angle * 3) * 4;

        p.x = centerX + Math.cos(p.angle) * (p.orbitRadius + wobble);
        p.y = centerY + Math.sin(p.angle * 0.98) * (p.orbitRadius * 0.35 + wobble);

        // conexiones cercanas
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.35;
            ctx.strokeStyle =
              p.kind === q.kind
                ? `rgba(148, 163, 184, ${alpha})`
                : `rgba(251, 191, 36, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // puntos
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.kind === "human" ? HUMAN_COLOR : MODEL_COLOR;
        ctx.fill();
      }

      animationFrameId = window.requestAnimationFrame(draw);
    };

    const handleResize = () => {
      resize();
      initParticles();
    };

    resize();
    initParticles();
    draw();

    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full opacity-90"
      aria-hidden="true"
    />
  );
}
