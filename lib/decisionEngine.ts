import { recipes, RecipeTemplate, Protein } from "./recipes";
import type { ChefAIInput, ChefAIResult, Ingredient, MissingIngredient, ShoppingListGroup, RejectReason, Lang, WeeklyPlan, WeeklyPlanDay } from "./types";
import { countries } from "./countries";

const FX: Record<string, number> = {
  ARS: 1050, USD: 1, EUR: 0.92, MXN: 18, BRL: 5.5, GBP: 0.79, CAD: 1.37,
  AUD: 1.53, COP: 4100, CLP: 950, MAD: 10, EGP: 49, INR: 84, JPY: 150,
};

const CATEGORY_LABEL: Record<Lang, Record<string, string>> = {
  es: { Carnes: "Carnes", Verduras: "Verduras", Lácteos: "Lácteos", Huevos: "Huevos", Pastas: "Almacén", Almacén: "Almacén", Frutas: "Frutas", Especias: "Almacén" },
  en: { Carnes: "Meat", Verduras: "Produce", Lácteos: "Dairy", Huevos: "Eggs", Pastas: "Pantry", Almacén: "Pantry", Frutas: "Produce", Especias: "Pantry" },
};

function peopleToServings(people: string): number {
  switch (people) {
    case "justMe": return 1;
    case "2": return 2;
    case "3-4": return 4;
    case "5plus": return 6;
    default: return 2;
  }
}

function timeToMinutes(time: string): number {
  switch (time) {
    case "10": return 10;
    case "15": return 15;
    case "20": return 20;
    case "30": return 30;
    case "45": return 45;
    case "more": return 999;
    case "surprise": return 999;
    default: return 999;
  }
}

interface ScoreOpts {
  excludeIds?: Set<string>;
  capTimeMinutes?: number;
  biasCheap?: boolean;
  biasHealthy?: boolean;
  biasLowCalorie?: boolean;
  biasProtein?: boolean;
  biasKidFriendly?: boolean;
  excludeProtein?: Protein;
  forceOnlyHave?: boolean;
  forceCanBuy?: boolean;
  randomize?: boolean;
}

function passesHardDietaryFilters(recipe: RecipeTemplate, restrictions: string[]): boolean {
  if (restrictions.includes("vegan") && !recipe.dietTags.includes("vegan")) return false;
  if (restrictions.includes("vegetarian") && !(recipe.dietTags.includes("vegan") || recipe.dietTags.includes("vegetarian"))) return false;
  if (restrictions.includes("glutenFree") && !recipe.dietTags.includes("glutenFree")) return false;
  if (restrictions.includes("dairyFree") && !recipe.dietTags.includes("dairyFree")) return false;
  return true;
}

function scoreRecipe(recipe: RecipeTemplate, input: ChefAIInput, opts: ScoreOpts): number {
  let score = 0;

  const maxTime = opts.capTimeMinutes ?? timeToMinutes(input.cookingTime);
  if (input.cookingTime !== "surprise") {
    if (recipe.timeMinutes <= maxTime) score += 14 - Math.max(0, maxTime - recipe.timeMinutes) * 0.1;
    else score -= (recipe.timeMinutes - maxTime) * 1.5;
  }

  const have = input.availableIngredients.map((i) => i.toLowerCase());
  let missingCount = 0;
  let matchCount = 0;
  for (const ing of recipe.ingredients) {
    const known = have.some((h) => ing.name.toLowerCase().includes(h) || h.includes(ing.name.toLowerCase()));
    if (known) matchCount += 1;
    else missingCount += 1;
  }
  score += matchCount * 3;

  const onlyHave = opts.forceOnlyHave || input.shoppingPreference === "onlyHave";
  const canBuy = opts.forceCanBuy || input.shoppingPreference === "canBuyFew";
  if (onlyHave) score -= missingCount * 9;
  else if (canBuy) score -= Math.max(0, missingCount - 4) * 6;
  else score -= missingCount * 1.5;

  if (input.mainGoal && recipe.goalTags.includes(input.mainGoal as any)) score += 12;
  if (opts.biasCheap && recipe.goalTags.includes("cheap")) score += 16;
  if (opts.biasHealthy && (recipe.goalTags.includes("healthy") || recipe.dietTags.includes("light"))) score += 16;
  if (opts.biasLowCalorie && recipe.baseCalories < 450) score += 16;
  if (opts.biasProtein && (recipe.dietTags.includes("highProtein") || recipe.goalTags.includes("protein"))) score += 16;
  if (opts.biasKidFriendly && recipe.dietTags.includes("kidFriendly")) score += 18;
  if (opts.excludeProtein && recipe.protein === opts.excludeProtein) score -= 100;

  const pref = input.foodPreference;
  if (pref && pref !== "surprise") {
    if (recipe.protein === pref) score += 10;
    if (recipe.cuisine === pref) score += 10;
    if (pref === "vegetarian" && (recipe.dietTags.includes("vegetarian") || recipe.dietTags.includes("vegan"))) score += 10;
    if (pref === "light" && recipe.dietTags.includes("light")) score += 10;
    if (pref === "comfort" && recipe.cuisine === "comfort") score += 10;
  }

  for (const r of input.dietaryRestrictions) {
    if (r === "none") continue;
    if (recipe.dietTags.includes(r as any)) score += 7;
  }

  if (input.hasChildren) {
    if (recipe.dietTags.includes("kidFriendly")) score += 6;
    else score -= 3;
  }

  if (input.people === "5plus" && recipe.baseServings >= 4) score += 3;

  const weather = input.weatherContext;
  if (weather === "hot" && (recipe.cuisine === "fresh" || recipe.dietTags.includes("light"))) score += 6;
  if (weather === "cold" && (recipe.cuisine === "comfort")) score += 6;
  if (weather === "rainy" && recipe.cuisine === "comfort") score += 5;
  if (weather === "humid" && recipe.dietTags.includes("light")) score += 5;
  if (weather === "sunny" && recipe.cuisine === "fresh") score += 4;

  // "El Método Cena Resuelta™": low energy means the user needs the path of
  // least resistance, not inspiration — bias hard toward fast + easy.
  if (input.energyLevel === "low") {
    if (recipe.goalTags.includes("fast") || recipe.goalTags.includes("easy")) score += 10;
    if (recipe.difficulty === "Easy") score += 6;
    if (recipe.timeMinutes <= 20) score += 6;
  } else if (input.energyLevel === "high") {
    if (recipe.difficulty !== "Easy") score += 4;
  }

  if (opts.randomize) score += Math.random() * 20;
  else score += Math.random() * 2; // tiny jitter so ties don't always resolve the same way

  return score;
}

function pickRecipe(input: ChefAIInput, opts: ScoreOpts = {}): RecipeTemplate {
  const restrictions = input.dietaryRestrictions ?? [];
  let candidates = recipes.filter((r) => !opts.excludeIds?.has(r.id) && passesHardDietaryFilters(r, restrictions));
  if (candidates.length === 0) candidates = recipes.filter((r) => !opts.excludeIds?.has(r.id));
  if (candidates.length === 0) candidates = recipes;

  const scored = candidates.map((r) => ({ r, s: scoreRecipe(r, input, opts) }));
  scored.sort((a, b) => b.s - a.s);
  return scored[0].r;
}

function buildIngredients(recipe: RecipeTemplate, available: string[]): { ingredients: Ingredient[]; missing: MissingIngredient[] } {
  const have = available.map((i) => i.toLowerCase());
  const ingredients: Ingredient[] = [];
  const missing: MissingIngredient[] = [];
  for (const ing of recipe.ingredients) {
    const alreadyHave = have.some((h) => ing.name.toLowerCase().includes(h) || h.includes(ing.name.toLowerCase()));
    ingredients.push({ name: ing.name, quantity: ing.qty, alreadyHave, category: ing.category });
    if (!alreadyHave) {
      missing.push({ name: ing.name, quantity: ing.qty, category: ing.category, estimatedPrice: undefined });
    }
  }
  return { ingredients, missing };
}

function buildShoppingList(missing: MissingIngredient[], lang: Lang): ShoppingListGroup[] {
  const groups = new Map<string, string[]>();
  for (const m of missing) {
    const label = CATEGORY_LABEL[lang][m.category] ?? m.category;
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(`${m.name} (${m.quantity})`);
  }
  return Array.from(groups.entries()).map(([category, items]) => ({ category, items }));
}

function currencyFor(countryCode: string): { currency: string; rate: number } {
  const c = countries.find((c) => c.code === countryCode);
  const currency = c?.currency ?? "USD";
  return { currency, rate: FX[currency] ?? 1 };
}

function formatMoney(amount: number, currency: string): string {
  const rounded = currency === "JPY" || currency === "COP" || currency === "ARS" ? Math.round(amount) : Math.round(amount * 100) / 100;
  return `${currency} ${rounded.toLocaleString()}`;
}

function buildWhySelected(recipe: RecipeTemplate, input: ChefAIInput, missingCount: number, lang: Lang): string[] {
  const reasons: string[] = [];
  const time = timeToMinutes(input.cookingTime);
  const has = (arr: string[], v: string) => arr.includes(v);

  const L = lang === "es"
    ? {
        haveMost: "Ya tenés la mayoría de los ingredientes.",
        fitsTime: "Se ajusta al tiempo que tenés disponible.",
        familySize: "Funciona para la cantidad de personas de hoy.",
        matchesGoal: "Coincide con lo más importante para vos hoy.",
        respectsDiet: "Respeta tus restricciones alimentarias.",
        buyFew: (n: number) => `Solo necesitás comprar ${n} ${n === 1 ? "ingrediente" : "ingredientes"}.`,
        savesMoney: "Sale más barato que pedir delivery.",
        kidFriendly: "Es una opción pensada para que coman los chicos también.",
      }
    : {
        haveMost: "You already have most of the ingredients.",
        fitsTime: "It fits the time you have available.",
        familySize: "It works for today's group size.",
        matchesGoal: "It matches what matters most to you today.",
        respectsDiet: "It respects your dietary restrictions.",
        buyFew: (n: number) => `You only need to buy ${n} ${n === 1 ? "item" : "items"}.`,
        savesMoney: "It's cheaper than ordering delivery.",
        kidFriendly: "It's a kid-friendly option for the whole family.",
      };

  if (missingCount <= 1) reasons.push(L.haveMost);
  if (recipe.timeMinutes <= time) reasons.push(L.fitsTime);
  reasons.push(L.familySize);
  if (input.mainGoal && has(recipe.goalTags as unknown as string[], input.mainGoal)) reasons.push(L.matchesGoal);
  if (input.dietaryRestrictions.some((r) => r !== "none" && recipe.dietTags.includes(r as any))) reasons.push(L.respectsDiet);
  if (missingCount >= 1 && missingCount <= 3) reasons.push(L.buyFew(missingCount));
  if (input.hasChildren && recipe.dietTags.includes("kidFriendly")) reasons.push(L.kidFriendly);
  reasons.push(L.savesMoney);

  return reasons.slice(0, 5);
}

export function buildResult(recipe: RecipeTemplate, input: ChefAIInput): ChefAIResult {
  const lang = input.language;
  const targetServings = peopleToServings(input.people);
  const scale = targetServings / recipe.baseServings;
  const { currency, rate } = currencyFor(input.cookingCountry);

  const { ingredients, missing } = buildIngredients(recipe, input.availableIngredients);
  const shoppingList = buildShoppingList(missing, lang);

  const scaledCostUSD = recipe.baseCostUSD * Math.max(0.6, scale);
  const estimatedCost = formatMoney(scaledCostUSD * rate, currency);

  const deliveryMultiplier = 2.6 + Math.random() * 0.6;
  const deliveryCostUSD = scaledCostUSD * deliveryMultiplier;
  const savingsTodayUSD = deliveryCostUSD - scaledCostUSD;

  let nutritionScore = 68;
  if (recipe.dietTags.includes("highProtein")) nutritionScore += 10;
  if (recipe.dietTags.includes("light")) nutritionScore += 8;
  if (recipe.dietTags.includes("vegan") || recipe.dietTags.includes("vegetarian")) nutritionScore += 6;
  if (recipe.baseCalories > 550) nutritionScore -= 8;
  nutritionScore = Math.max(40, Math.min(98, nutritionScore));

  const proteinG = recipe.dietTags.includes("highProtein") ? Math.round(recipe.baseCalories * 0.32 / 4) : Math.round(recipe.baseCalories * 0.2 / 4);
  const fatG = Math.round(recipe.baseCalories * 0.3 / 9);
  const carbsG = Math.max(10, Math.round((recipe.baseCalories - proteinG * 4 - fatG * 9) / 4));

  const missingWithPrices: MissingIngredient[] = missing.map((m) => ({
    ...m,
    estimatedPrice: formatMoney((1 + Math.random() * 2.5) * rate, currency),
  }));

  return {
    recipeName: recipe.name.en,
    localizedRecipeName: recipe.name[lang],
    description: recipe.description[lang],
    imageEmoji: recipe.emoji,
    cookingTime: `${recipe.timeMinutes} min`,
    difficulty: recipe.difficulty,
    servings: targetServings,
    estimatedCost,
    currency,
    caloriesPerServing: recipe.baseCalories,
    nutritionScore,
    macros: { protein: `${proteinG}g`, carbs: `${carbsG}g`, fat: `${fatG}g` },
    whySelected: buildWhySelected(recipe, input, missing.length, lang),
    ingredients,
    missingIngredients: missingWithPrices,
    shoppingList,
    steps: recipe.steps[lang],
    tips: recipe.tips[lang],
    deliverySavings: {
      cookingCost: formatMoney(scaledCostUSD * rate, currency),
      deliveryCost: formatMoney(deliveryCostUSD * rate, currency),
      savingsToday: formatMoney(savingsTodayUSD * rate, currency),
      monthlySavings: formatMoney(savingsTodayUSD * rate * 18, currency),
    },
  };
}

export function generateRecipe(input: ChefAIInput, excludeIds: Set<string> = new Set()): { recipeId: string; result: ChefAIResult } {
  const randomize = input.mainGoal === "" && input.foodPreference === "surprise";
  const recipe = pickRecipe(input, { excludeIds, randomize });
  return { recipeId: recipe.id, result: buildResult(recipe, input) };
}

export function regenerate(input: ChefAIInput, excludeIds: Set<string>, previousRecipeId: string, reason: RejectReason): { recipeId: string; result: ChefAIResult } {
  const prev = recipes.find((r) => r.id === previousRecipeId);
  const opts: ScoreOpts = { excludeIds: new Set([...excludeIds, previousRecipeId]) };
  const patchedInput: ChefAIInput = { ...input };

  switch (reason) {
    case "faster":
      opts.capTimeMinutes = Math.min(timeToMinutes(input.cookingTime), 15);
      break;
    case "cheaper":
      opts.biasCheap = true;
      break;
    case "healthier":
      opts.biasHealthy = true;
      break;
    case "moreProtein":
      opts.biasProtein = true;
      break;
    case "lowerCalories":
      opts.biasLowCalorie = true;
      break;
    case "differentProtein":
      if (prev) opts.excludeProtein = prev.protein;
      break;
    case "sameIngredients":
      opts.forceOnlyHave = true;
      break;
    case "buyMore":
      opts.forceCanBuy = true;
      break;
    case "kidFriendly":
      opts.biasKidFriendly = true;
      patchedInput.hasChildren = true;
      break;
    case "surpriseAgain":
      opts.randomize = true;
      break;
  }

  const recipe = pickRecipe(patchedInput, opts);
  return { recipeId: recipe.id, result: buildResult(recipe, patchedInput) };
}

export function generateWeeklyPlan(input: ChefAIInput, dayLabels: string[]): WeeklyPlan {
  const excludeIds = new Set<string>();
  const days: WeeklyPlanDay[] = [];

  for (const label of dayLabels) {
    const recipe = pickRecipe(input, { excludeIds });
    excludeIds.add(recipe.id);
    days.push({ label, recipeId: recipe.id, result: buildResult(recipe, input) });
  }

  const lang = input.language;
  const groups = new Map<string, Set<string>>();
  for (const day of days) {
    for (const m of day.result.missingIngredients) {
      const label = CATEGORY_LABEL[lang][m.category] ?? m.category;
      if (!groups.has(label)) groups.set(label, new Set());
      groups.get(label)!.add(`${m.name} (${m.quantity})`);
    }
  }
  const shoppingList: ShoppingListGroup[] = Array.from(groups.entries()).map(([category, items]) => ({
    category,
    items: Array.from(items),
  }));

  return { days, shoppingList };
}
