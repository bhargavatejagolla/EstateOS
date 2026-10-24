import React, { useEffect, useRef, useState } from "react";

interface BiometricCyberEyeProps {
  isPasswordFocused?: boolean;
  isHoveringSubmit?: boolean;
  isAuthenticating?: boolean;
  className?: string;
  size?: number;
}

export function BiometricCyberEye({
  isPasswordFocused = false,
  isHoveringSubmit = false,
  isAuthenticating = false,
  className = "",
  size = 280,
}: BiometricCyberEyeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blinkProgress, setBlinkProgress] = useState(0);

  // References for mouse tracking & animation loop
  const stateRef = useRef({
    mouseX: 0,
    mouseY: 0,
    currentEyeX: 0,
    currentEyeY: 0,
    targetEyeX: 0,
    targetEyeY: 0,
    pupilScale: 1,
    scannerY: 0,
    scannerDir: 1,
    rotationAngle: 0,
    isBlinking: false,
    reqId: 0,
  });

  // Handle blink intervals
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() < 0.4 && !isPasswordFocused) {
        stateRef.current.isBlinking = true;
        let p = 0;
        const step = () => {
          p += 0.15;
          if (p < 1) {
            setBlinkProgress(Math.sin(p * Math.PI));
            requestAnimationFrame(step);
          } else {
            setBlinkProgress(0);
            stateRef.current.isBlinking = false;
          }
        };
        step();
      }
    }, 3800);

    return () => clearInterval(blinkInterval);
  }, [isPasswordFocused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const state = stateRef.current;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from center of eye normalized [-1, 1]
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      // Clamp max eye travel
      const maxDist = 28;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(Math.hypot(dx, dy) * maxDist, maxDist);

      stateRef.current.targetEyeX = Math.cos(angle) * dist;
      stateRef.current.targetEyeY = Math.sin(angle) * dist;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let time = 0;

    const render = () => {
      stateRef.current.reqId = requestAnimationFrame(render);
      time += 0.03;

      const state = stateRef.current;
      // Smooth eyeball physics
      state.currentEyeX += (state.targetEyeX - state.currentEyeX) * 0.14;
      state.currentEyeY += (state.targetEyeY - state.currentEyeY) * 0.14;

      // Rotation for outer HUD rings
      state.rotationAngle += isAuthenticating ? 0.08 : 0.015;

      // Scanner laser sweep
      state.scannerY += 1.8 * state.scannerDir;
      if (state.scannerY > size / 2 - 20) state.scannerDir = -1;
      if (state.scannerY < -size / 2 + 20) state.scannerDir = 1;

      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size * 0.42;

      // 1. Outer Holographic Tech Ring with Tick Marks
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(state.rotationAngle);

      ctx.beginPath();
      ctx.arc(0, 0, radius + 14, 0, Math.PI * 2);
      ctx.strokeStyle = isHoveringSubmit ? "#06b6d4" : "rgba(56, 189, 248, 0.25)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cardinal HUD tick marks
      for (let i = 0; i < 12; i++) {
        const rad = (i * Math.PI) / 6;
        const x1 = Math.cos(rad) * (radius + 8);
        const y1 = Math.sin(rad) * (radius + 8);
        const x2 = Math.cos(rad) * (radius + (i % 3 === 0 ? 18 : 13));
        const y2 = Math.sin(rad) * (radius + (i % 3 === 0 ? 18 : 13));

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = i % 3 === 0 ? "#38bdf8" : "rgba(56, 189, 248, 0.3)";
        ctx.lineWidth = i % 3 === 0 ? 1.8 : 1;
        ctx.stroke();
      }
      ctx.restore();

      // 2. Counter-Rotating Inner Tech Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-state.rotationAngle * 1.4);

      ctx.beginPath();
      ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(129, 140, 248, 0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([12, 16]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 3. Eye Sclera (Dark Obsidian Shell with subtle gradient)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      const scleraGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.2,
        centerX,
        centerY,
        radius
      );
      scleraGrad.addColorStop(0, "#081026");
      scleraGrad.addColorStop(0.7, "#030712");
      scleraGrad.addColorStop(1, "#000000");

      ctx.fillStyle = scleraGrad;
      ctx.fill();

      // Cyber-Grid pattern inside sclera
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 0.8;
      const gridSize = 14;
      for (let gx = -radius; gx <= radius; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(centerX + gx, centerY - radius);
        ctx.lineTo(centerX + gx, centerY + radius);
        ctx.stroke();
      }
      for (let gy = -radius; gy <= radius; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(centerX - radius, centerY + gy);
        ctx.lineTo(centerX + radius, centerY + gy);
        ctx.stroke();
      }

      // 4. Moving Iris & Pupil (Tracks Cursor)
      const eyeX = centerX + state.currentEyeX;
      const eyeY = centerY + state.currentEyeY;
      const irisRadius = radius * 0.48;

      // Iris Outer Glow Aura
      const irisGlow = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, irisRadius * 1.5);
      irisGlow.addColorStop(0, isHoveringSubmit ? "rgba(6, 182, 212, 0.6)" : "rgba(56, 189, 248, 0.45)");
      irisGlow.addColorStop(0.7, "rgba(99, 102, 241, 0.25)");
      irisGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = irisGlow;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, irisRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Iris Body
      const irisGrad = ctx.createRadialGradient(eyeX, eyeY, 4, eyeX, eyeY, irisRadius);
      if (isAuthenticating) {
        irisGrad.addColorStop(0, "#34d399");
        irisGrad.addColorStop(0.5, "#059669");
        irisGrad.addColorStop(1, "#064e3b");
      } else if (isHoveringSubmit) {
        irisGrad.addColorStop(0, "#38bdf8");
        irisGrad.addColorStop(0.4, "#06b6d4");
        irisGrad.addColorStop(1, "#1e1b4b");
      } else {
        irisGrad.addColorStop(0, "#38bdf8");
        irisGrad.addColorStop(0.4, "#6366f1");
        irisGrad.addColorStop(0.8, "#312e81");
        irisGrad.addColorStop(1, "#09090b");
      }

      ctx.beginPath();
      ctx.arc(eyeX, eyeY, irisRadius, 0, Math.PI * 2);
      ctx.fillStyle = irisGrad;
      ctx.fill();
      ctx.strokeStyle = isHoveringSubmit ? "#22d3ee" : "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Luminous Iris Fibers / Spokes
      ctx.save();
      ctx.translate(eyeX, eyeY);
      ctx.rotate(time * 0.4);
      for (let i = 0; i < 18; i++) {
        const rad = (i * Math.PI) / 9;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rad) * (irisRadius * 0.35), Math.sin(rad) * (irisRadius * 0.35));
        ctx.lineTo(Math.cos(rad) * (irisRadius * 0.9), Math.sin(rad) * (irisRadius * 0.9));
        ctx.strokeStyle = i % 2 === 0 ? "rgba(56, 189, 248, 0.6)" : "rgba(167, 139, 250, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // 5. Pupil (Dilates on Hover, Contracts on Authenticating)
      let pupilRadius = irisRadius * 0.42;
      if (isHoveringSubmit) pupilRadius *= 1.25;
      if (isAuthenticating) pupilRadius *= 0.7;

      ctx.beginPath();
      ctx.arc(eyeX, eyeY, pupilRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#02040a";
      ctx.fill();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Pupil Targeting Crosshairs (HUD Reticle)
      ctx.beginPath();
      ctx.moveTo(eyeX - pupilRadius - 4, eyeY);
      ctx.lineTo(eyeX + pupilRadius + 4, eyeY);
      ctx.moveTo(eyeX, eyeY - pupilRadius - 4);
      ctx.lineTo(eyeX, eyeY + pupilRadius + 4);
      ctx.strokeStyle = isHoveringSubmit ? "#34d399" : "rgba(56, 189, 248, 0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Specular Glare (Glass Optical Reflection)
      ctx.beginPath();
      ctx.arc(eyeX - pupilRadius * 0.45, eyeY - pupilRadius * 0.45, pupilRadius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(eyeX + pupilRadius * 0.35, eyeY + pupilRadius * 0.35, pupilRadius * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fill();

      // 6. Laser Scanner Beam (Sweeping across eye)
      const scanY = centerY + state.scannerY;
      const scanGrad = ctx.createLinearGradient(centerX - radius, scanY, centerX + radius, scanY);
      scanGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
      scanGrad.addColorStop(0.5, isHoveringSubmit ? "rgba(52, 211, 153, 0.85)" : "rgba(56, 189, 248, 0.75)");
      scanGrad.addColorStop(1, "rgba(56, 189, 248, 0)");

      ctx.beginPath();
      ctx.moveTo(centerX - radius, scanY);
      ctx.lineTo(centerX + radius, scanY);
      ctx.strokeStyle = scanGrad;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 7. Security Privacy Shield / Eyelids (When password focused or blinking)
      const currentBlink = isPasswordFocused ? 0.78 : blinkProgress;
      if (currentBlink > 0) {
        const lidHeight = radius * currentBlink;

        // Top Cyber Eyelid
        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.rect(centerX - radius, centerY - radius, radius * 2, lidHeight);
        ctx.fill();

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - radius, centerY - radius + lidHeight);
        ctx.lineTo(centerX + radius, centerY - radius + lidHeight);
        ctx.stroke();

        // Bottom Cyber Eyelid
        ctx.beginPath();
        ctx.rect(centerX - radius, centerY + radius - lidHeight, radius * 2, lidHeight);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(centerX - radius, centerY + radius - lidHeight);
        ctx.lineTo(centerX + radius, centerY + radius - lidHeight);
        ctx.stroke();
      }

      ctx.restore(); // restore clipping
    };

    render();

    return () => {
      cancelAnimationFrame(state.reqId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [size, isPasswordFocused, isHoveringSubmit, isAuthenticating, blinkProgress]);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="drop-shadow-[0_0_40px_rgba(56,189,248,0.25)]"
      />

      {/* Dynamic HUD Status Labels */}
      <div className="absolute -bottom-6 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 shadow-xl backdrop-blur-md">
        <span
          className={`h-2 w-2 rounded-full ${
            isAuthenticating
              ? "bg-emerald-400 animate-ping"
              : isPasswordFocused
              ? "bg-purple-400 animate-pulse"
              : "bg-cyan-400 animate-pulse"
          }`}
        />
        <span>
          {isAuthenticating
            ? "ENCRYPTING HANDSHAKE..."
            : isPasswordFocused
            ? "PRIVACY SHIELD ACTIVE"
            : isHoveringSubmit
            ? "BIOMETRIC LOCK ACQUIRED"
            : "SENTINEL RETINA ONLINE"}
        </span>
      </div>
    </div>
  );
}

export default BiometricCyberEye;
