export type ClientCacheEntry<T> = {
  value: T;
  cachedAt: number;
};

export const CLIENT_CACHE_TTL = {
  operationalPage: 90 * 1000,
  userProfile: 5 * 60 * 1000,
};

const CACHE_PREFIX = "sistema-adm";

const canUseStorage = () => typeof window !== "undefined" && !!window.localStorage;

export const buildClientCacheKey = (...parts: Array<string | number | null | undefined>) =>
  [CACHE_PREFIX, ...parts.filter((part) => part !== null && part !== undefined && part !== "")]
    .join(":")
    .replace(/\s+/g, "-")
    .toLowerCase();

export function getCachedValue<T>(
  key: string,
  options?: { maxAgeMs?: number }
): T | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ClientCacheEntry<T>;

    if (!parsed || typeof parsed.cachedAt !== "number" || !("value" in parsed)) {
      window.localStorage.removeItem(key);
      return null;
    }

    if (options?.maxAgeMs && Date.now() - parsed.cachedAt > options.maxAgeMs) {
      window.localStorage.removeItem(key);
      return null;
    }

    return parsed.value;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function setCachedValue<T>(key: string, value: T) {
  if (!canUseStorage()) return;

  try {
    const payload: ClientCacheEntry<T> = {
      value,
      cachedAt: Date.now(),
    };

    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Cache é melhoria de UX. Falha de armazenamento não deve quebrar a tela.
  }
}

export function removeCachedValue(key: string) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // noop
  }
}
