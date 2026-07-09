"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export interface DashboardCard {
  key: string;
  emoji: string;
  label: string;
}

export interface DashboardSection {
  key: string;
  title: string;
  cards: DashboardCard[];
}

const SECTION_ACCENT: Record<string, { text: string; badge: string; border: string }> = {
  today: { text: "text-orange", badge: "bg-orange/15", border: "hover:border-orange/50" },
  week: { text: "text-olive", badge: "bg-olive/15", border: "hover:border-olive/50" },
  better: { text: "text-success", badge: "bg-success/15", border: "hover:border-success/50" },
  learn: { text: "text-orange", badge: "bg-orange/15", border: "hover:border-orange/50" },
};

export function Dashboard({
  title,
  subtitle,
  sections,
  savedRecipesLabel,
  moreOptionsLabel,
  onCard,
  onSavedRecipes,
  onMoreOptions,
}: {
  title: string;
  subtitle: string;
  sections: DashboardSection[];
  savedRecipesLabel: string;
  moreOptionsLabel: string;
  onCard: (sectionKey: string, cardKey: string) => void;
  onSavedRecipes: () => void;
  onMoreOptions: () => void;
}) {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-extrabold text-warm mb-1">{title}</h1>
      <p className="text-muted text-sm mb-7">{subtitle}</p>

      <div className="flex flex-col gap-8">
        {sections.map((section) => {
          const accent = SECTION_ACCENT[section.key] ?? SECTION_ACCENT.today;
          return (
            <div key={section.key}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-1.5 h-1.5 rounded-full ${accent.badge.replace("/15", "")}`} />
                <h2 className={`text-xs font-bold uppercase tracking-wide ${accent.text}`}>{section.title}</h2>
              </div>
              <div className="flex flex-col gap-2.5">
                {section.cards.map((card) => (
                  <motion.button
                    key={card.key}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onCard(section.key, card.key)}
                    className={`w-full text-left rounded-2xl border border-white/8 bg-surface transition-colors px-3.5 py-3 flex items-center gap-3.5 ${accent.border}`}
                  >
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${accent.badge}`}>
                      {card.emoji}
                    </span>
                    <span className="font-semibold text-warm/90 flex-1">{card.label}</span>
                    <ChevronRight size={16} className="text-muted flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={onSavedRecipes} className="text-orange text-sm font-bold text-center mt-8 hover:underline">
        {savedRecipesLabel}
      </button>
      <button onClick={onMoreOptions} className="text-muted text-xs text-center mt-3 hover:text-warm transition-colors">
        {moreOptionsLabel}
      </button>
    </div>
  );
}
