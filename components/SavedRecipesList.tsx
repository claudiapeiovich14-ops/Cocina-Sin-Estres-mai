"use client";

import type { FavoriteRecipe } from "../lib/types";
import { Trash2 } from "lucide-react";

export function SavedRecipesList({
  favorites,
  title,
  emptyLabel,
  removeLabel,
  onOpen,
  onRemove,
}: {
  favorites: FavoriteRecipe[];
  title: string;
  emptyLabel: string;
  removeLabel: string;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-extrabold text-warm mb-6">{title}</h1>

      {favorites.length === 0 ? (
        <p className="text-muted text-sm">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="w-full rounded-2xl border border-white/8 bg-surface px-4 py-3.5 flex items-center gap-3"
            >
              <button onClick={() => onOpen(fav.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <span className="text-2xl">{fav.result.imageEmoji}</span>
                <span className="font-semibold text-warm/90 truncate">{fav.result.localizedRecipeName}</span>
              </button>
              <button
                onClick={() => onRemove(fav.id)}
                aria-label={removeLabel}
                className="text-muted hover:text-orange flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
