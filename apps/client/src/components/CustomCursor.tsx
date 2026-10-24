import React, { useEffect, useState, useRef } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const requestRef = useRef<number>(0);
  const posRef = useRef({ x: -100, y: -100 });
  const trailRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering over an interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest("button, a, input, select, textarea, [role='button'], .interactive-hover");
        setIsHovered(!!interactive);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Smooth trailing physics
    const animateTrail = () => {
      trailRef.current.x += (posRef.current.x - trailRef.current.x) * 0.18;
      trailRef.current.y += (posRef.current.y - trailRef.current.y) * 0.18;
      setTrailingPos({ x: trailRef.current.x, y: trailRef.current.y });
      requestRef.current = requestAnimationFrame(animateTrail);
    };

    requestRef.current = requestAnimationFrame(animateTrail);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer Spring Follower Ring */}
      <div
        className="fixed rounded-full pointer-events-none transition-transform duration-75 ease-out"
        style={{
          left: trailingPos.x,
          top: trailingPos.y,
          width: isHovered ? "48px" : "32px",
          height: isHovered ? "48px" : "32px",
          transform: `translate(-50%, -50%) scale(${isClicked ? 0.85 : isHovered ? 1.25 : 1})`,
          background: isHovered ? "rgba(56, 189, 248, 0.08)" : "transparent",
          border: isHovered ? "1.5px solid rgba(56, 189, 248, 0.8)" : "1px solid rgba(56, 189, 248, 0.35)",
          boxShadow: isHovered
            ? "0 0 20px rgba(56, 189, 248, 0.4), inset 0 0 10px rgba(56, 189, 248, 0.2)"
            : "0 0 10px rgba(56, 189, 248, 0.15)",
          transition: "width 0.2s, height 0.2s, background 0.2s, border 0.2s, transform 0.15s",
        }}
      />

      {/* Center Precise Laser Dot */}
      <div
        className="fixed rounded-full pointer-events-none"
        style={{
          left: position.x,
          top: position.y,
          width: "6px",
          height: "6px",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#38bdf8",
          boxShadow: "0 0 12px #38bdf8, 0 0 4px #ffffff",
        }}
      />
    </div>
  );
}

export default CustomCursor;
