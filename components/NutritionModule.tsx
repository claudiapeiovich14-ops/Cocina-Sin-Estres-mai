"use client";

import type { ChefAIResult } from "../lib/types";
import { CircularProgress } from "./CircularProgress";
import { Button } from "./Button";

export function NutritionModule({
  result,
  strings,
  onBack,
}: {
  result: ChefAIResult;
  strings: any;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-extrabold text-warm mb-1">{strings.nutrition.title}</h1>
      <p className="text-muted text-xs mb-6">{strings.nutrition.disclaimer}</p>

      <div className="grid grid-cols-2 gap-6 mb-8 justify-items-center">
        <CircularProgress value={result.nutritionScore ?? 70} label={strings.nutrition.score} size={104} />
        <div className="flex flex-col items-center justify-center">
          <p className="text-4xl font-extrabold text-warm">{result.caloriesPerServing}</p>
          <p className="text-xs text-muted mt-1">{strings.result.calories}</p>
        </div>
      </div>

      {result.macros && (
        <div className="grid grid-cols-3 gap-3">
          <Macro label={strings.nutrition.protein} value={result.macros.protein} />
          <Macro label={strings.nutrition.carbs} value={result.macros.carbs} />
          <Macro label={strings.nutrition.fat} value={result.macros.fat} />
        </div>
      )}

      <Button variant="secondary" onClick={onBack} className="mt-8">
        {strings.ui.back}
      </Button>
    </div>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl px-3 py-4 text-center">
      <p className="text-warm font-extrabold text-lg">{value}</p>
      <p className="text-[11px] text-muted mt-1">{label}</p>
    </div>
  );
}
