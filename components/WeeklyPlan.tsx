"use client";

import type { WeeklyPlan as WeeklyPlanType } from "../lib/types";
import { Button } from "./Button";

export function WeeklyPlanView({
  plan,
  title,
  subtitle,
  shoppingListLabel,
  viewDayLabel,
  onViewDay,
  onViewShoppingList,
}: {
  plan: WeeklyPlanType;
  title: string;
  subtitle: string;
  shoppingListLabel: string;
  viewDayLabel: string;
  onViewDay: (index: number) => void;
  onViewShoppingList: () => void;
}) {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-extrabold text-warm mb-1">{title}</h1>
      <p className="text-muted text-sm mb-6">{subtitle}</p>

      <div className="flex flex-col gap-3 mb-6">
        {plan.days.map((day, i) => (
          <button
            key={i}
            onClick={() => onViewDay(i)}
            className="w-full text-left rounded-2xl border border-black/8 bg-surface hover:border-orange/40 transition-colors px-4 py-3.5 flex items-center gap-3"
          >
            <span className="text-2xl">{day.result.imageEmoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-olive uppercase tracking-wide">{day.label}</p>
              <p className="font-semibold text-warm/90 truncate">{day.result.localizedRecipeName}</p>
            </div>
            <span className="text-muted text-xs flex-shrink-0">{day.result.cookingTime}</span>
          </button>
        ))}
      </div>

      <Button onClick={onViewShoppingList}>🛒 {shoppingListLabel}</Button>
    </div>
  );
}
