import React, { useEffect, useRef } from "react";

interface MicroStar {
  x: number;
  y: number;
  origX: number;
  origY: number;
  size: number;
  color: string;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
  depth: number;
}

interface LuminousStar {
  x: number;
  y: number;
  origX: number;
  origY: number;
  radius: number;
  color: string;
  glowColor: string;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  depth: number;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

interface Stardust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

export function InteractiveBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with smooth damping
    const mouse = {
      x: width * 0.5,
      y: height * 0.5,
      targetX: width * 0.5,
      targetY: height * 0.5,
      prevX: width * 0.5,
      prevY: height * 0.5,
      active: false,
    };

    // Realistic stellar spectral colors (O, B, A, F, G, K class stars)
    const deepStarColors = [
      "#ffffff", // Class A (Pure White)
      "#f8fafc", // Cool White
      "#e0f2fe", // Class B (Light Cyan-Blue)
      "#bae6fd", // Electric Sky Blue
      "#fef3c7", // Class F (Warm Cream)
      "#fde68a", // Class G (Soft Gold)
      "#fed7aa", // Class K (Soft Peach)
    ];

    // 1. Generate Deep Field Pinpoint Micro-Stars (400-500 stars)
    const microStarCount = Math.min(Math.floor((width * height) / 3200), 450);
    const microStars: MicroStar[] = [];

    for (let i = 0; i < microStarCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      microStars.push({
        x,
        y,
        origX: x,
        origY: y,
        size: 0.45 + Math.random() * 0.75, // Ultra-fine pinpoint stars
        color: deepStarColors[Math.floor(Math.random() * deepStarColors.length)] ?? "#ffffff",
        baseAlpha: 0.25 + Math.random() * 0.55,
        alpha: 0.25 + Math.random() * 0.55,
        twinkleSpeed: 0.008 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        depth: 0.01 + Math.random() * 0.015, // Subtle parallax
      });
    }

    // 2. Generate Luminous Anchor Stars with Photometric Corona (25-35 stars)
    const luminousCount = Math.min(Math.floor((width * height) / 45000), 32);
    const luminousStars: LuminousStar[] = [];

    for (let i = 0; i < luminousCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const isWarm = Math.random() > 0.65;
      luminousStars.push({
        x,
        y,
        origX: x,
        origY: y,
        radius: 1.2 + Math.random() * 0.8,
        color: isWarm ? "#fffbeb" : "#f0f9ff",
        glowColor: isWarm ? "rgba(251, 191, 36, 0.45)" : "rgba(56, 189, 248, 0.45)",
        baseAlpha: 0.6 + Math.random() * 0.35,
        twinkleSpeed: 0.012 + Math.random() * 0.018,
        phase: Math.random() * Math.PI * 2,
        depth: 0.03 + Math.random() * 0.025, // Prominent parallax
      });
    }

    // 3. Stardust particles pool for cursor movement
    const stardustPool: Stardust[] = [];

    // 4. Realistic Meteors
    let meteor: Meteor = {
      x: 0,
      y: 0,
      length: 140,
      speed: 16,
      angle: (35 * Math.PI) / 180, // Realistic diagonal re-entry angle
      alpha: 0,
      active: false,
    };

    const triggerMeteor = () => {
      meteor.x = Math.random() * (width * 0.7);
      meteor.y = Math.random() * (height * 0.3);
      meteor.length = 100 + Math.random() * 120;
      meteor.speed = 14 + Math.random() * 10;
      meteor.alpha = 1;
      meteor.active = true;
    };

    const meteorInterval = setInterval(() => {
      if (!meteor.active && Math.random() < 0.7) {
        triggerMeteor();
      }
    }, 5500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      // Spawn subtle cosmic stardust on cursor drag
      const dist = Math.hypot(e.clientX - mouse.prevX, e.clientY - mouse.prevY);
      if (dist > 8) {
        const count = Math.min(Math.floor(dist / 10), 3);
        for (let i = 0; i < count; i++) {
          if (stardustPool.length < 60) {
            stardustPool.push({
              x: e.clientX + (Math.random() - 0.5) * 8,
              y: e.clientY + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 0.8,
              vy: (Math.random() - 0.5) * 0.8 - 0.2,
              size: 0.8 + Math.random() * 1.4,
              alpha: 0.75,
              decay: 0.025 + Math.random() * 0.025,
              color: Math.random() > 0.5 ? "#38bdf8" : "#a7f3d0",
            });
          }
        }
        mouse.prevX = e.clientX;
        mouse.prevY = e.clientY;
      }
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

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const mouseOffsetX = (mouse.x - width * 0.5);
      const mouseOffsetY = (mouse.y - height * 0.5);

      ctx.clearRect(0, 0, width, height);

      // ----------------------------------------------------
      // A. Deep Cosmic Nebula Dust Glows (Organic Space Clouds)
      // ----------------------------------------------------
      // Top-Left Deep Cyan Nebula
      const neb1 = ctx.createRadialGradient(
        width * 0.25 - mouseOffsetX * 0.02,
        height * 0.3 - mouseOffsetY * 0.02,
        20,
        width * 0.25,
        height * 0.3,
        width * 0.45
      );
      neb1.addColorStop(0, "rgba(6, 182, 212, 0.055)");
      neb1.addColorStop(0.5, "rgba(14, 116, 144, 0.025)");
      neb1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, width, height);

      // Bottom-Right Deep Cosmic Violet Nebula
      const neb2 = ctx.createRadialGradient(
        width * 0.8 - mouseOffsetX * 0.015,
        height * 0.75 - mouseOffsetY * 0.015,
        30,
        width * 0.8,
        height * 0.75,
        width * 0.4
      );
      neb2.addColorStop(0, "rgba(139, 92, 246, 0.045)");
      neb2.addColorStop(0.6, "rgba(79, 70, 229, 0.018)");
      neb2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, width, height);

      // ----------------------------------------------------
      // B. Ambient Mouse Radial Spotlight
      // ----------------------------------------------------
      if (mouse.active) {
        const mouseAura = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 320);
        mouseAura.addColorStop(0, "rgba(56, 189, 248, 0.08)");
        mouseAura.addColorStop(0.4, "rgba(14, 165, 233, 0.03)");
        mouseAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = mouseAura;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 320, 0, Math.PI * 2);
        ctx.fill();
      }

      // ----------------------------------------------------
      // C. Render Deep Pinpoint Micro-Stars (Realistic Scintillation)
      // ----------------------------------------------------
      for (let i = 0; i < microStars.length; i++) {
        const s = microStars[i];
        if (!s) continue;

        // Realistic parallax displacement
        s.x = s.origX - mouseOffsetX * s.depth;
        s.y = s.origY - mouseOffsetY * s.depth;

        // Scintillating twinkle
        const twinkle = Math.sin(time * 2 + s.phase) * 0.25;
        const currentAlpha = Math.max(0.1, Math.min(1, s.baseAlpha + twinkle));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      }

      // ----------------------------------------------------
      // D. Render Luminous Stars with Soft Photometric Corona
      // ----------------------------------------------------
      for (let i = 0; i < luminousStars.length; i++) {
        const ls = luminousStars[i];
        if (!ls) continue;

        ls.x = ls.origX - mouseOffsetX * ls.depth;
        ls.y = ls.origY - mouseOffsetY * ls.depth;

        const twinkle = Math.sin(time * 3 + ls.phase) * 0.2;
        let alpha = Math.max(0.2, Math.min(1, ls.baseAlpha + twinkle));

        // Proximity glow if mouse hovers nearby
        if (mouse.active) {
          const dist = Math.hypot(mouse.x - ls.x, mouse.y - ls.y);
          if (dist < 160) {
            const factor = 1 - dist / 160;
            alpha = Math.min(1, alpha + factor * 0.4);
          }
        }

        // Soft Photometric Radial Corona (No hard lines or crosshairs!)
        const coronaRadius = ls.radius * 4.5;
        const corona = ctx.createRadialGradient(ls.x, ls.y, 0, ls.x, ls.y, coronaRadius);
        corona.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        corona.addColorStop(0.25, ls.glowColor.replace(/[\d.]+\)$/, `${alpha * 0.5})`));
        corona.addColorStop(0.7, ls.glowColor.replace(/[\d.]+\)$/, `${alpha * 0.15})`));
        corona.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(ls.x, ls.y, coronaRadius, 0, Math.PI * 2);
        ctx.fillStyle = corona;
        ctx.fill();

        // Pinpoint Core Center
        ctx.beginPath();
        ctx.arc(ls.x, ls.y, ls.radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // ----------------------------------------------------
      // E. Render Meteor (Shooting Star Streak)
      // ----------------------------------------------------
      if (meteor.active) {
        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

        const grad = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
        grad.addColorStop(0, "rgba(56, 189, 248, 0)");
        grad.addColorStop(0.7, `rgba(56, 189, 248, ${meteor.alpha * 0.6})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${meteor.alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(meteor.x, meteor.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Incandescent Head
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${meteor.alpha})`;
        ctx.fill();

        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;
        meteor.alpha -= 0.015;

        if (meteor.alpha <= 0 || meteor.x > width + 100 || meteor.y > height + 100) {
          meteor.active = false;
        }
      }

      // ----------------------------------------------------
      // F. Render Cursor Stardust Sparks
      // ----------------------------------------------------
      for (let i = stardustPool.length - 1; i >= 0; i--) {
        const sp = stardustPool[i];
        if (!sp) continue;

        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= sp.decay;

        if (sp.alpha <= 0) {
          stardustPool.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(meteorInterval);
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

export default InteractiveBackgroundCanvas;
