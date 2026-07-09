"use client";

import { motion } from "framer-motion";

export function CircularProgress({ value, label, sublabel, size = 96 }: { value: number; label: string; sublabel?: string; size?: number }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#232323" strokeWidth={stroke} fill="none" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FF7A1A"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (value / 100) * circumference }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-warm font-extrabold text-lg">{value}</div>
      </div>
      <p className="text-xs text-muted text-center">{label}</p>
      {sublabel && <p className="text-[11px] text-muted/70 text-center -mt-1">{sublabel}</p>}
    </div>
  );
}
