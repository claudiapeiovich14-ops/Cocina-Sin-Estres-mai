export interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  flag: string;
}

export const countries: CountryInfo[] = [
  { code: "AR", name: "Argentina", currency: "ARS", flag: "🇦🇷" },
  { code: "US", name: "United States", currency: "USD", flag: "🇺🇸" },
  { code: "ES", name: "España", currency: "EUR", flag: "🇪🇸" },
  { code: "MX", name: "México", currency: "MXN", flag: "🇲🇽" },
  { code: "BR", name: "Brasil", currency: "BRL", flag: "🇧🇷" },
  { code: "IT", name: "Italia", currency: "EUR", flag: "🇮🇹" },
  { code: "FR", name: "Francia", currency: "EUR", flag: "🇫🇷" },
  { code: "DE", name: "Alemania", currency: "EUR", flag: "🇩🇪" },
  { code: "PT", name: "Portugal", currency: "EUR", flag: "🇵🇹" },
  { code: "GB", name: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { code: "CA", name: "Canada", currency: "CAD", flag: "🇨🇦" },
  { code: "AU", name: "Australia", currency: "AUD", flag: "🇦🇺" },
  { code: "NL", name: "Netherlands", currency: "EUR", flag: "🇳🇱" },
  { code: "CO", name: "Colombia", currency: "COP", flag: "🇨🇴" },
  { code: "CL", name: "Chile", currency: "CLP", flag: "🇨🇱" },
  { code: "MA", name: "Morocco", currency: "MAD", flag: "🇲🇦" },
  { code: "EG", name: "Egypt", currency: "EGP", flag: "🇪🇬" },
  { code: "IN", name: "India", currency: "INR", flag: "🇮🇳" },
  { code: "JP", name: "Japan", currency: "JPY", flag: "🇯🇵" },
  { code: "OTHER", name: "Otro / Other", currency: "USD", flag: "🌍" },
];

export const ingredientSuggestions: Record<string, string[]> = {
  AR: ["Pollo", "Arroz", "Tomate", "Cebolla", "Papa", "Queso", "Huevos", "Zapallito", "Fideos", "Lentejas", "Carne picada", "Atún"],
  US: ["Chicken", "Rice", "Tomatoes", "Onions", "Potatoes", "Cheese", "Eggs", "Pasta", "Zucchini", "Ground beef", "Black beans", "Canned tuna"],
  ES: ["Pollo", "Arroz", "Tomate", "Cebolla", "Patata", "Queso", "Huevos", "Calabacín", "Pasta", "Garbanzos", "Aceite de oliva", "Jamón"],
  MX: ["Pollo", "Arroz", "Jitomate", "Cebolla", "Papa", "Queso", "Huevo", "Calabacita", "Frijoles", "Tortillas", "Chile", "Aguacate"],
  BR: ["Frango", "Arroz", "Tomate", "Cebola", "Batata", "Queijo", "Ovos", "Abobrinha", "Feijão", "Macarrão", "Farinha", "Mandioca"],
  IT: ["Pasta", "Tomate", "Albahaca", "Mozzarella", "Zapallito", "Pollo", "Aceite de oliva", "Parmesano", "Huevos"],
  FR: ["Poulet", "Riz", "Tomate", "Oignon", "Pomme de terre", "Fromage", "Œufs", "Courgette", "Pâtes", "Beurre"],
  DE: ["Hähnchen", "Reis", "Tomate", "Zwiebel", "Kartoffel", "Käse", "Eier", "Zucchini", "Nudeln"],
  PT: ["Frango", "Arroz", "Tomate", "Cebola", "Batata", "Queijo", "Ovos", "Curgete", "Massa", "Bacalhau"],
  GB: ["Chicken", "Rice", "Tomatoes", "Onions", "Potatoes", "Cheese", "Eggs", "Courgette", "Pasta", "Baked beans"],
  CA: ["Chicken", "Rice", "Tomatoes", "Onions", "Potatoes", "Cheese", "Eggs", "Pasta", "Maple syrup"],
  AU: ["Chicken", "Rice", "Tomatoes", "Onions", "Potatoes", "Cheese", "Eggs", "Pasta", "Zucchini"],
  NL: ["Kip", "Rijst", "Tomaat", "Ui", "Aardappel", "Kaas", "Eieren", "Courgette", "Pasta"],
  CO: ["Pollo", "Arroz", "Tomate", "Cebolla", "Papa", "Queso", "Huevos", "Plátano", "Fríjoles", "Aguacate"],
  CL: ["Pollo", "Arroz", "Tomate", "Cebolla", "Papa", "Queso", "Huevos", "Palta", "Porotos", "Fideos"],
  MA: ["Couscous", "Garbanzos", "Pollo", "Zanahoria", "Zapallito", "Cordero", "Especias", "Lentejas"],
  EG: ["Arroz", "Lentejas", "Pollo", "Berenjena", "Tomate", "Pan pita", "Habas", "Especias"],
  IN: ["Arroz", "Lentejas", "Pollo", "Tomate", "Cebolla", "Yogur", "Especias", "Garbanzos", "Espinaca"],
  JP: ["Arroz", "Tofu", "Pollo", "Salsa de soja", "Cebolla de verdeo", "Huevos", "Fideos", "Algas"],
  OTHER: ["Pollo", "Arroz", "Tomate", "Cebolla", "Papa", "Queso", "Huevos", "Pasta"],
};

export function getIngredientSuggestions(countryCode: string): string[] {
  return ingredientSuggestions[countryCode] ?? ingredientSuggestions.OTHER;
}
