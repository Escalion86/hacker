import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeWordSets } from '../screens/show/shared/wordSets';

export const SETTINGS_KEY = 'hacker.settings.v1';

export const defaultSettings = {
  accessCode: '',
  phoneModel: '',
  showLocale: '',
  uiThemeMode: 'model',
  mode: 'word',
  wifi: 'Hacked',
  wordSets: [],
  selectedWordSetId: '',
  wordSetWordIndex: 0,
  secondWordEnabled: false,
  secondWord: '',
  secondWordTrigger: 'tap',
  secondWordDelaySec: 0,
  cardRankIndex: 0,
  cardMastIndex: 0,
  delay: 3,
  minutesBeforeStop: 3,
  dot: false,
  learn: false,
  startOnSetWiFiPage: false,
  showTemplateTitle: '',
  showOperatorName: '',
  showOperatorAvatar: '',
  showOperatorAvatarRemote: '',
};

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return defaultSettings;
    }

    const parsed = JSON.parse(raw);
    const merged = { ...defaultSettings, ...parsed };
    const wordSets = normalizeWordSets(merged.wordSets);
    const selectedWordSetId =
      wordSets.find((item) => item.id === merged.selectedWordSetId)?.id || '';
    const wordSetWordIndex = Number.isFinite(Number(merged.wordSetWordIndex))
      ? Math.max(0, Math.floor(Number(merged.wordSetWordIndex)))
      : 0;

    return {
      ...merged,
      wordSets,
      selectedWordSetId,
      wordSetWordIndex,
    };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(nextSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
}
