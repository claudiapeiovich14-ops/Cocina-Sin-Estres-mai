"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import type { ChefAIResult } from "../lib/types";
import { Button } from "./Button";
import { CircularProgress } from "./CircularProgress";
import { Confetti } from "./Confetti";

export function RecipeDetail({
  result,
  strings,
  onCopy,
  onContinue,
  onSaveFavorite,
  isFavorite,
  celebrate = false,
  elapsedSeconds,
  onDislike,
  onAnother,
  onShoppingList,
  onSavings,
}: {
  result: ChefAIResult;
  strings: any;
  onCopy: (text: string) => void;
  onContinue?: () => void;
  onSaveFavorite?: () => void;
  isFavorite?: boolean;
  celebrate?: boolean;
  elapsedSeconds?: number | null;
  onDislike?: () => void;
  onAnother?: () => void;
  onShoppingList?: () => void;
  onSavings?: () => void;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!celebrate || elapsedSeconds == null) return;
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrate, elapsedSeconds, result.recipeName]);

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
      {showConfetti && <Confetti />}

      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">{result.imageEmoji}</span>
        <h1 className="text-2xl font-extrabold text-warm">{result.localizedRecipeName}</h1>
      </div>
      <p className="text-muted text-sm mb-4">
        {result.cookingTime} · {result.servings} {strings.result.servings} · {result.difficulty}
      </p>

      {celebrate && (
        <div className="glass rounded-2xl px-4 py-3.5 mb-5">
          <p className="text-warm font-bold mb-0.5">{strings.result.congrats}</p>
          {elapsedSeconds != null && (
            <>
              <p className="text-sm text-warm/80">{strings.result.solvedIn.replace("{s}", String(elapsedSeconds))}</p>
              <p className="text-xs text-muted mt-1">{strings.result.solvedInFooter}</p>
            </>
          )}
        </div>
      )}

      <p className="text-warm/80 text-sm mb-5">{result.description}</p>

      {celebrate && result.whySelected.length > 0 && (
        <Section title={strings.why.title}>
          <div className="flex flex-col gap-2">
            {result.whySelected.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-warm/90">
                <Sparkles size={14} className="text-orange mt-0.5 flex-shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Stat label={strings.result.cost} value={result.estimatedCost} />
        <Stat label={result.caloriesPerServing ? strings.result.calories : ""} value={result.caloriesPerServing ? String(result.caloriesPerServing) : ""} />
      </div>

      {(result.nutritionScore != null || result.macros) && (
        <Section title={strings.nutrition.score}>
          <div className="flex items-center gap-6">
            {result.nutritionScore != null && (
              <CircularProgress value={result.nutritionScore} label={strings.nutrition.score} size={84} />
            )}
            {result.macros && (
              <div className="grid grid-cols-3 gap-2 flex-1">
                <Macro label={strings.nutrition.protein} value={result.macros.protein} />
                <Macro label={strings.nutrition.carbs} value={result.macros.carbs} />
                <Macro label={strings.nutrition.fat} value={result.macros.fat} />
              </div>
            )}
          </div>
        </Section>
      )}

      {result.healthBenefits.length > 0 && (
        <Section title={strings.nutrition.benefitsTitle}>
          <ul className="flex flex-col gap-2">
            {result.healthBenefits.map((b, i) => (
              <li key={i} className="text-sm text-warm/90 flex items-start gap-2.5">
                <span className="mt-0.5">🥗</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={strings.pairing.title}>
        <div className="flex flex-col gap-2">
          <PairingRow icon="🥗" label={strings.pairing.side} value={result.pairing.side} />
          <PairingRow icon="🍰" label={strings.pairing.dessert} value={result.pairing.dessert} />
          <PairingRow icon="🍷" label={strings.pairing.drink} value={result.pairing.drink} />
        </div>
      </Section>

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
        {onSaveFavorite && (
          <Button variant="secondary" onClick={onSaveFavorite} disabled={isFavorite}>
            {isFavorite ? strings.result.savedFavorite : strings.result.saveFavorite}
          </Button>
        )}
        <Button variant="secondary" onClick={copyRecipe}>{strings.actions.copyRecipe}</Button>
        {onShoppingList && <Button variant="secondary" onClick={onShoppingList}>🛒 {strings.actions.shoppingList}</Button>}
        {onSavings && <Button variant="secondary" onClick={onSavings}>💰 {strings.actions.savings}</Button>}
        {onContinue && <Button onClick={onContinue}>{strings.ui.continue} →</Button>}
        {(onDislike || onAnother) && (
          <div className="flex gap-3">
            {onDislike && <Button variant="secondary" onClick={onDislike} className="flex-1">{strings.result.dislike}</Button>}
            {onAnother && <Button variant="secondary" onClick={onAnother} className="flex-1">{strings.result.another}</Button>}
          </div>
        )}
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

function Stat({ label, value }: { label: string; value: string }) {
  if (!label || !value) return <div />;
  return (
    <div className="glass rounded-2xl px-4 py-3 text-left">
      <p className="text-[11px] text-muted uppercase tracking-wide">{label}</p>
      <p className="text-warm font-bold">{value}</p>
    </div>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl px-3 py-3 text-center">
      <p className="text-warm font-extrabold text-base">{value}</p>
      <p className="text-[10px] text-muted mt-1">{label}</p>
    </div>
  );
}

function PairingRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl px-4 py-3 flex items-start gap-3">
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[11px] text-muted uppercase tracking-wide">{label}</p>
        <p className="text-warm/90 text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
