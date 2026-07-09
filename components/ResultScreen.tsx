"use client";

import { motion } from "framer-motion";
import type { ChefAIResult } from "../lib/types";
import { Button } from "./Button";

export function ResultScreen({
  result,
  strings,
  onViewRecipe,
  onDislike,
  onAnother,
}: {
  result: ChefAIResult;
  strings: any;
  onViewRecipe: () => void;
  onDislike: () => void;
  onAnother: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-orange text-xs font-bold tracking-[0.15em] uppercase mb-3">{strings.result.title}</p>

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        className="w-40 h-40 rounded-3xl bg-surface border border-orange/30 shadow-glow flex items-center justify-center text-7xl mb-6"
      >
        {result.imageEmoji}
      </motion.div>

      <h1 className="text-3xl font-extrabold text-warm mb-2 text-balance">{result.localizedRecipeName}</h1>
      <p className="text-muted mb-6">{result.description}</p>

      <div className="grid grid-cols-2 gap-3 w-full mb-8">
        <Stat label={strings.result.cost} value={result.estimatedCost} />
        <Stat label={strings.result.timeLabel} value={result.cookingTime} />
        <Stat label={strings.result.servings} value={String(result.servings)} />
        <Stat label={result.caloriesPerServing ? strings.result.calories : ""} value={result.caloriesPerServing ? `${result.caloriesPerServing}` : ""} />
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Button onClick={onViewRecipe} className="w-full">{strings.result.viewRecipe} →</Button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onDislike} className="flex-1">{strings.result.dislike}</Button>
          <Button variant="secondary" onClick={onAnother} className="flex-1">{strings.result.another}</Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  if (!label || !value) return <div />;
  return (
    <div className="glass rounded-2xl px-4 py-3 text-left">
      <p className="text-[11px] text-muted uppercase tracking-wide">{label}</p>
      <p className="text-warm font-bold">{value}</p>
    </div>
  );
}
