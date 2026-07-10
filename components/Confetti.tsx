"use client";

import { motion } from "framer-motion";

const COLORS = ["#FF7A1A", "#9FBE7C", "#F5EDE6", "#FFD9AD", "#3CB371"];
const PIECES = Array.from({ length: 26 }, (_, i) => i);

export function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {PIECES.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.4;
        const duration = 1.6 + Math.random() * 1.1;
        const color = COLORS[i % COLORS.length];
        const size = 6 + Math.random() * 6;
        const rotate = Math.random() * 360;
        const isRound = i % 3 === 0;
        return (
          <motion.span
            key={i}
            initial={{ y: -30, x: 0, opacity: 1, rotate: 0 }}
            animate={{ y: "110vh", x: (Math.random() - 0.5) * 120, opacity: [1, 1, 0], rotate: rotate }}
            transition={{ duration, delay, ease: "easeIn" }}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: 0,
              width: size,
              height: size,
              background: color,
              borderRadius: isRound ? "50%" : "2px",
            }}
          />
        );
      })}
    </div>
  );
}
