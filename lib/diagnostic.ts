import type { DiagnosticProfileKey } from "./types";

const Q1_WEIGHTS: Record<string, Partial<Record<DiagnosticProfileKey, number>>> = {
  noSeQueCocinar: { improvisadora: 2 },
  tengoComidaNoIdeas: { improvisadora: 1, repetidora: 1 },
  siempreLoMismo: { repetidora: 2 },
  delivery: { delivery: 2 },
  compraSinPlan: { compradora: 2 },
};

const Q2_WEIGHTS: Record<string, Partial<Record<DiagnosticProfileKey, number>>> = {
  zero: { improvisadora: 1, delivery: 1 },
  some: { repetidora: 1 },
  depends: { compradora: 1 },
  likesCookingNeedsOrder: { organizada: 2 },
};

const Q3_WEIGHTS: Record<string, Partial<Record<DiagnosticProfileKey, number>>> = {
  quickIdeas: { improvisadora: 1 },
  weeklyMenu: { organizada: 1, compradora: 1 },
  shoppingList: { compradora: 2 },
  eatBetter: { repetidora: 1 },
  saveTimeMoney: { delivery: 1 },
};

const PROFILE_PRIORITY: DiagnosticProfileKey[] = ["improvisadora", "delivery", "compradora", "repetidora", "organizada"];

export function computeDiagnosticProfile(q1: string, q2: string, q3: string): DiagnosticProfileKey {
  const scores: Record<DiagnosticProfileKey, number> = {
    improvisadora: 0, repetidora: 0, compradora: 0, delivery: 0, organizada: 0,
  };

  for (const weights of [Q1_WEIGHTS[q1], Q2_WEIGHTS[q2], Q3_WEIGHTS[q3]]) {
    if (!weights) continue;
    for (const key of Object.keys(weights) as DiagnosticProfileKey[]) {
      scores[key] += weights[key] ?? 0;
    }
  }

  let best: DiagnosticProfileKey = "improvisadora";
  let bestScore = -1;
  for (const key of PROFILE_PRIORITY) {
    if (scores[key] > bestScore) {
      bestScore = scores[key];
      best = key;
    }
  }
  return best;
}
