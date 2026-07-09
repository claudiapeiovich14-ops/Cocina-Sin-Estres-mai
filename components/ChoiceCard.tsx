"use client";

import { motion } from "framer-motion";

export function ChoiceCard({
  label,
  emoji,
  selected,
  onClick,
  compact = false,
}: {
  label: string;
  emoji?: string;
  selected?: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`w-full text-left rounded-2xl border transition-all duration-200 flex items-center gap-3 ${
        compact ? "px-4 py-3" : "px-5 py-4"
      } ${
        selected
          ? "border-orange bg-orange/10 shadow-glow"
          : "border-black/8 bg-surface hover:border-black/20"
      }`}
    >
      {emoji && <span className="text-xl">{emoji}</span>}
      <span className={`font-semibold ${selected ? "text-warm" : "text-warm/90"}`}>{label}</span>
    </motion.button>
  );
}
