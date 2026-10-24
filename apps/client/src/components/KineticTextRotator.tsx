import React, { useState, useEffect } from "react";

interface KineticTextRotatorProps {
  phrases?: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function KineticTextRotator({
  phrases = [
    "Modern Renting.",
    "Autonomous Cashflow.",
    "Institutional Portfolios.",
    "Digital Twin Estates.",
  ],
  typingSpeed = 70,
  pauseDuration = 2200,
  className = "",
}: KineticTextRotatorProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex] || "";

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing forwards
          if (displayText.length < currentPhrase.length) {
            setDisplayText(currentPhrase.slice(0, displayText.length + 1));
          } else {
            // Reached full word, pause then delete
            setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        } else {
          // Deleting backwards
          if (displayText.length > 0) {
            setDisplayText(currentPhrase.slice(0, displayText.length - 1));
          } else {
            // Word deleted, move to next
            setIsDeleting(false);
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
          }
        }
      },
      isDeleting ? typingSpeed / 2 : typingSpeed
    );

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex, phrases, typingSpeed, pauseDuration]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
        {displayText}
      </span>
      <span className="ml-1 inline-block w-[3px] h-[0.9em] bg-cyan-400 animate-pulse rounded-full shadow-[0_0_8px_#38bdf8]" />
    </span>
  );
}

export default KineticTextRotator;
