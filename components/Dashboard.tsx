"use client";

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
      <p className="text-muted text-sm mb-6">{subtitle}</p>

      <div className="flex flex-col gap-7">
        {sections.map((section) => (
          <div key={section.key}>
            <h2 className="text-xs font-bold uppercase tracking-wide text-olive mb-3">{section.title}</h2>
            <div className="flex flex-col gap-2.5">
              {section.cards.map((card) => (
                <button
                  key={card.key}
                  onClick={() => onCard(section.key, card.key)}
                  className="w-full text-left rounded-2xl border border-black/8 bg-surface hover:border-orange/40 transition-colors px-4 py-3.5 flex items-center gap-3"
                >
                  <span className="text-lg">{card.emoji}</span>
                  <span className="font-semibold text-warm/90">{card.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
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
