// Canonical keys, index-aligned with the label arrays in lib/i18n/strings.ts
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
