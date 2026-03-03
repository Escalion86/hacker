import React, { useState } from 'react';
import { Platform, SafeAreaView, StatusBar as RNStatusBar, StyleSheet, Text, View } from 'react-native';
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
  const topInset = Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0;
  const bottomInset = Platform.OS === 'android' ? 56 : 0;

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
      <View
        style={[
          styles.main,
          {
            backgroundColor: tab === 'show' ? '#000' : colors.bg,
            paddingTop: topInset,
            paddingBottom: tab === 'show' ? bottomInset : 0,
          },
        ]}
      >
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
      {tab !== 'show' ? <BottomTabs tab={tab} setTab={setTab} bottomInset={bottomInset} /> : null}
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
    backgroundColor: colors.bg,
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
