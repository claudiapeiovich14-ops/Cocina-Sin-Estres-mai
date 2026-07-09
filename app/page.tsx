"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { t } from "../lib/strings";
import { countries, getIngredientSuggestions } from "../lib/countries";
import {
  peopleKeys, timeKeys, dietaryKeys, preferenceKeys, goalKeys,
  shoppingPrefKeys, childrenAgesKeys, adaptOptionKeys,
  diagnosticQ1Keys, diagnosticQ2Keys, diagnosticQ3Keys,
  energyKeys, methodTimeKeys, methodIngredientKeys,
} from "../lib/options";
import type {
  ChefAIInput, ChefAIResult, Lang, Mode, RejectReason,
  DiagnosticProfileKey, EnergyLevel, WeeklyPlan, FavoriteRecipe,
} from "../lib/types";
import { generateRecipe, regenerate, generateWeeklyPlan } from "../lib/decisionEngine";
import { adaptFavoriteRecipe } from "../lib/mockChefAI";
import { computeDiagnosticProfile } from "../lib/diagnostic";
import { storage } from "../lib/storage";
import { readCampaignLocale } from "../lib/urlParams";

import { ScreenShell } from "../components/ScreenShell";
import { ChoiceCard } from "../components/ChoiceCard";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { Toast } from "../components/Toast";
import { IngredientChips } from "../components/IngredientChips";
import { AiThinking } from "../components/AiThinking";
import { ResultScreen } from "../components/ResultScreen";
import { WhySelected } from "../components/WhySelected";
import { RecipeDetail } from "../components/RecipeDetail";
import { OptionalMenu } from "../components/OptionalMenu";
import { ShoppingListModule } from "../components/ShoppingListModule";
import { NutritionModule } from "../components/NutritionModule";
import { SavingsModule } from "../components/SavingsModule";
import { Dashboard } from "../components/Dashboard";
import { GuideChapter } from "../components/GuideChapter";
import { WeeklyPlanView } from "../components/WeeklyPlan";
import { SavedRecipesList } from "../components/SavedRecipesList";

type Step =
  | "hero" | "howItWorks" | "language" | "country"
  | "diagnosticQ1" | "diagnosticQ2" | "diagnosticQ3" | "diagnosticResult"
  | "mode" | "allOptions" | "intro"
  | "people" | "children" | "childrenAges" | "time" | "ingredients" | "shoppingPref" | "dietary" | "preference" | "goal"
  | "methodEnergy" | "methodTime" | "methodIngredients"
  | "thinking" | "result" | "why" | "detail"
  | "optionalMenu" | "shoppingListModule" | "nutritionModule" | "savingsModule"
  | "reject" | "favoriteHow" | "favoriteInput" | "favoriteAdapt" | "finalCta"
  | "weeklyPeople" | "weeklyResult" | "weeklyDayDetail" | "weeklyShopping"
  | "guide" | "myRecipes";

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
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | "">("");

  const [favoriteText, setFavoriteText] = useState("");
  const [favoriteAdaptations, setFavoriteAdaptations] = useState<string[]>([]);

  const [result, setResult] = useState<ChefAIResult | null>(null);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [excludeIds, setExcludeIds] = useState<Set<string>>(new Set());
  const [pendingModule, setPendingModule] = useState<"shoppingList" | "calories" | "savings" | null>(null);
  const [pendingReject, setPendingReject] = useState<RejectReason | null>(null);
  const [campaignLocked, setCampaignLocked] = useState(false);

  const [diagnosticQ1, setDiagnosticQ1] = useState("");
  const [diagnosticQ2, setDiagnosticQ2] = useState("");
  const [diagnosticQ3, setDiagnosticQ3] = useState("");
  const [diagnosticProfile, setDiagnosticProfile] = useState<DiagnosticProfileKey | null>(null);

  const [pendingWeekly, setPendingWeekly] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [weeklyDayIndex, setWeeklyDayIndex] = useState(0);

  const [guideChapterIndex, setGuideChapterIndex] = useState(0);
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);

  const S = t(lang);

  useEffect(() => {
    const savedFavorites = storage.getJSON<FavoriteRecipe[]>(storage.keys.favorites);
    if (savedFavorites) setFavorites(savedFavorites);

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

  function goHome() {
    setHistory([]);
    setStep("hero");
    setMode("solve");
    setPeople("");
    setHasChildren(false);
    setChildrenAges([]);
    setCookingTime("");
    setAvailableIngredients([]);
    setShoppingPreference("");
    setDietaryRestrictions([]);
    setFoodPreference("");
    setMainGoal("");
    setEnergyLevel("");
    setFavoriteText("");
    setFavoriteAdaptations([]);
    setResult(null);
    setRecipeId(null);
    setExcludeIds(new Set());
    setPendingModule(null);
    setPendingReject(null);
    setDiagnosticQ1("");
    setDiagnosticQ2("");
    setDiagnosticQ3("");
    setDiagnosticProfile(null);
    setWeeklyPlan(null);
    setPendingWeekly(false);
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
      energyLevel: energyLevel || undefined,
    };
  }

  function goToDiagnosticOrDashboard() {
    goTo(campaignLocked ? "diagnosticQ1" : "language");
  }

  function startThinkingThenGenerate() {
    if (mode === "shoppingList" || mode === "calories" || mode === "savings") {
      setPendingModule(mode);
    }
    goTo("thinking");
  }

  function startPresetFlow(overrides: Partial<{ cookingTime: string; mainGoal: string; energyLevel: EnergyLevel }>) {
    setMode("solve");
    if (overrides.cookingTime !== undefined) setCookingTime(overrides.cookingTime);
    if (overrides.mainGoal !== undefined) setMainGoal(overrides.mainGoal);
    if (overrides.energyLevel !== undefined) setEnergyLevel(overrides.energyLevel);
    goTo("thinking");
  }

  function onThinkingDone() {
    if (pendingWeekly) {
      setPendingWeekly(false);
      const plan = generateWeeklyPlan(buildInput(), [...S.weeklyPlanner.dayLabels]);
      setWeeklyPlan(plan);
      setStep("weeklyResult");
      return;
    }
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

  function openGuide(index: number) {
    setGuideChapterIndex(index);
    goTo("guide");
  }

  function handleDashboardCard(sectionKey: string, cardKey: string) {
    switch (cardKey) {
      case "solve":
        setMode("solve");
        goTo("methodEnergy");
        break;
      case "emergency":
        startPresetFlow({ cookingTime: "10", mainGoal: "fast", energyLevel: "low" });
        break;
      case "under30":
        startPresetFlow({ cookingTime: "30", energyLevel: "medium" });
        break;
      case "weeklyPlanner":
        goTo("weeklyPeople");
        break;
      case "shoppingList":
        setMode("shoppingList");
        goTo("intro");
        break;
      case "portions":
        setMode("solve");
        goTo("intro");
        break;
      case "nutrition":
      case "calories":
        setMode("calories");
        goTo("intro");
        break;
      case "tips":
        openGuide(1);
        break;
      case "chapter0":
        openGuide(0);
        break;
      case "chapter1":
        openGuide(1);
        break;
      case "chapter3":
        openGuide(3);
        break;
    }
  }

  function saveFavorite(r: ChefAIResult, id: string | null) {
    const favId = id ?? `custom-${Date.now()}`;
    const alreadySaved = favorites.some(
      (f) => f.result.localizedRecipeName === r.localizedRecipeName && f.result.cookingTime === r.cookingTime,
    );
    if (alreadySaved) {
      flash(S.savedRecipes.savedToast);
      return;
    }
    const next = [...favorites, { id: favId, savedAt: Date.now(), result: r }];
    setFavorites(next);
    storage.setJSON(storage.keys.favorites, next);
    flash(S.savedRecipes.savedToast);
  }

  function removeFavorite(id: string) {
    const next = favorites.filter((f) => f.id !== id);
    setFavorites(next);
    storage.setJSON(storage.keys.favorites, next);
  }

  const suggestions = useMemo(() => getIngredientSuggestions(country), [country]);

  return (
    <>
      <AnimatePresence mode="wait">
        {step === "hero" && (
          <ScreenShell key="hero" onHome={goHome}>
            <Hero
              S={S}
              lang={lang}
              country={country}
              campaignLocked={campaignLocked}
              onStart={goToDiagnosticOrDashboard}
              onHowItWorks={() => goTo("howItWorks")}
              onChangeLocale={() => { setCampaignLocked(false); goTo("language"); }}
            />
          </ScreenShell>
        )}

        {step === "howItWorks" && (
          <ScreenShell key="howItWorks" onHome={goHome} onBack={goBack}>
            <HowItWorks S={S} onStart={goToDiagnosticOrDashboard} />
          </ScreenShell>
        )}

        {step === "language" && (
          <ScreenShell key="language" onHome={goHome} onBack={goBack}>
            <h1 className="text-2xl font-extrabold text-warm mb-1">{S.language.title}</h1>
            <p className="text-muted text-sm mb-6">{S.language.subtitle}</p>
            <div className="flex flex-col gap-3">
              <ChoiceCard label="Español" emoji="🇪🇸" selected={lang === "es"} onClick={() => { setLang("es"); storage.setString(storage.keys.language, "es"); goTo("country"); }} />
              <ChoiceCard label="English" emoji="🇺🇸" selected={lang === "en"} onClick={() => { setLang("en"); storage.setString(storage.keys.language, "en"); goTo("country"); }} />
            </div>
          </ScreenShell>
        )}

        {step === "country" && (
          <ScreenShell key="country" onHome={goHome} onBack={goBack}>
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
                  onClick={() => { setCountry(c.code); storage.setString(storage.keys.country, c.code); goTo("diagnosticQ1"); }}
                />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "diagnosticQ1" && (
          <ScreenShell key="diagnosticQ1" onHome={goHome} onBack={goBack} eyebrow={S.diagnostic.title} progress={{ total: 3, current: 0 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.diagnostic.q1.title}</h1>
            <div className="flex flex-col gap-3">
              {S.diagnostic.q1.options.map((label, i) => (
                <ChoiceCard key={diagnosticQ1Keys[i]} label={label} selected={diagnosticQ1 === diagnosticQ1Keys[i]} onClick={() => { setDiagnosticQ1(diagnosticQ1Keys[i]); goTo("diagnosticQ2"); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "diagnosticQ2" && (
          <ScreenShell key="diagnosticQ2" onHome={goHome} onBack={goBack} eyebrow={S.diagnostic.title} progress={{ total: 3, current: 1 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.diagnostic.q2.title}</h1>
            <div className="flex flex-col gap-3">
              {S.diagnostic.q2.options.map((label, i) => (
                <ChoiceCard key={diagnosticQ2Keys[i]} label={label} selected={diagnosticQ2 === diagnosticQ2Keys[i]} onClick={() => { setDiagnosticQ2(diagnosticQ2Keys[i]); goTo("diagnosticQ3"); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "diagnosticQ3" && (
          <ScreenShell key="diagnosticQ3" onHome={goHome} onBack={goBack} eyebrow={S.diagnostic.title} progress={{ total: 3, current: 2 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.diagnostic.q3.title}</h1>
            <div className="flex flex-col gap-3">
              {S.diagnostic.q3.options.map((label, i) => (
                <ChoiceCard
                  key={diagnosticQ3Keys[i]}
                  label={label}
                  selected={diagnosticQ3 === diagnosticQ3Keys[i]}
                  onClick={() => {
                    const q3 = diagnosticQ3Keys[i];
                    setDiagnosticQ3(q3);
                    setDiagnosticProfile(computeDiagnosticProfile(diagnosticQ1, diagnosticQ2, q3));
                    goTo("diagnosticResult");
                  }}
                />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "diagnosticResult" && diagnosticProfile && (
          <ScreenShell key="diagnosticResult" onHome={goHome}>
            <div className="flex flex-col items-center text-center">
              <p className="text-orange text-xs font-bold tracking-[0.15em] uppercase mb-3">{S.diagnostic.resultTitle}</p>
              <div className="w-16 h-16 rounded-full bg-surface border border-orange/30 flex items-center justify-center mb-6 shadow-glow">
                <Logo size={30} />
              </div>
              <h1 className="text-2xl font-extrabold text-warm mb-3 leading-snug">{S.diagnostic.profiles[diagnosticProfile].title}</h1>
              <p className="text-warm/80 mb-8 max-w-xs">{S.diagnostic.profiles[diagnosticProfile].body}</p>
              <Button onClick={() => goTo("mode")}>{S.diagnostic.resultCta}</Button>
            </div>
          </ScreenShell>
        )}

        {step === "mode" && (
          <ScreenShell key="mode" onHome={goHome} onBack={goBack}>
            <Dashboard
              title={S.dashboard.title}
              subtitle={S.dashboard.subtitle}
              sections={S.dashboard.sections as any}
              savedRecipesLabel={S.dashboard.savedRecipesLink}
              moreOptionsLabel={S.dashboard.moreOptions}
              onCard={handleDashboardCard}
              onSavedRecipes={() => goTo("myRecipes")}
              onMoreOptions={() => goTo("allOptions")}
            />
          </ScreenShell>
        )}

        {step === "allOptions" && (
          <ScreenShell key="allOptions" onHome={goHome} onBack={goBack}>
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

        {step === "methodEnergy" && (
          <ScreenShell key="methodEnergy" onHome={goHome} onBack={goBack} eyebrow={S.method.eyebrow} progress={{ total: 3, current: 0 }}>
            <h1 className="text-xl font-extrabold text-warm mb-1">{S.method.title}</h1>
            <p className="text-muted text-sm mb-6">{S.method.subtitle}</p>
            <h2 className="text-lg font-bold text-warm mb-4">{S.method.energyTitle}</h2>
            <div className="flex flex-col gap-3">
              {S.method.energyOptions.map((label, i) => (
                <ChoiceCard key={energyKeys[i]} label={label} selected={energyLevel === energyKeys[i]} onClick={() => { setEnergyLevel(energyKeys[i]); goTo("methodTime"); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "methodTime" && (
          <ScreenShell key="methodTime" onHome={goHome} onBack={goBack} eyebrow={S.method.eyebrow} progress={{ total: 3, current: 1 }}>
            <h2 className="text-lg font-bold text-warm mb-4">{S.method.timeTitle}</h2>
            <div className="flex flex-col gap-3">
              {S.method.timeOptions.map((label, i) => (
                <ChoiceCard key={methodTimeKeys[i]} label={label} selected={cookingTime === methodTimeKeys[i]} onClick={() => { setCookingTime(methodTimeKeys[i]); goTo("methodIngredients"); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "methodIngredients" && (
          <ScreenShell key="methodIngredients" onHome={goHome} onBack={goBack} eyebrow={S.method.eyebrow} progress={{ total: 3, current: 2 }}>
            <h2 className="text-lg font-bold text-warm mb-4">{S.method.ingredientsTitle}</h2>
            <div className="flex flex-col gap-3">
              {S.method.ingredientsOptions.map((label, i) => (
                <ChoiceCard
                  key={methodIngredientKeys[i]}
                  label={label}
                  onClick={() => {
                    setAvailableIngredients(methodIngredientKeys[i] === "whateverIHave" ? [] : [label]);
                    startThinkingThenGenerate();
                  }}
                />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "intro" && (
          <ScreenShell key="intro" onHome={goHome} onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 0 }}>
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
          <ScreenShell key="people" onHome={goHome} onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 1 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.people.title}</h1>
            <div className="flex flex-col gap-3">
              {S.people.options.map((label, i) => (
                <ChoiceCard key={peopleKeys[i]} label={label} selected={people === peopleKeys[i]} onClick={() => { setPeople(peopleKeys[i]); goTo("children"); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "children" && (
          <ScreenShell key="children" onHome={goHome} onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 2 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.children.title}</h1>
            <div className="flex flex-col gap-3">
              <ChoiceCard label={S.children.yes} selected={hasChildren} onClick={() => { setHasChildren(true); goTo("childrenAges"); }} />
              <ChoiceCard label={S.children.no} selected={!hasChildren && childrenAges.length === 0} onClick={() => { setHasChildren(false); setChildrenAges([]); goTo("time"); }} />
            </div>
          </ScreenShell>
        )}

        {step === "childrenAges" && (
          <ScreenShell key="childrenAges" onHome={goHome} onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 2 }}>
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
          <ScreenShell key="time" onHome={goHome} onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 3 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.time.title}</h1>
            <div className="flex flex-col gap-3">
              {S.time.options.map((label, i) => (
                <ChoiceCard key={timeKeys[i]} label={label} selected={cookingTime === timeKeys[i]} onClick={() => { setCookingTime(timeKeys[i]); goTo("ingredients"); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "ingredients" && (
          <ScreenShell key="ingredients" onHome={goHome} onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 4 }}>
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
          <ScreenShell key="shoppingPref" onHome={goHome} onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 5 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.shoppingPref.title}</h1>
            <div className="flex flex-col gap-3">
              {S.shoppingPref.options.map((label, i) => (
                <ChoiceCard key={shoppingPrefKeys[i]} label={label} selected={shoppingPreference === shoppingPrefKeys[i]} onClick={() => { setShoppingPreference(shoppingPrefKeys[i]); goTo("dietary"); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "dietary" && (
          <ScreenShell key="dietary" onHome={goHome} onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 6 }}>
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
          <ScreenShell key="preference" onHome={goHome} onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 7 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.preference.title}</h1>
            <div className="flex flex-col gap-3">
              {S.preference.options.map((label, i) => (
                <ChoiceCard key={preferenceKeys[i]} label={label} selected={foodPreference === preferenceKeys[i]} onClick={() => { setFoodPreference(preferenceKeys[i]); goTo("goal"); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "goal" && (
          <ScreenShell key="goal" onHome={goHome} onBack={goBack} progress={{ total: QUESTION_STEPS.length, current: 8 }}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.goal.title}</h1>
            <div className="flex flex-col gap-3">
              {S.goal.options.map((label, i) => (
                <ChoiceCard key={goalKeys[i]} label={label} selected={mainGoal === goalKeys[i]} onClick={() => { setMainGoal(goalKeys[i]); startThinkingThenGenerate(); }} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "favoriteHow" && (
          <ScreenShell key="favoriteHow" onHome={goHome} onBack={goBack}>
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
          <ScreenShell key="favoriteInput" onHome={goHome} onBack={goBack}>
            <h1 className="text-2xl font-extrabold text-warm mb-6">{S.favorite.typePaste}</h1>
            <textarea
              value={favoriteText}
              onChange={(e) => setFavoriteText(e.target.value)}
              placeholder={S.favorite.placeholder}
              rows={8}
              className="w-full rounded-2xl bg-surface border border-black/10 px-5 py-4 text-warm placeholder:text-muted focus:outline-none focus:border-orange/60 transition-colors mb-6"
            />
            <Button onClick={() => goTo("favoriteAdapt")} disabled={favoriteText.trim().length === 0}>{S.ui.next}</Button>
          </ScreenShell>
        )}

        {step === "favoriteAdapt" && (
          <ScreenShell key="favoriteAdapt" onHome={goHome} onBack={goBack}>
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
            title={pendingWeekly ? S.weeklyPlanner.generatingTitle : S.thinking.title}
            lines={[...S.thinking.lines]}
            onDone={onThinkingDone}
          />
        )}

        {step === "result" && result && (
          <ScreenShell key="result" onHome={goHome}>
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
          <ScreenShell key="reject" onHome={goHome} onBack={goBack}>
            <h1 className="text-xl font-extrabold text-warm mb-6">{S.reject.message}</h1>
            <div className="flex flex-col gap-3">
              {S.reject.options.map((opt) => (
                <ChoiceCard key={opt.key} label={opt.label} onClick={() => handleReject(opt.key as RejectReason)} />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "why" && result && (
          <ScreenShell key="why" onHome={goHome} onBack={goBack}>
            <WhySelected reasons={result.whySelected} title={S.why.title} ctaLabel={S.result.viewRecipe} onNext={() => goTo("detail")} />
          </ScreenShell>
        )}

        {step === "detail" && result && (
          <ScreenShell key="detail" onHome={goHome} onBack={goBack} wide>
            <RecipeDetail
              result={result}
              strings={S}
              onCopy={copyToClipboard}
              onContinue={() => goTo("optionalMenu")}
              onSaveFavorite={() => saveFavorite(result, recipeId)}
            />
          </ScreenShell>
        )}

        {step === "optionalMenu" && (
          <ScreenShell key="optionalMenu" onHome={goHome} onBack={goBack}>
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
          <ScreenShell key="shoppingListModule" onHome={goHome} onBack={() => setStep("optionalMenu")}>
            <ShoppingListModule shoppingList={result.shoppingList} strings={S} onCopy={copyToClipboard} onBack={() => setStep("optionalMenu")} />
          </ScreenShell>
        )}

        {step === "nutritionModule" && result && (
          <ScreenShell key="nutritionModule" onHome={goHome} onBack={() => setStep("optionalMenu")}>
            <NutritionModule result={result} strings={S} onBack={() => setStep("optionalMenu")} />
          </ScreenShell>
        )}

        {step === "savingsModule" && result && (
          <ScreenShell key="savingsModule" onHome={goHome} onBack={() => setStep("optionalMenu")}>
            <SavingsModule result={result} strings={S} onBack={() => setStep("optionalMenu")} />
          </ScreenShell>
        )}

        {step === "finalCta" && (
          <ScreenShell key="finalCta" onHome={goHome}>
            <FinalCta
              S={S}
              onTryAnother={() => {
                setExcludeIds(new Set());
                setStep("mode");
              }}
            />
          </ScreenShell>
        )}

        {step === "weeklyPeople" && (
          <ScreenShell key="weeklyPeople" onHome={goHome} onBack={goBack}>
            <h1 className="text-2xl font-extrabold text-warm mb-1">{S.weeklyPlanner.title}</h1>
            <p className="text-muted text-sm mb-6">{S.weeklyPlanner.subtitle}</p>
            <h2 className="text-lg font-bold text-warm mb-4">{S.people.title}</h2>
            <div className="flex flex-col gap-3">
              {S.people.options.map((label, i) => (
                <ChoiceCard
                  key={peopleKeys[i]}
                  label={label}
                  selected={people === peopleKeys[i]}
                  onClick={() => {
                    setPeople(peopleKeys[i]);
                    setMode("solve");
                    setPendingWeekly(true);
                    goTo("thinking");
                  }}
                />
              ))}
            </div>
          </ScreenShell>
        )}

        {step === "weeklyResult" && weeklyPlan && (
          <ScreenShell key="weeklyResult" onHome={goHome} onBack={goBack}>
            <WeeklyPlanView
              plan={weeklyPlan}
              title={S.weeklyPlanner.title}
              subtitle={S.weeklyPlanner.subtitle}
              shoppingListLabel={S.weeklyPlanner.shoppingListTitle}
              viewDayLabel={S.weeklyPlanner.viewDay}
              onViewDay={(i) => { setWeeklyDayIndex(i); goTo("weeklyDayDetail"); }}
              onViewShoppingList={() => goTo("weeklyShopping")}
            />
          </ScreenShell>
        )}

        {step === "weeklyDayDetail" && weeklyPlan && (
          <ScreenShell key="weeklyDayDetail" onHome={goHome} onBack={() => setStep("weeklyResult")} wide>
            <RecipeDetail
              result={weeklyPlan.days[weeklyDayIndex].result}
              strings={S}
              onCopy={copyToClipboard}
              onContinue={() => setStep("weeklyResult")}
              onSaveFavorite={() => saveFavorite(weeklyPlan.days[weeklyDayIndex].result, weeklyPlan.days[weeklyDayIndex].recipeId)}
            />
          </ScreenShell>
        )}

        {step === "weeklyShopping" && weeklyPlan && (
          <ScreenShell key="weeklyShopping" onHome={goHome} onBack={() => setStep("weeklyResult")}>
            <ShoppingListModule shoppingList={weeklyPlan.shoppingList} strings={S} onCopy={copyToClipboard} onBack={() => setStep("weeklyResult")} />
          </ScreenShell>
        )}

        {step === "guide" && (
          <ScreenShell key="guide" onHome={goHome} onBack={goBack}>
            <GuideChapter
              chapter={S.guide.chapters[guideChapterIndex] as any}
              index={guideChapterIndex}
              total={S.guide.chapters.length}
              title={S.guide.title}
              onPrev={() => setGuideChapterIndex((i) => Math.max(0, i - 1))}
              onNext={() => setGuideChapterIndex((i) => Math.min(S.guide.chapters.length - 1, i + 1))}
              onDone={() => goTo("mode")}
              doneLabel={S.guide.cta}
            />
          </ScreenShell>
        )}

        {step === "myRecipes" && (
          <ScreenShell key="myRecipes" onHome={goHome} onBack={goBack}>
            <SavedRecipesList
              favorites={favorites}
              title={S.savedRecipes.title}
              emptyLabel={S.savedRecipes.empty}
              removeLabel={S.savedRecipes.remove}
              onOpen={(id) => {
                const fav = favorites.find((f) => f.id === id);
                if (!fav) return;
                setResult(fav.result);
                setRecipeId(fav.id);
                goTo("detail");
              }}
              onRemove={removeFavorite}
            />
          </ScreenShell>
        )}
      </AnimatePresence>

      <Toast message={toast} />
    </>
  );
}

function Hero({
  S, lang, country, campaignLocked, onStart, onHowItWorks, onChangeLocale,
}: {
  S: any; lang: Lang; country: string; campaignLocked: boolean; onStart: () => void; onHowItWorks: () => void; onChangeLocale: () => void;
}) {
  const countryInfo = countries.find((c) => c.code === country);
  return (
    <div className="flex flex-col items-center text-center mt-12">
      <div className="w-20 h-20 rounded-full bg-surface border border-orange/30 flex items-center justify-center mb-8 shadow-glow">
        <Logo size={40} />
      </div>
      <h1 className="text-4xl font-extrabold text-warm mb-3 leading-[1.1] text-balance">{S.hero.headline}</h1>
      <p className="text-olive font-bold mb-4 max-w-xs">{S.hero.subheadline}</p>
      <p className="text-muted mb-6 max-w-sm leading-relaxed">{S.hero.support}</p>

      {campaignLocked && countryInfo && (
        <button
          onClick={onChangeLocale}
          className="flex items-center gap-2 text-xs font-semibold text-warm/80 bg-surface border border-black/10 rounded-full px-3.5 py-2 mb-6 hover:border-orange/50 transition-colors"
        >
          {countryInfo.flag} {lang === "es" ? "Español" : "English"} · {countryInfo.name}
          <span className="text-muted">· {lang === "es" ? "cambiar" : "change"}</span>
        </button>
      )}

      <Button onClick={onStart} className="mb-3">{S.hero.cta}</Button>
      <button onClick={onHowItWorks} className="text-warm/70 text-sm font-semibold hover:text-warm mb-6 underline underline-offset-2">
        {S.hero.secondaryCta}
      </button>
      <p className="text-xs text-muted/70 max-w-[240px]">{S.hero.microcopy}</p>
    </div>
  );
}

function HowItWorks({ S, onStart }: { S: any; onStart: () => void }) {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-extrabold text-warm mb-6">{S.howItWorks.title}</h1>
      <div className="flex flex-col gap-4 mb-8">
        {S.howItWorks.steps.map((step: { title: string; body: string }, i: number) => (
          <div key={i} className="glass rounded-2xl px-4 py-4 flex gap-3">
            <span className="w-7 h-7 rounded-full bg-orange/15 text-orange font-bold text-sm flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <div>
              <p className="font-bold text-warm mb-1">{step.title}</p>
              <p className="text-sm text-muted leading-snug">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={onStart}>{S.howItWorks.cta}</Button>
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
