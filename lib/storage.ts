const PREFIX = "chef_ai_";

const KEYS = {
  language: `${PREFIX}language`,
  country: `${PREFIX}country`,
  theme: `${PREFIX}theme`,
  lastPreferences: `${PREFIX}last_preferences`,
  lastResult: `${PREFIX}last_result`,
  favorites: `${PREFIX}favorites`,
} as const;

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export const storage = {
  keys: KEYS,
  getString(key: string): string | null {
    return safeGet(key);
  },
  setString(key: string, value: string) {
    safeSet(key, value);
  },
  getJSON<T>(key: string): T | null {
    const raw = safeGet(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setJSON(key: string, value: unknown) {
    safeSet(key, JSON.stringify(value));
  },
};
