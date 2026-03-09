import AsyncStorage from "@react-native-async-storage/async-storage";

type CachedSnapshot<T> = {
  updatedAt: string;
  value: T;
};

const CACHE_PREFIX = "@finosync/offline:";

function getCacheKey(key: string) {
  return `${CACHE_PREFIX}${key}`;
}

export async function loadSnapshot<T>(
  key: string,
): Promise<CachedSnapshot<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(getCacheKey(key));
    if (!raw) return null;

    return JSON.parse(raw) as CachedSnapshot<T>;
  } catch (error) {
    console.warn(`Failed to load cached snapshot for ${key}`, error);
    return null;
  }
}

export async function saveSnapshot<T>(
  key: string,
  value: T,
): Promise<CachedSnapshot<T>> {
  const snapshot: CachedSnapshot<T> = {
    updatedAt: new Date().toISOString(),
    value,
  };

  try {
    await AsyncStorage.setItem(getCacheKey(key), JSON.stringify(snapshot));
  } catch (error) {
    console.warn(`Failed to save cached snapshot for ${key}`, error);
  }

  return snapshot;
}

export type { CachedSnapshot };
