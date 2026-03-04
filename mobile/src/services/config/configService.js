import Constants from 'expo-constants';
import { loadCachedShowConfig, saveCachedShowConfig } from './configStorage';
import { validateShowConfigPayload } from './configSchema';

const REQUEST_TIMEOUT_MS = 8000;

function normalizeCode(code) {
  return String(code || '').trim().toLowerCase();
}

function getApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_CONFIG_API_BASE_URL;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim().replace(/\/+$/, '');

  const fromExtra = Constants?.expoConfig?.extra?.configApiBaseUrl;
  if (typeof fromExtra === 'string' && fromExtra.trim()) {
    return fromExtra.trim().replace(/\/+$/, '');
  }

  return '';
}

async function fetchRemoteConfig(code) {
  const apiBase = getApiBaseUrl();
  if (!apiBase) {
    throw new Error(
      'Не задан EXPO_PUBLIC_CONFIG_API_BASE_URL (или expo.extra.configApiBaseUrl) для загрузки экранов',
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `${apiBase}/show-config?code=${encodeURIComponent(code)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Сервер вернул ${response.status}`);
    }

    const payload = await response.json();
    const validated = validateShowConfigPayload(payload);
    if (!validated.ok) {
      throw new Error(validated.error);
    }

    return validated.value;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function resolveConfigByCode(rawCode) {
  const code = normalizeCode(rawCode);
  if (!code) throw new Error('Код доступа пустой');

  const cached = await loadCachedShowConfig(code);

  try {
    const remoteConfig = await fetchRemoteConfig(code);
    await saveCachedShowConfig(code, remoteConfig);
    return {
      source: 'remote',
      config: remoteConfig,
    };
  } catch (error) {
    if (cached?.config) {
      return {
        source: 'cache',
        config: cached.config,
      };
    }

    throw error;
  }
}

export default {
  resolveConfigByCode,
};
