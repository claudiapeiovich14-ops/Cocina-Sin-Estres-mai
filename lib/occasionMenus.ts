export interface OccasionMenu {
  key: string;
  emoji: string;
  label: { es: string; en: string };
  note: { es: string; en: string };
  recipeIds: string[];
}

// Curated combos from the existing recipe library, grouped by occasion.
export const occasionMenus: OccasionMenu[] = [
  {
    key: "kidsBirthday",
    emoji: "🎈",
    label: { es: "Cumpleaños infantil", en: "Kids' birthday" },
    note: {
      es: "Finger food que a los chicos les encanta armar solos.",
      en: "Finger food kids love putting together themselves.",
    },
    recipeIds: ["quesadillas", "beef-tacos"],
  },
  {
    key: "holidayDinner",
    emoji: "🎄",
    label: { es: "Navidad / Fin de año", en: "Christmas / New Year's" },
    note: {
      es: "Una cena festiva que no te deja frita en la cocina todo el día.",
      en: "A festive dinner that won't keep you stuck in the kitchen all day.",
    },
    recipeIds: ["baked-chicken-thighs", "greek-salad-chicken", "light-fruit-jelly"],
  },
  {
    key: "bbqWithFriends",
    emoji: "🔥",
    label: { es: "Asado con amigos", en: "BBQ with friends" },
    note: {
      es: "Para compartir, con guarniciones fáciles de duplicar.",
      en: "Great for sharing, with sides that are easy to double.",
    },
    recipeIds: ["beef-tacos", "beef-rice-bowl"],
  },
  {
    key: "familyGathering",
    emoji: "🥂",
    label: { es: "Reunión familiar liviana", en: "Light family gathering" },
    note: {
      es: "Rica, liviana, y le gusta a toda la familia.",
      en: "Tasty, light, and something the whole family will enjoy.",
    },
    recipeIds: ["mediterranean-chicken-bowl", "seasonal-fruit-salad"],
  },
];
