import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultSettings, loadSettings, saveSettings } from './settingsStorage';

const SettingsContext = createContext({
  loading: true,
  settings: defaultSettings,
  updateSettings: () => {},
});

export function SettingsProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    let mounted = true;
    loadSettings().then((loaded) => {
      if (!mounted) return;
      setSettings(loaded);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({ loading, settings, updateSettings }), [loading, settings, updateSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
