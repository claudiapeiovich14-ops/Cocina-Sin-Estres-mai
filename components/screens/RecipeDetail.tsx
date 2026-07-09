"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { ChefAIResult } from "../../lib/types";
import { Button } from "../ui/Button";

export function RecipeDetail({
  result,
  strings,
  onCopy,
  onContinue,
}: {
  result: ChefAIResult;
  strings: any;
  onCopy: (text: string) => void;
  onContinue: () => void;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function copyRecipe() {
    const lines = [
      result.localizedRecipeName,
      "",
      result.ingredients.map((i) => `- ${i.name} (${i.quantity})`).join("\n"),
      "",
      result.steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
    ];
    onCopy(lines.join("\n"));
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">{result.imageEmoji}</span>
        <h1 className="text-2xl font-extrabold text-warm">{result.localizedRecipeName}</h1>
      </div>
      <p className="text-muted text-sm mb-6">
        {result.cookingTime} · {result.servings} {strings.result.servings} · {result.difficulty}
      </p>

      <Section title={strings.ingredients.title}>
        <div className="flex flex-col gap-2">
          {result.ingredients.map((ing, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className="flex items-center gap-3 text-left rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors"
            >
              <span
                className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                  checked.has(i) ? "bg-orange border-orange" : "border-white/20"
                }`}
              >
                {checked.has(i) && <Check size={13} className="text-[#1A140A]" />}
              </span>
              <span className={`text-sm ${checked.has(i) ? "line-through text-muted" : "text-warm/90"}`}>
                {ing.name} <span className="text-muted">· {ing.quantity}</span>
              </span>
              {!ing.alreadyHave && <span className="ml-auto text-[10px] uppercase tracking-wide text-orange font-bold">+</span>}
            </button>
          ))}
        </div>
      </Section>

      <Section title={strings.result.stepsLabel}>
        <ol className="flex flex-col gap-3">
          {result.steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-warm/90">
              <span className="w-6 h-6 rounded-full bg-orange/15 text-orange font-bold text-xs flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </Section>

      {result.tips.length > 0 && (
        <Section title="Tips">
          <ul className="flex flex-col gap-2">
            {result.tips.map((tip, i) => (
              <li key={i} className="text-sm text-muted leading-snug">💡 {tip}</li>
            ))}
          </ul>
        </Section>
      )}

      <div className="flex flex-col gap-3 mt-4">
        <Button variant="secondary" onClick={copyRecipe}>{strings.actions.copyRecipe}</Button>
        <Button onClick={onContinue}>{strings.ui.continue} →</Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h2 className="text-xs font-bold uppercase tracking-wide text-muted mb-3">{title}</h2>
      {children}
    </div>
  );
}
