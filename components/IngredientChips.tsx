"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function IngredientChips({
  value,
  onChange,
  placeholder,
  suggestions,
  suggestedLabel,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  suggestions: string[];
  suggestedLabel: string;
}) {
  const [text, setText] = useState("");

  function add(raw: string) {
    const v = raw.trim();
    if (!v) return;
    if (value.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...value, v]);
    setText("");
  }

  function remove(v: string) {
    onChange(value.filter((x) => x !== v));
  }

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(text);
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-surface border border-white/10 px-5 py-4 text-warm placeholder:text-muted focus:outline-none focus:border-orange/60 transition-colors"
      />

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          <AnimatePresence>
            {value.map((v) => (
              <motion.div
                key={v}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 bg-orange/15 border border-orange/40 text-warm rounded-full pl-3 pr-2 py-1.5 text-sm font-medium"
              >
                {v}
                <button onClick={() => remove(v)} className="hover:text-orange">
                  <X size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-5">
          <p className="text-xs text-muted mb-2">{suggestedLabel}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions
              .filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()))
              .slice(0, 10)
              .map((s) => (
                <button
                  key={s}
                  onClick={() => add(s)}
                  className="text-sm px-3 py-1.5 rounded-full border border-white/10 text-warm/80 hover:border-orange/50 hover:text-warm transition-colors"
                >
                  + {s}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
