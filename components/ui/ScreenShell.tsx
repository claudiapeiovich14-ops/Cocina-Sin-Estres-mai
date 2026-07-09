"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Logo } from "./Logo";
import { ProgressDots } from "./ProgressDots";

export function ScreenShell({
  children,
  onBack,
  progress,
  eyebrow,
  wide = false,
}: {
  children: ReactNode;
  onBack?: () => void;
  progress?: { total: number; current: number };
  eyebrow?: string;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-8 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-orange/10 blur-[120px]" />
      <div className="w-full max-w-md flex items-center justify-between mb-8 relative z-10">
        <button
          onClick={onBack}
          className={`text-muted text-sm font-medium transition-opacity ${onBack ? "opacity-100 hover:text-warm" : "opacity-0 pointer-events-none"}`}
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <Logo size={20} />
          <span className="text-sm font-bold tracking-wide text-warm">Chef AI</span>
        </div>
        <div className="w-6" />
      </div>

      {progress && (
        <div className="mb-8 relative z-10">
          <ProgressDots total={progress.total} current={progress.current} />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} flex-1 flex flex-col relative z-10`}
      >
        {eyebrow && <p className="text-orange text-xs font-bold tracking-[0.15em] uppercase mb-2">{eyebrow}</p>}
        {children}
      </motion.div>
    </div>
  );
}
