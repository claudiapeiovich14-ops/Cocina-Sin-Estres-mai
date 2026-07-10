import type { ChefAIInput, ChefAIResult, Ingredient, Lang } from "./types";

// Frontend-only mock adapter. A real AI API adapter can replace the body of
// adaptFavoriteRecipe / generateFromInput later without changing the call sites.

function looksLikeIngredientLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return /\d/.test(trimmed) || /,/.test(trimmed) || trimmed.length < 40;
}

function looksLikeStepLine(line: string): boolean {
  const trimmed = line.trim().toLowerCase();
  return /^(\d+[.)]|paso|step)/.test(trimmed) || trimmed.length > 40;
}

function extractRecipeParts(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const title = lines[0]?.slice(0, 60) ?? "Tu receta";
  const ingredientLines = lines.filter((l, i) => i > 0 && looksLikeIngredientLine(l) && !looksLikeStepLine(l)).slice(0, 12);
  const stepLines = lines.filter((l) => looksLikeStepLine(l)).slice(0, 10);
  return { title, ingredientLines, stepLines };
}

const ADAPT_LABEL: Record<Lang, Record<string, string>> = {
  es: {
    faster: "más rápida", healthier: "más sana", cheaper: "más barata", moreProtein: "con más proteína",
    lowerCalories: "con menos calorías", kidFriendly: "apta para chicos", glutenFree: "sin gluten",
    dairyFree: "sin lácteos", useWhatIHave: "con lo que ya tenés", adaptFamilySize: "para la familia de hoy",
  },
  en: {
    faster: "faster", healthier: "healthier", cheaper: "cheaper", moreProtein: "with more protein",
    lowerCalories: "lower in calories", kidFriendly: "kid-friendly", glutenFree: "gluten-free",
    dairyFree: "dairy-free", useWhatIHave: "using what you already have", adaptFamilySize: "sized for today's family",
  },
};

export function adaptFavoriteRecipe(recipeText: string, adaptationKeys: string[], input: ChefAIInput): ChefAIResult {
  const lang = input.language;
  const { title, ingredientLines, stepLines } = extractRecipeParts(recipeText);
  const have = input.availableIngredients.map((i) => i.toLowerCase());

  const ingredients: Ingredient[] = ingredientLines.map((line) => ({
    name: line,
    quantity: "",
    alreadyHave: have.some((h) => line.toLowerCase().includes(h)),
    category: "Otro",
  }));

  const missingIngredients = ingredients
    .filter((i) => !i.alreadyHave)
    .map((i) => ({ name: i.name, quantity: i.quantity, category: i.category }));

  const labels = adaptationKeys.map((k) => ADAPT_LABEL[lang][k] ?? k);
  const description = lang === "es"
    ? `Adapté tu receta para que sea ${labels.join(", ")}.`
    : `I adapted your recipe to make it ${labels.join(", ")}.`;

  const whySelected = lang === "es"
    ? [
        `La ajusté para que sea ${labels.join(" y ")}.`,
        ingredients.length > 0 ? "Reconocí los ingredientes que mencionaste." : "Trabajé con la información que me diste.",
        "Mantuve la esencia de tu receta original.",
      ]
    : [
        `I adjusted it to be ${labels.join(" and ")}.`,
        ingredients.length > 0 ? "I recognized the ingredients you mentioned." : "I worked with the info you gave me.",
        "I kept the spirit of your original recipe.",
      ];

  const steps = stepLines.length > 0
    ? stepLines
    : lang === "es"
      ? ["Preparé los pasos según lo que me compartiste.", "Ajustá tiempos de cocción a tu gusto.", "Serví y disfrutá."]
      : ["I put together the steps based on what you shared.", "Adjust cooking times to your taste.", "Serve and enjoy."];

  return {
    recipeName: title,
    localizedRecipeName: title,
    description,
    imageEmoji: "❤️",
    cookingTime: adaptationKeys.includes("faster") ? "15 min" : "25 min",
    difficulty: "Medium",
    servings: input.people === "5plus" ? 6 : input.people === "3-4" ? 4 : input.people === "2" ? 2 : 1,
    estimatedCost: lang === "es" ? "Estimado" : "Estimated",
    currency: "",
    caloriesPerServing: adaptationKeys.includes("lowerCalories") ? 380 : 520,
    nutritionScore: adaptationKeys.includes("healthier") ? 82 : 70,
    macros: { protein: "24g", carbs: "48g", fat: "16g" },
    healthBenefits: lang === "es"
      ? ["Mantuvimos el balance de nutrientes de tu receta original."]
      : ["We kept the nutrient balance of your original recipe."],
    pairing: {
      side: lang === "es" ? "Una ensalada verde simple." : "A simple green salad.",
      dessert: lang === "es" ? "Fruta fresca de estación." : "Fresh seasonal fruit.",
      drink: lang === "es" ? "Agua saborizada o el vino que prefieras." : "Infused water or a wine of your choice.",
    },
    whySelected,
    ingredients,
    missingIngredients,
    shoppingList: missingIngredients.length
      ? [{ category: lang === "es" ? "Otro" : "Other", items: missingIngredients.map((m) => m.name) }]
      : [],
    steps,
    tips: lang === "es"
      ? ["Guardá esta versión adaptada para la próxima vez."]
      : ["Save this adapted version for next time."],
  };
}
