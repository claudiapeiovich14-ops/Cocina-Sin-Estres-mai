import type { Lang } from "./types";
import { countries } from "./countries";

const COUNTRY_ALIASES: Record<string, string> = {
  UK: "GB",
  GB: "GB",
  UNITEDKINGDOM: "GB",
  USA: "US",
  SPAIN: "ES",
  ESPANA: "ES",
  ESPAÑA: "ES",
  ARGENTINA: "AR",
  MEXICO: "MX",
  MÉXICO: "MX",
  BRAZIL: "BR",
  BRASIL: "BR",
};

function resolveCountryCode(raw: string): string | null {
  const normalized = raw.trim().toUpperCase();
  if (COUNTRY_ALIASES[normalized]) return COUNTRY_ALIASES[normalized];
  if (countries.some((c) => c.code === normalized)) return normalized;
  return null;
}

function resolveLang(raw: string): Lang | null {
  const normalized = raw.trim().toLowerCase();
  if (normalized === "en" || normalized === "es") return normalized;
  return null;
}

export interface CampaignLocale {
  lang: Lang;
  country: string;
}

/**
 * Reads ?lang=en&country=uk style params from the current URL so a paid
 * campaign can land users directly in the right language/country instead of
 * making them pick it again on screen 1.
 */
export function readCampaignLocale(): CampaignLocale | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const rawLang = params.get("lang");
  const rawCountry = params.get("country");
  if (!rawLang && !rawCountry) return null;

  const lang = rawLang ? resolveLang(rawLang) : null;
  const country = rawCountry ? resolveCountryCode(rawCountry) : null;
  if (!lang && !country) return null;

  return {
    lang: lang ?? "es",
    country: country ?? "AR",
  };
}
