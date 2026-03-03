import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BottomTabs from './src/components/BottomTabs';
import ControlScreen from './src/screens/ControlScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ShowSettingsScreen from './src/screens/ShowSettingsScreen';
import { SettingsProvider, useSettings } from './src/state/SettingsContext';
import { colors } from './src/theme/tokens';

function AppContent() {
  const [tab, setTab] = useState('control');
  const { loading, settings, updateSettings } = useSettings();

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.main}>
        {tab === 'control' ? (
          <ControlScreen settings={settings} />
        ) : tab === 'show' ? (
          <ShowSettingsScreen
            settings={settings}
            onChange={updateSettings}
            onOpenSettings={() => setTab('settings')}
          />
        ) : (
          <SettingsScreen settings={settings} onChange={updateSettings} />
        )}
      </View>
      {tab !== 'show' ? <BottomTabs tab={tab} setTab={setTab} /> : null}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  main: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.text,
  },
});
