"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "./Button";

export function WhySelected({
  reasons,
  title,
  ctaLabel,
  onNext,
}: {
  reasons: string[];
  title: string;
  ctaLabel: string;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-extrabold text-warm mb-6">{title}</h1>
      <div className="flex flex-col gap-3 mb-8">
        {reasons.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl px-4 py-3.5 flex items-start gap-3"
          >
            <Sparkles size={16} className="text-orange mt-0.5 flex-shrink-0" />
            <span className="text-warm/90 text-sm leading-snug">{r}</span>
          </motion.div>
        ))}
      </div>
      <Button onClick={onNext}>{ctaLabel}</Button>
    </div>
  );
}
