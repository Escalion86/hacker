import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'hacker.showConfig.v1.';

function normalizeCode(code) {
  return String(code || '').trim().toLowerCase();
}

function getCacheKey(code) {
  return `${CACHE_PREFIX}${normalizeCode(code)}`;
}

export async function loadCachedShowConfig(code) {
  const normalized = normalizeCode(code);
  if (!normalized) return null;

  try {
    const raw = await AsyncStorage.getItem(getCacheKey(normalized));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.config) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveCachedShowConfig(code, config) {
  const normalized = normalizeCode(code);
  if (!normalized) return;

  const payload = {
    code: normalized,
    savedAt: new Date().toISOString(),
    config,
  };

  await AsyncStorage.setItem(getCacheKey(normalized), JSON.stringify(payload));
}

export async function clearCachedShowConfig(code) {
  const normalized = normalizeCode(code);
  if (!normalized) return;
  await AsyncStorage.removeItem(getCacheKey(normalized));
}
