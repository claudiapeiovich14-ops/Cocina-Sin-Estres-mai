export type Lang = "es" | "en";

export type WeatherContext =
  | "hot"
  | "cold"
  | "rainy"
  | "sunny"
  | "humid"
  | "stormy"
  | "none";

export type Mode =
  | "solve"
  | "useWhatIHave"
  | "adaptFavorite"
  | "surprise"
  | "shoppingList"
  | "calories"
  | "savings";

export interface ChefAIInput {
  language: Lang;
  cookingCountry: string;
  selectedMode: Mode;
  people: string;
  hasChildren: boolean;
  childrenAges: string[];
  cookingTime: string;
  availableIngredients: string[];
  shoppingPreference: string;
  dietaryRestrictions: string[];
  foodPreference: string;
  mainGoal: string;
  favoriteRecipeText?: string;
  weatherContext?: WeatherContext;
}

export interface Ingredient {
  name: string;
  quantity: string;
  alreadyHave: boolean;
  category: string;
}

export interface MissingIngredient {
  name: string;
  quantity: string;
  category: string;
  estimatedPrice?: string;
}

export interface ShoppingListGroup {
  category: string;
  items: string[];
}

export interface Macros {
  protein: string;
  carbs: string;
  fat: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
}

export interface DeliverySavings {
  cookingCost: string;
  deliveryCost: string;
  savingsToday: string;
  monthlySavings: string;
}

export interface ChefAIResult {
  recipeName: string;
  localizedRecipeName?: string;
  description: string;
  imageEmoji: string;
  cookingTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  estimatedCost: string;
  currency: string;
  caloriesPerServing?: number;
  nutritionScore?: number;
  macros?: Macros;
  whySelected: string[];
  ingredients: Ingredient[];
  missingIngredients: MissingIngredient[];
  shoppingList: ShoppingListGroup[];
  steps: string[];
  tips: string[];
  deliverySavings?: DeliverySavings;
  alternativeSuggestion?: string;
}

export type RejectReason =
  | "faster"
  | "cheaper"
  | "healthier"
  | "moreProtein"
  | "lowerCalories"
  | "differentProtein"
  | "sameIngredients"
  | "buyMore"
  | "kidFriendly"
  | "surpriseAgain";
