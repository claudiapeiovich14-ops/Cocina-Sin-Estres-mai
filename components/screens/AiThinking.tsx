"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "../ui/Logo";

const ORBIT_EMOJI = ["🍅", "🥑", "🧄", "🍗", "🌶️", "🧀", "🥕", "🍚"];

export function AiThinking({
  title,
  lines,
  durationMs = 2800,
  onDone,
}: {
  title: string;
  lines: string[];
  durationMs?: number;
  onDone: () => void;
}) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const lineInterval = setInterval(() => {
      setLineIndex((i) => (i + 1) % lines.length);
    }, Math.max(500, durationMs / lines.length));
    const timeout = setTimeout(onDone, durationMs);
    return () => {
      clearInterval(lineInterval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[420px] h-[420px] rounded-full bg-orange/15 blur-[100px] animate-pulseGlow" />
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center mb-10">
        <div className="absolute inset-0 animate-spinSlow" style={{ animationDuration: "14s" }}>
          {ORBIT_EMOJI.map((emoji, i) => {
            const angle = (i * 360) / ORBIT_EMOJI.length;
            const radius = 110;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            return (
              <div
                key={emoji}
                className="absolute text-2xl animate-floatSlow"
                style={{
                  left: `calc(50% + ${x}px - 16px)`,
                  top: `calc(50% + ${y}px - 16px)`,
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                {emoji}
              </div>
            );
          })}
        </div>

        <div className="relative w-28 h-28 rounded-full bg-surface border border-orange/30 flex items-center justify-center shadow-glow">
          <Logo size={52} spinning />
        </div>
      </div>

      <h2 className="text-xl font-extrabold text-warm mb-3 text-center">{title}</h2>

      <div className="h-6 relative w-full max-w-xs text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={lineIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-muted text-sm absolute inset-0"
          >
            {lines[lineIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
