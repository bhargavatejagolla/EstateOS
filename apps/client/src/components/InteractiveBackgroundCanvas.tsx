import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  isGlaring: boolean;
}

interface StardustSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
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

    // Mouse coordinates
    let mouse = {
      x: width * 0.5,
      y: height * 0.4,
      targetX: width * 0.5,
      targetY: height * 0.4,
      active: false,
      prevX: width * 0.5,
      prevY: height * 0.4,
    };

    const starColors = ["#ffffff", "#e0f2fe", "#7dd3fc", "#38bdf8", "#a7f3d0", "#c084fc"];

    // 1. Generate Static Twinkling Stars (dense & bright)
    const starCount = Math.min(Math.floor((width * height) / 7000), 220);
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      const size = Math.random() < 0.15 ? 2.5 + Math.random() * 1.5 : 1 + Math.random() * 1.6;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        color: starColors[Math.floor(Math.random() * starColors.length)] ?? "#ffffff",
        baseAlpha: 0.4 + Math.random() * 0.6,
        alpha: 0.4 + Math.random() * 0.6,
        twinkleSpeed: 0.015 + Math.random() * 0.03,
        isGlaring: size > 3.0,
      });
    }

    // 2. Mouse Stardust Sparks Pool
    const sparks: StardustSpark[] = [];

    // 3. Shooting Star State
    let shootingStar: ShootingStar = {
      x: 0,
      y: 0,
      length: 120,
      speed: 12,
      angle: Math.PI / 4,
      alpha: 0,
      active: false,
    };

    const triggerShootingStar = () => {
      shootingStar.x = Math.random() * (width * 0.8);
      shootingStar.y = Math.random() * (height * 0.4);
      shootingStar.length = 80 + Math.random() * 100;
      shootingStar.speed = 10 + Math.random() * 8;
      shootingStar.alpha = 1;
      shootingStar.active = true;
    };

    let meteorTimer = setInterval(() => {
      if (!shootingStar.active && Math.random() < 0.65) {
        triggerShootingStar();
      }
    }, 4500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      // Spawn stardust sparks on cursor movement
      const dist = Math.hypot(e.clientX - mouse.prevX, e.clientY - mouse.prevY);
      if (dist > 6) {
        const sparkCount = Math.min(Math.floor(dist / 8), 4);
        for (let i = 0; i < sparkCount; i++) {
          if (sparks.length < 90) {
            sparks.push({
              x: e.clientX + (Math.random() - 0.5) * 12,
              y: e.clientY + (Math.random() - 0.5) * 12,
              vx: (Math.random() - 0.5) * 1.5,
              vy: (Math.random() - 0.5) * 1.5 - 0.5,
              size: 1.5 + Math.random() * 2.5,
              alpha: 0.9,
              decay: 0.02 + Math.random() * 0.03,
              color: starColors[Math.floor(Math.random() * starColors.length)] ?? "#38bdf8",
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
      time += 0.02;

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      ctx.clearRect(0, 0, width, height);

      // A. Dynamic Mouse Cursor Ambient Spotlight (Bright Aurora Cone)
      if (mouse.active) {
        const aura = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 380);
        aura.addColorStop(0, "rgba(56, 189, 248, 0.14)");
        aura.addColorStop(0.3, "rgba(99, 102, 241, 0.07)");
        aura.addColorStop(0.7, "rgba(16, 185, 129, 0.03)");
        aura.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 380, 0, Math.PI * 2);
        ctx.fill();
      }

      // B. Draw Shooting Star (Meteor Trail)
      if (shootingStar.active) {
        const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
        const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

        const grad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
        grad.addColorStop(0, "rgba(56, 189, 248, 0)");
        grad.addColorStop(0.6, `rgba(56, 189, 248, ${shootingStar.alpha * 0.6})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${shootingStar.alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(shootingStar.x, shootingStar.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.alpha -= 0.012;

        if (shootingStar.alpha <= 0 || shootingStar.x > width || shootingStar.y > height) {
          shootingStar.active = false;
        }
      }

      // C. Render Twinkling Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        if (!star) continue;

        // Dynamic twinkling
        star.alpha = star.baseAlpha + Math.sin(time + i * 2) * 0.3;

        // Proximity flare with mouse cursor
        let currentSize = star.size;
        if (mouse.active) {
          const dx = mouse.x - star.x;
          const dy = mouse.y - star.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180) {
            const factor = 1 - dist / 180;
            star.alpha = Math.min(1, star.alpha + factor * 0.5);
            currentSize = star.size * (1 + factor * 1.2);
          }
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, star.alpha));
        ctx.fill();

        // Diamond Cross Flare for prominent brighter stars
        if (star.isGlaring) {
          const flareLen = currentSize * 3.5;
          ctx.beginPath();
          ctx.moveTo(star.x - flareLen, star.y);
          ctx.lineTo(star.x + flareLen, star.y);
          ctx.moveTo(star.x, star.y - flareLen);
          ctx.lineTo(star.x, star.y + flareLen);
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      // D. Render Mouse Stardust Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        if (!sp) continue;

        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= sp.decay;

        if (sp.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = sp.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(meteorTimer);
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
