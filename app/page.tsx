"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { t } from "../lib/i18n/strings";
import { countries, getIngredientSuggestions } from "../lib/data/countries";
import {
  peopleKeys, timeKeys, dietaryKeys, preferenceKeys, goalKeys,
  shoppingPrefKeys, childrenAgesKeys, adaptOptionKeys,
} from "../lib/data/options";
import type { ChefAIInput, ChefAIResult, Lang, Mode, RejectReason } from "../lib/types";
import { generateRecipe, regenerate } from "../lib/ai/decisionEngine";
import { adaptFavoriteRecipe } from "../lib/ai/mockChefAI";
import { storage } from "../lib/storage";
import { readCampaignLocale } from "../lib/urlParams";

import { ScreenShell } from "../components/ui/ScreenShell";
import { ChoiceCard } from "../components/ui/ChoiceCard";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/ui/Logo";
import { Toast } from "../components/ui/Toast";
import { IngredientChips } from "../components/ui/IngredientChips";
import { AiThinking } from "../components/screens/AiThinking";
import { ResultScreen } from "../components/screens/ResultScreen";
import { WhySelected } from "../components/screens/WhySelected";
import { RecipeDetail } from "../components/screens/RecipeDetail";
import { OptionalMenu } from "../components/screens/OptionalMenu";
import { ShoppingListModule } from "../components/screens/ShoppingListModule";
import { NutritionModule } from "../components/screens/NutritionModule";
import { SavingsModule } from "../components/screens/SavingsModule";

type Step =
  | "hero" | "language" | "country" | "mode" | "intro"
  | "people" | "children" | "childrenAges" | "time" | "ingredients" | "shoppingPref" | "dietary" | "preference" | "goal"
  | "thinking" | "result" | "why" | "detail"
  | "optionalMenu" | "shoppingListModule" | "nutritionModule" | "savingsModule"
  | "reject" | "favoriteHow" | "favoriteInput" | "favoriteAdapt" | "finalCta";

const QUESTION_STEPS: Step[] = ["intro", "people", "children", "time", "ingredients", "shoppingPref", "dietary", "preference", "goal"];

const REJECT_TO_ADAPT: Partial<Record<RejectReason, string>> = {
  faster: "faster",
  cheaper: "cheaper",
  healthier: "healthier",
  moreProtein: "moreProtein",
  lowerCalories: "lowerCalories",
  kidFriendly: "kidFriendly",
  sameIngredients: "useWhatIHave",
};

export default function Home() {
  const [step, setStep] = useState<Step>("hero");
  const [history, setHistory] = useState<Step[]>([]);
  const [toast, setToast] = useState("");

  const [lang, setLang] = useState<Lang>("es");
  const [country, setCountry] = useState("AR");
  const [mode, setMode] = useState<Mode>("solve");

  const [people, setPeople] = useState("");
  const [hasChildren, setHasChildren] = useState(false);
  const [childrenAges, setChildrenAges] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState("");
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [shoppingPreference, setShoppingPreference] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [foodPreference, setFoodPreference] = useState("");
  const [mainGoal, setMainGoal] = useState("");

  const [favoriteText, setFavoriteText] = useState("");
  const [favoriteAdaptations, setFavoriteAdaptations] = useState<string[]>([]);

  const [result, setResult] = useState<ChefAIResult | null>(null);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [excludeIds, setExcludeIds] = useState<Set<string>>(new Set());
  const [pendingModule, setPendingModule] = useState<"shoppingList" | "calories" | "savings" | null>(null);
  const [pendingReject, setPendingReject] = useState<RejectReason | null>(null);
  const [campaignLocked, setCampaignLocked] = useState(false);

  const S = t(lang);

  useEffect(() => {
    const campaign = readCampaignLocale();
    if (campaign) {
      // A campaign link (?lang=en&country=uk) wins over anything saved locally,
      // so the very first screen already matches what the ad promised.
      setLang(campaign.lang);
      setCountry(campaign.country);
      storage.setString(storage.keys.language, campaign.lang);
      storage.setString(storage.keys.country, campaign.country);
      setCampaignLocked(true);
      return;
    }
    const savedLang = storage.getString(storage.keys.language) as Lang | null;
    const savedCountry = storage.getString(storage.keys.country);
    if (savedLang) setLang(savedLang);
    if (savedCountry) setCountry(savedCountry);
  }, []);

  function goTo(next: Step) {
    setHistory((h) => [...h, step]);
    setStep(next);
  }

  function goBack() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const copy = [...h];
      const prev = copy.pop()!;
      setStep(prev);
      return copy;
    });
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1700);
  }

  function copyToClipboard(text: string) {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
    flash(S.ui.copied);
  }

  function buildInput(): ChefAIInput {
    return {
      language: lang,
      cookingCountry: country,
      selectedMode: mode,
      people,
      hasChildren,
      childrenAges,
      cookingTime,
      availableIngredients,
      shoppingPreference,
      dietaryRestrictions,
      foodPreference,
      mainGoal,
    };
  }

  function startThinkingThenGenerate() {
    if (mode === "shoppingList" || mode === "calories" || mode === "savings") {
      setPendingModule(mode);
    }
    goTo("thinking");
  }

  function onThinkingDone() {
    if (pendingReject) {
      const reason = pendingReject;
      setPendingReject(null);

      if (mode === "adaptFavorite") {
        const extraAdapt = REJECT_TO_ADAPT[reason];
        const nextAdaptations = extraAdapt && !favoriteAdaptations.includes(extraAdapt)
          ? [...favoriteAdaptations, extraAdapt]
          : favoriteAdaptations;
        setFavoriteAdaptations(nextAdaptations);
        const r = adaptFavoriteRecipe(favoriteText, nextAdaptations, buildInput());
        setResult(r);
        setStep("result");
        return;
      }

      const prevId = recipeId ?? "";
      const newExclude = new Set(excludeIds);
      if (recipeId) newExclude.add(recipeId);
      const input = buildInput();
      const { recipeId: id, result: r } = regenerate(input, newExclude, prevId, reason);
      setExcludeIds(newExclude);
      setResult(r);
      setRecipeId(id);
      setStep("result");
      return;
    }
    if (mode === "adaptFavorite") {
      const r = adaptFavoriteRecipe(favoriteText, favoriteAdaptations, buildInput());
      setResult(r);
      setRecipeId(null);
      setStep("result");
      return;
    }
    const input = buildInput();
    const { recipeId: id, result: r } = generateRecipe(input, excludeIds);
    setResult(r);
    setRecipeId(id);
    setStep("result");
  }

  function handleReject(reason: RejectReason) {
    setPendingReject(reason);
    goTo("thinking");
  }

  const suggestions = useMemo(() => getIngredientSuggestions(country), [country]);

  return (
    <>
      <AnimatePresence mode="wait">
        {step === "hero" && (
          <ScreenShell key="hero">
            <Hero
              S={S}
              lang={lang}
              country={country}
              campaignLocked={campaignLocked}
              onStart={() => goTo(campaignLocked ? "mode" : "language")}
              onChangeLocale={() => { setCampaignLocked(false); goTo("language"); }}
            />
          </ScreenShell>
        )}

        {step === "language" && (
          <ScreenShell key="language" onBack={goBack}>
            <h1 className="text-2xl font-extrabold text-warm mb-1">{S.language.title}</h1>
            <p className="text-muted text-sm mb-6">{S.language.subtitle}</p>
            <div className="flex flex-col gap-3">
              <ChoiceCard label="Español" emoji="🇪🇸" selected={lang === "es"} onClick={() => { setLang("es"); storage.setString(storage.keys.language, "es"); goTo("country"); }} />
              <ChoiceCard label="English" emoji="🇺🇸" selected={lang === "en"} onClick={() => { setLang("en"); storage.setString(storage.keys.language, "en"); goTo("country"); }} />
            </div>
          </ScreenShell>
        )}

        {step === "country" && (
          <ScreenShell key="country" onBack={goBack}>
            <h1 className="text-2xl font-extrabold text-warm mb-1">{S.country.title}</h1>
            <p className="text-muted text-sm mb-6">{S.country.subtitle}</p>
            <div className="flex flex-col gap-2 max-h-[55vh] overflow-y-auto pr-1">
              {countries.map((c) => (
                <ChoiceCard
                  key={c.code}
                  label={c.name}
                  emoji={c.flag}
                  compact
                  selected={country === c.code}
                  onClick={() => { setCountry(c.code); storage.setString(storage.keys.country, c.code); goTo("mode"); }}
                />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "mode" && (
          <ScreenShell key="mode" onBack={goBack}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.mode.title}</h1>
            <div className="flex flex-col gap-3">
              {S.mode.cards.map((c) => (
                <ChoiceCard
                  key={c.key}
                  label={c.label}
                  emoji={c.emoji}
                  selected={mode === c.key}
                  onClick={() => {
                    setMode(c.key as Mode);
                    if (c.key === "adaptFavorite") goTo("favoriteHow");
                    else if (c.key === "surprise") { setFoodPreference("surprise"); setMainGoal(""); goTo("intro"); }
                    else goTo("intro");
                  }}
                />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "intro" && (
          <ScreenShell key="intro" onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 0 }}>
            <div className="flex flex-col items-center text-center mt-8">
              <div className="w-20 h-20 rounded-full bg-surface border border-orange/30 flex items-center justify-center mb-6 shadow-glow">
                <Logo size={36} />
              </div>
              <p className="text-lg text-warm/90 leading-snug mb-8 max-w-xs">{S.intro.message}</p>
              <Button onClick={() => goTo("people")}>{S.intro.cta} →</Button>
            </div>
          </ScreenShell>
        )}

        {step === "people" && (
          <ScreenShell key="people" onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 1 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.people.title}</h1>
            <div className="flex flex-col gap-3">
              {S.people.options.map((label, i) => (
                <ChoiceCard key={peopleKeys[i]} label={label} selected={people === peopleKeys[i]} onClick={() => { setPeople(peopleKeys[i]); goTo("children"); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "children" && (
          <ScreenShell key="children" onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 2 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.children.title}</h1>
            <div className="flex flex-col gap-3">
              <ChoiceCard label={S.children.yes} selected={hasChildren} onClick={() => { setHasChildren(true); goTo("childrenAges"); }} />
              <ChoiceCard label={S.children.no} selected={!hasChildren && childrenAges.length === 0} onClick={() => { setHasChildren(false); setChildrenAges([]); goTo("time"); }} />
            </div>
          </ScreenShell>
        )}

        {step === "childrenAges" && (
          <ScreenShell key="childrenAges" onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 2 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.children.agesTitle}</h1>
            <div className="flex flex-col gap-3 mb-8">
              {S.children.ages.map((label, i) => {
                const key = childrenAgesKeys[i];
                const selected = childrenAges.includes(key);
                return (
                  <ChoiceCard
                    key={key}
                    label={label}
                    selected={selected}
                    onClick={() => setChildrenAges((prev) => (selected ? prev.filter((a) => a !== key) : [...prev, key]))}
                  />
                );
              })}
            </div>
            <Button onClick={() => goTo("time")} disabled={childrenAges.length === 0}>{S.ui.next}</Button>
          </ScreenShell>
        )}

        {step === "time" && (
          <ScreenShell key="time" onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 3 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.time.title}</h1>
            <div className="flex flex-col gap-3">
              {S.time.options.map((label, i) => (
                <ChoiceCard key={timeKeys[i]} label={label} selected={cookingTime === timeKeys[i]} onClick={() => { setCookingTime(timeKeys[i]); goTo("ingredients"); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "ingredients" && (
          <ScreenShell key="ingredients" onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 4 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.ingredients.title}</h1>
            <IngredientChips
              value={availableIngredients}
              onChange={setAvailableIngredients}
              placeholder={S.ingredients.placeholder}
              suggestions={suggestions}
              suggestedLabel={S.ingredients.suggestedLabel}
            />
            <Button onClick={() => goTo("shoppingPref")} className="mt-8">{S.ui.next}</Button>
          </ScreenShell>
        )}

        {step === "shoppingPref" && (
          <ScreenShell key="shoppingPref" onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 5 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.shoppingPref.title}</h1>
            <div className="flex flex-col gap-3">
              {S.shoppingPref.options.map((label, i) => (
                <ChoiceCard key={shoppingPrefKeys[i]} label={label} selected={shoppingPreference === shoppingPrefKeys[i]} onClick={() => { setShoppingPreference(shoppingPrefKeys[i]); goTo("dietary"); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "dietary" && (
          <ScreenShell key="dietary" onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 6 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.dietary.title}</h1>
            <div className="flex flex-col gap-3 mb-8">
              {S.dietary.options.map((label, i) => {
                const key = dietaryKeys[i];
                const selected = dietaryRestrictions.includes(key);
                return (
                  <ChoiceCard
                    key={key}
                    label={label}
                    selected={selected}
                    onClick={() =>
                      setDietaryRestrictions((prev) => {
                        if (key === "none") return ["none"];
                        const withoutNone = prev.filter((p) => p !== "none");
                        return selected ? withoutNone.filter((p) => p !== key) : [...withoutNone, key];
                      })
                    }
                  />
                );
              })}
            </div>
            <Button onClick={() => goTo(mode === "surprise" ? "goal" : "preference")} disabled={dietaryRestrictions.length === 0}>{S.ui.next}</Button>
          </ScreenShell>
        )}

        {step === "preference" && (
          <ScreenShell key="preference" onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 7 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.preference.title}</h1>
            <div className="flex flex-col gap-3">
              {S.preference.options.map((label, i) => (
                <ChoiceCard key={preferenceKeys[i]} label={label} selected={foodPreference === preferenceKeys[i]} onClick={() => { setFoodPreference(preferenceKeys[i]); goTo("goal"); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "goal" && (
          <ScreenShell key="goal" onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 8 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.goal.title}</h1>
            <div className="flex flex-col gap-3">
              {S.goal.options.map((label, i) => (
                <ChoiceCard key={goalKeys[i]} label={label} selected={mainGoal === goalKeys[i]} onClick={() => { setMainGoal(goalKeys[i]); startThinkingThenGenerate(); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "favoriteHow" && (
          <ScreenShell key="favoriteHow" onBack={goBack}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.favorite.howTitle}</h1>
            <div className="flex flex-col gap-3">
              <ChoiceCard label={S.favorite.typePaste} emoji="📝" onClick={() => goTo("favoriteInput")} />
              <ChoiceCard label={S.favorite.pasteLink} emoji="🔗" onClick={() => flash(S.favorite.futurePlaceholder)} />
              <ChoiceCard label={S.favorite.uploadPhoto} emoji="📷" onClick={() => flash(S.favorite.futurePlaceholder)} />
              <ChoiceCard label={S.favorite.uploadPdf} emoji="📄" onClick={() => flash(S.favorite.futurePlaceholder)} />
            </div>
          </ScreenShell>
        )}

        {step === "favoriteInput" && (
          <ScreenShell key="favoriteInput" onBack={goBack}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.favorite.typePaste}</h1>
            <textarea
              value={favoriteText}
              onChange={(e) => setFavoriteText(e.target.value)}
              placeholder={S.favorite.placeholder}
              rows={8}
              className="w-full rounded-2xl bg-surface border border-white/10 px-5 py-4 text-warm placeholder:text-muted focus:outline-none focus:border-orange/60 transition-colors mb-6"
            />
            <Button onClick={() => goTo("favoriteAdapt")} disabled={favoriteText.trim().length === 0}>{S.ui.next}</Button>
          </ScreenShell>
        )}

        {step === "favoriteAdapt" && (
          <ScreenShell key="favoriteAdapt" onBack={goBack}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.favorite.adaptTitle}</h1>
            <div className="flex flex-col gap-3 mb-8">
              {S.favorite.adaptOptions.map((label, i) => {
                const key = adaptOptionKeys[i];
                const selected = favoriteAdaptations.includes(key);
                return (
                  <ChoiceCard
                    key={key}
                    label={label}
                    selected={selected}
                    onClick={() => setFavoriteAdaptations((prev) => (selected ? prev.filter((k) => k !== key) : [...prev, key]))}
                  />
                );
              })}
            </div>
            <Button onClick={startThinkingThenGenerate} disabled={favoriteAdaptations.length === 0}>{S.favorite.submit}</Button>
          </ScreenShell>
        )}

        {step === "thinking" && (
          <AiThinking
            key="thinking"
            title={S.thinking.title}
            lines={[...S.thinking.lines]}
            onDone={onThinkingDone}
          />
        )}

        {step === "result" && result && (
          <ScreenShell key="result">
            <ResultScreen
              result={result}
              strings={S}
              onViewRecipe={() => goTo("why")}
              onDislike={() => goTo("reject")}
              onAnother={() => handleReject("surpriseAgain")}
            />
          </ScreenShell>
        )}

        {step === "reject" && (
          <ScreenShell key="reject" onBack={goBack}>
            <h1 className="text-xl font-extrabold text-warm mb-6">{S.reject.message}</h1>
            <div className="flex flex-col gap-3">
              {S.reject.options.map((opt) => (
                <ChoiceCard key={opt.key} label={opt.label} onClick={() => handleReject(opt.key as RejectReason)} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "why" && result && (
          <ScreenShell key="why" onBack={goBack}>
            <WhySelected reasons={result.whySelected} title={S.why.title} ctaLabel={S.result.viewRecipe} onNext={() => goTo("detail")} />
          </ScreenShell>
        )}

        {step === "detail" && result && (
          <ScreenShell key="detail" onBack={goBack} wide>
            <RecipeDetail result={result} strings={S} onCopy={copyToClipboard} onContinue={() => goTo("optionalMenu")} />
          </ScreenShell>
        )}

        {step === "optionalMenu" && (
          <ScreenShell key="optionalMenu" onBack={goBack}>
            <OptionalMenuGate
              pendingModule={pendingModule}
              setPendingModule={setPendingModule}
              setStep={setStep}
              title={S.actions.more}
              strings={S}
              onSelect={(key: "shoppingList" | "calories" | "savings" | "another" | "adapt") => {
                if (key === "shoppingList") setStep("shoppingListModule");
                else if (key === "calories") setStep("nutritionModule");
                else if (key === "savings") setStep("savingsModule");
                else if (key === "another") handleReject("surpriseAgain");
              }}
              discoverLabel={S.actions.discover}
              onDiscover={() => goTo("finalCta")}
            />
          </ScreenShell>
        )}

        {step === "shoppingListModule" && result && (
          <ScreenShell key="shoppingListModule" onBack={() => setStep("optionalMenu")}>
            <ShoppingListModule result={result} strings={S} onCopy={copyToClipboard} onBack={() => setStep("optionalMenu")} />
          </ScreenShell>
        )}

        {step === "nutritionModule" && result && (
          <ScreenShell key="nutritionModule" onBack={() => setStep("optionalMenu")}>
            <NutritionModule result={result} strings={S} onBack={() => setStep("optionalMenu")} />
          </ScreenShell>
        )}

        {step === "savingsModule" && result && (
          <ScreenShell key="savingsModule" onBack={() => setStep("optionalMenu")}>
            <SavingsModule result={result} strings={S} onBack={() => setStep("optionalMenu")} />
          </ScreenShell>
        )}

        {step === "finalCta" && (
          <ScreenShell key="finalCta">
            <FinalCta
              S={S}
              onTryAnother={() => {
                setExcludeIds(new Set());
                setStep("mode");
              }}
            />
          </ScreenShell>
        )}
      </AnimatePresence>

      <Toast message={toast} />
    </>
  );
}

function Hero({
  S, lang, country, campaignLocked, onStart, onChangeLocale,
}: {
  S: any; lang: Lang; country: string; campaignLocked: boolean; onStart: () => void; onChangeLocale: () => void;
}) {
  const countryInfo = countries.find((c) => c.code === country);
  return (
    <div className="flex flex-col items-center text-center mt-16">
      <div className="w-20 h-20 rounded-full bg-surface border border-orange/30 flex items-center justify-center mb-8 shadow-glow">
        <Logo size={40} />
      </div>
      <h1 className="text-4xl font-extrabold text-warm mb-4 leading-[1.1] text-balance">{S.hero.headline}</h1>
      <p className="text-muted mb-6 max-w-xs">{S.hero.subheadline}</p>

      {campaignLocked && countryInfo && (
        <button
          onClick={onChangeLocale}
          className="flex items-center gap-2 text-xs font-semibold text-warm/80 bg-surface border border-white/10 rounded-full px-3.5 py-2 mb-6 hover:border-orange/50 transition-colors"
        >
          {countryInfo.flag} {lang === "es" ? "Español" : "English"} · {countryInfo.name}
          <span className="text-muted">· {lang === "es" ? "cambiar" : "change"}</span>
        </button>
      )}

      <Button onClick={onStart} className="mb-6">{S.hero.cta}</Button>
      <p className="text-xs text-muted/70 max-w-[240px]">{S.hero.microcopy}</p>
    </div>
  );
}

function FinalCta({ S, onTryAnother }: { S: any; onTryAnother: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-surface border border-orange/30 flex items-center justify-center mb-6 shadow-glow">
        <Logo size={30} />
      </div>
      <h1 className="text-2xl font-extrabold text-warm mb-6 leading-snug text-balance">{S.finalCta.message}</h1>
      <div className="flex flex-col gap-2 mb-8 w-full">
        {S.finalCta.bullets.map((b: string) => (
          <div key={b} className="glass rounded-xl px-4 py-2.5 text-sm text-warm/90 text-left">✓ {b}</div>
        ))}
      </div>
      <Button className="w-full mb-3">{S.finalCta.cta}</Button>
      <button onClick={onTryAnother} className="text-muted text-sm hover:text-warm transition-colors">{S.finalCta.secondary}</button>
    </div>
  );
}

function OptionalMenuGate({
  pendingModule,
  setPendingModule,
  setStep,
  ...props
}: any) {
  useEffect(() => {
    if (pendingModule) {
      const target = pendingModule === "shoppingList" ? "shoppingListModule" : pendingModule === "calories" ? "nutritionModule" : "savingsModule";
      setPendingModule(null);
      setStep(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <OptionalMenu {...props} />;
}
