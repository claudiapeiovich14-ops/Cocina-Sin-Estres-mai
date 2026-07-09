"use client";

import type { ChefAIResult } from "../../lib/types";
import { Button } from "../ui/Button";

export function ShoppingListModule({
  result,
  strings,
  onCopy,
  onBack,
}: {
  result: ChefAIResult;
  strings: any;
  onCopy: (text: string) => void;
  onBack: () => void;
}) {
  function copy() {
    const text = result.shoppingList.map((g) => `${g.category}:\n${g.items.map((i) => `- ${i}`).join("\n")}`).join("\n\n");
    onCopy(text);
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-extrabold text-warm mb-1">{strings.shoppingListModule.title}</h1>
      <p className="text-muted text-xs mb-6">{strings.shoppingListModule.subtitle}</p>

      {result.shoppingList.length === 0 ? (
        <p className="text-muted text-sm mb-6">{strings.shoppingListModule.nothingMissing}</p>
      ) : (
        <div className="flex flex-col gap-5 mb-6">
          {result.shoppingList.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-bold uppercase tracking-wide text-orange mb-2">{group.category}</h3>
              <ul className="flex flex-col gap-1.5">
                {group.items.map((item, i) => (
                  <li key={i} className="text-sm text-warm/90 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange/60" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button variant="secondary" onClick={copy}>{strings.actions.copyShoppingList}</Button>
        <Button onClick={onBack}>{strings.ui.continue} →</Button>
      </div>
    </div>
  );
}
