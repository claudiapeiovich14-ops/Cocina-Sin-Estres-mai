"use client";

import { ChoiceCard } from "../ui/ChoiceCard";

export function OptionalMenu({
  title,
  strings,
  onSelect,
  discoverLabel,
  onDiscover,
}: {
  title: string;
  strings: any;
  onSelect: (key: "shoppingList" | "calories" | "savings" | "another" | "adapt") => void;
  discoverLabel: string;
  onDiscover: () => void;
}) {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-extrabold text-warm mb-6">{title}</h1>
      <div className="flex flex-col gap-3 mb-6">
        <ChoiceCard emoji="🛒" label={strings.actions.shoppingList} onClick={() => onSelect("shoppingList")} />
        <ChoiceCard emoji="🔥" label={strings.actions.calories} onClick={() => onSelect("calories")} />
        <ChoiceCard emoji="💰" label={strings.actions.savings} onClick={() => onSelect("savings")} />
        <ChoiceCard emoji="🔁" label={strings.actions.anotherOption} onClick={() => onSelect("another")} />
      </div>
      <button onClick={onDiscover} className="text-orange text-sm font-bold text-center hover:underline">
        {discoverLabel}
      </button>
    </div>
  );
}
