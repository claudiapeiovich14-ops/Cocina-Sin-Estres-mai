// Canonical keys, index-aligned with the label arrays in lib/strings.ts
// This keeps the decision engine language-agnostic: components display strings.xxx[i],
// but store options.xxxKeys[i] in ChefAIInput.

export const peopleKeys = ["justMe", "2", "3-4", "5plus"] as const;
export const timeKeys = ["15", "20", "30", "45", "more", "surprise"] as const;

export const dietaryKeys = [
  "none", "vegetarian", "vegan", "glutenFree", "dairyFree",
  "lowSodium", "diabetesFriendly", "highProtein", "lowCarb", "kidFriendly", "light",
] as const;

export const preferenceKeys = [
  "chicken", "beef", "fish", "pasta", "vegetarian", "light",
  "comfort", "mexican", "mediterranean", "asian", "surprise",
] as const;

export const goalKeys = [
  "fast", "cheap", "healthy", "useWhatIHave", "protein", "lowCalorie", "easy",
] as const;

export const shoppingPrefKeys = ["onlyHave", "canBuyFew", "noPreference"] as const;

export const childrenAgesKeys = ["0-2", "3-5", "6-9", "10-14", "15+"] as const;

export const adaptOptionKeys = [
  "faster", "healthier", "cheaper", "moreProtein", "lowerCalories",
  "kidFriendly", "glutenFree", "dairyFree", "useWhatIHave", "adaptFamilySize",
] as const;

// Diagnostic quiz — index-aligned with lib/strings.ts diagnostic.q1/q2/q3 options
export const diagnosticQ1Keys = [
  "noSeQueCocinar", "tengoComidaNoIdeas", "siempreLoMismo", "delivery", "compraSinPlan",
] as const;

export const diagnosticQ2Keys = ["zero", "some", "depends", "likesCookingNeedsOrder"] as const;

export const diagnosticQ3Keys = ["quickIdeas", "weeklyMenu", "shoppingList", "eatBetter", "saveTimeMoney"] as const;

// El Método Cena Resuelta™ — quick 3-step flow
export const energyKeys = ["low", "medium", "high"] as const;
export const methodTimeKeys = ["10", "20", "30"] as const;
export const methodIngredientKeys = ["chicken", "beef", "eggs", "vegetables", "riceOrPasta", "whateverIHave"] as const;
