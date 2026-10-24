import React, { useState, useRef, useCallback } from "react";

interface GlassTiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glareColor?: string;
  onClick?: () => void;
}

export function GlassTiltCard({
  children,
  className = "",
  maxTilt = 8,
  glareColor = "rgba(56, 189, 248, 0.12)",
  onClick,
}: GlassTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotX = (y - 0.5) * -maxTilt * 2;
      const rotY = (x - 0.5) * maxTilt * 2;

      setTransform(`perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-2px)`);
      setGlarePos({ x: x * 100, y: y * 100, opacity: 1 });
    },
    [maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)");
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform,
        transition: "transform 0.18s cubic-bezier(0.2, 0, 0, 1)",
        transformStyle: "preserve-3d",
      }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-xl shadow-black/40 hover:border-cyan-500/40 transition-colors ${className}`}
    >
      {/* Specular Glare Follower */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-10"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(circle 260px at ${glarePos.x}% ${glarePos.y}%, ${glareColor}, transparent 70%)`,
        }}
      />

      {/* Subtle top edge specular rim */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />

      {/* Card Content */}
      <div className="relative z-0 h-full">{children}</div>
    </div>
  );
}

export default GlassTiltCard;
