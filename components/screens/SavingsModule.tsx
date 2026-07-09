"use client";

import type { ChefAIResult } from "../../lib/types";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { Button } from "../ui/Button";

function parseMoney(formatted: string): { prefix: string; value: number } {
  const match = formatted.match(/^([A-Za-z]*)\s*([\d.,]+)$/);
  if (!match) return { prefix: "", value: 0 };
  const value = parseFloat(match[2].replace(/,/g, ""));
  return { prefix: match[1], value: Number.isFinite(value) ? value : 0 };
}

export function SavingsModule({
  result,
  strings,
  onBack,
}: {
  result: ChefAIResult;
  strings: any;
  onBack: () => void;
}) {
  const savings = result.deliverySavings;
  if (!savings) return null;

  const cooking = parseMoney(savings.cookingCost);
  const delivery = parseMoney(savings.deliveryCost);
  const today = parseMoney(savings.savingsToday);
  const monthly = parseMoney(savings.monthlySavings);

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-extrabold text-warm mb-1">{strings.savingsModule.title}</h1>
      <p className="text-muted text-xs mb-6">{strings.savingsModule.disclaimer}</p>

      <div className="flex flex-col gap-3 mb-6">
        <Row label={strings.savingsModule.cooking} prefix={cooking.prefix} value={cooking.value} />
        <Row label={strings.savingsModule.delivery} prefix={delivery.prefix} value={delivery.value} muted />
      </div>

      <div className="glass rounded-2xl px-5 py-6 text-center mb-4">
        <p className="text-xs text-muted mb-1">{strings.savingsModule.todaySavings}</p>
        <p className="text-3xl font-extrabold text-success">
          {today.prefix} <AnimatedNumber value={today.value} />
        </p>
      </div>

      <div className="glass rounded-2xl px-5 py-4 text-center mb-8">
        <p className="text-xs text-muted mb-1">{strings.savingsModule.monthly}</p>
        <p className="text-xl font-extrabold text-warm">
          {monthly.prefix} <AnimatedNumber value={monthly.value} />
        </p>
      </div>

      <Button variant="secondary" onClick={onBack}>{strings.ui.back}</Button>
    </div>
  );
}

function Row({ label, prefix, value, muted }: { label: string; prefix: string; value: number; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between px-1">
      <span className="text-sm text-muted">{label}</span>
      <span className={`font-bold ${muted ? "text-muted" : "text-warm"}`}>
        {prefix} <AnimatedNumber value={value} />
      </span>
    </div>
  );
}
