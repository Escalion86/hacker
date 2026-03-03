import AsyncStorage from '@react-native-async-storage/async-storage';

export const SETTINGS_KEY = 'hacker.settings.v1';

export const defaultSettings = {
  accessCode: '',
  mode: 'word',
  wifi: 'Hacked',
  cardRankIndex: 0,
  cardMastIndex: 0,
  delay: 3,
  minutesBeforeStop: 3,
  dot: false,
  learn: false,
  startOnSetWiFiPage: false,
};

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return defaultSettings;
    }

    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(nextSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
}
