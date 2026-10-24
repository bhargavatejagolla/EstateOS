import React, { useEffect, useRef } from "react";

interface WaveRibbon {
  baseY: number;
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
  colorStart: string;
  colorMid: string;
  colorEnd: string;
  lineWidth: number;
  alpha: number;
}

interface FluidParticle {
  x: number;
  y: number;
  ribbonIdx: number;
  speed: number;
  size: number;
  alpha: number;
  color: string;
}

export function KineticFluidRibbonBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width * 0.5,
      y: height * 0.5,
      targetX: width * 0.5,
      targetY: height * 0.5,
      active: false,
    };

    // 1. Generate Multi-Tier Kinetic Flowing Ribbons
    const ribbonCount = 9;
    const ribbons: WaveRibbon[] = [];

    const palette = [
      { start: "rgba(6, 182, 212, 0.6)", mid: "rgba(56, 189, 248, 0.4)", end: "rgba(16, 185, 129, 0.1)" }, // Cyan-Emerald
      { start: "rgba(59, 130, 246, 0.5)", mid: "rgba(99, 102, 241, 0.35)", end: "rgba(168, 85, 247, 0.1)" }, // Blue-Purple
      { start: "rgba(16, 185, 129, 0.6)", mid: "rgba(20, 184, 166, 0.4)", end: "rgba(6, 182, 212, 0.15)" }, // Emerald-Teal
      { start: "rgba(14, 165, 233, 0.55)", mid: "rgba(6, 182, 212, 0.4)", end: "rgba(34, 197, 94, 0.15)" },
    ];

    for (let i = 0; i < ribbonCount; i++) {
      const p = palette[i % palette.length]!;
      ribbons.push({
        baseY: height * (0.15 + (i / ribbonCount) * 0.75),
        amplitude: 35 + (i % 3) * 20,
        frequency: 0.0018 + (i % 4) * 0.0006,
        speed: 0.012 + (i % 3) * 0.006,
        phase: (i * Math.PI) / 4,
        colorStart: p.start,
        colorMid: p.mid,
        colorEnd: p.end,
        lineWidth: 1.5 + (i % 2) * 1.0,
        alpha: 0.45 + (i % 3) * 0.15,
      });
    }

    // 2. Generate Bioluminescent Flow Particles Riding the Waves
    const particleCount = 45;
    const particles: FluidParticle[] = [];
    const particleColors = ["#38bdf8", "#34d399", "#a7f3d0", "#67e8f9", "#c084fc"];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: 0,
        ribbonIdx: Math.floor(Math.random() * ribbonCount),
        speed: 0.8 + Math.random() * 1.5,
        size: 1.2 + Math.random() * 2.0,
        alpha: 0.4 + Math.random() * 0.5,
        color: particleColors[Math.floor(Math.random() * particleColors.length)] ?? "#38bdf8",
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      // Re-adjust base heights proportionally
      ribbons.forEach((r, idx) => {
        r.baseY = height * (0.15 + (idx / ribbonCount) * 0.75);
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      time += 0.015;

      // Mouse smoothing
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // ----------------------------------------------------
      // A. Deep Liquid Plasma Aurora Clouds (Ambient Base)
      // ----------------------------------------------------
      const auroraGrad1 = ctx.createRadialGradient(
        width * 0.25 + Math.sin(time * 0.4) * 120,
        height * 0.3 + Math.cos(time * 0.3) * 80,
        20,
        width * 0.25,
        height * 0.3,
        width * 0.55
      );
      auroraGrad1.addColorStop(0, "rgba(6, 182, 212, 0.08)");
      auroraGrad1.addColorStop(0.5, "rgba(14, 116, 144, 0.03)");
      auroraGrad1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = auroraGrad1;
      ctx.fillRect(0, 0, width, height);

      const auroraGrad2 = ctx.createRadialGradient(
        width * 0.75 - Math.cos(time * 0.5) * 100,
        height * 0.7 - Math.sin(time * 0.4) * 80,
        30,
        width * 0.75,
        height * 0.7,
        width * 0.5
      );
      auroraGrad2.addColorStop(0, "rgba(16, 185, 129, 0.065)");
      auroraGrad2.addColorStop(0.55, "rgba(99, 102, 241, 0.025)");
      auroraGrad2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = auroraGrad2;
      ctx.fillRect(0, 0, width, height);

      // ----------------------------------------------------
      // B. Mouse Proximity Radial Lens
      // ----------------------------------------------------
      if (mouse.active) {
        const mouseLens = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 340);
        mouseLens.addColorStop(0, "rgba(56, 189, 248, 0.09)");
        mouseLens.addColorStop(0.4, "rgba(6, 182, 212, 0.03)");
        mouseLens.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = mouseLens;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 340, 0, Math.PI * 2);
        ctx.fill();
      }

      // ----------------------------------------------------
      // C. Render Kinetic Fluid Ribbons
      // ----------------------------------------------------
      const step = 20;

      ribbons.forEach((ribbon, rIdx) => {
        ctx.beginPath();

        let prevX = 0;
        let prevY = ribbon.baseY;

        for (let x = 0; x <= width + step; x += step) {
          // Base sine wave oscillation
          const angle1 = x * ribbon.frequency + time * ribbon.speed + ribbon.phase;
          const angle2 = x * (ribbon.frequency * 1.5) - time * (ribbon.speed * 0.7);
          let y = ribbon.baseY + Math.sin(angle1) * ribbon.amplitude + Math.cos(angle2) * (ribbon.amplitude * 0.35);

          // Interactive Mouse Gravity Wave Ripple
          if (mouse.active) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const distSq = dx * dx + dy * dy;
            const radius = 220;

            if (distSq < radius * radius) {
              const factor = Math.exp(-distSq / (2 * (radius * 0.5) * (radius * 0.5)));
              const pushDirection = y < mouse.y ? -1 : 1;
              y += pushDirection * factor * 55;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            const cpx = (prevX + x) / 2;
            const cpy = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, cpx, cpy);
          }

          prevX = x;
          prevY = y;
        }

        // Ribbon Gradient Stroke
        const ribbonGrad = ctx.createLinearGradient(0, ribbon.baseY - 50, width, ribbon.baseY + 50);
        ribbonGrad.addColorStop(0, ribbon.colorStart);
        ribbonGrad.addColorStop(0.5, ribbon.colorMid);
        ribbonGrad.addColorStop(1, ribbon.colorEnd);

        ctx.strokeStyle = ribbonGrad;
        ctx.lineWidth = ribbon.lineWidth;
        ctx.globalAlpha = ribbon.alpha;
        ctx.stroke();

        // Subtle Glow Pass for prominent ribbons
        if (rIdx % 3 === 0) {
          ctx.lineWidth = ribbon.lineWidth * 2.8;
          ctx.globalAlpha = ribbon.alpha * 0.25;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      });

      // ----------------------------------------------------
      // D. Render Bioluminescent Flow Particles
      // ----------------------------------------------------
      particles.forEach((p) => {
        p.x += p.speed;
        if (p.x > width + 50) {
          p.x = -20;
          p.ribbonIdx = Math.floor(Math.random() * ribbonCount);
        }

        const ribbon = ribbons[p.ribbonIdx]!;
        const angle = p.x * ribbon.frequency + time * ribbon.speed + ribbon.phase;
        p.y = ribbon.baseY + Math.sin(angle) * ribbon.amplitude;

        // Mouse displacement
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180) {
            const factor = 1 - dist / 180;
            p.y += (p.y < mouse.y ? -1 : 1) * factor * 40;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
      aria-hidden="true"
    />
  );
}

export default KineticFluidRibbonBackground;
