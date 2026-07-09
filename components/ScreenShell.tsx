"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Logo } from "./Logo";
import { ProgressDots } from "./ProgressDots";

export function ScreenShell({
  children,
  onBack,
  onHome,
  backLabel = "Volver",
  appName = "Cocina Sin Estrés",
  progress,
  eyebrow,
  wide = false,
}: {
  children: ReactNode;
  onBack?: () => void;
  onHome?: () => void;
  backLabel?: string;
  appName?: string;
  progress?: { total: number; current: number };
  eyebrow?: string;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-8 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-orange/20 blur-[110px]" />
      <div className="w-full max-w-md flex items-center justify-between mb-8 relative z-10 gap-2">
        <button
          onClick={onBack}
          className={`flex items-center gap-1.5 text-warm text-sm font-bold px-2.5 py-2 -ml-2.5 rounded-full transition-colors ${onBack ? "opacity-100 hover:bg-white/5" : "opacity-0 pointer-events-none"}`}
        >
          <span className="text-lg leading-none">←</span>
          <span>{backLabel}</span>
        </button>
        <button
          onClick={onHome}
          disabled={!onHome}
          className="flex items-center gap-2 disabled:pointer-events-none flex-shrink-0"
          aria-label="Volver al inicio"
        >
          <Logo size={28} />
          <span className="text-sm font-bold tracking-wide text-warm hidden sm:inline">{appName}</span>
        </button>
        <div className="w-6 flex-shrink-0" />
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
