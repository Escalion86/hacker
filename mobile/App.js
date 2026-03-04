import React, { useEffect, useRef, useState } from 'react';
import { Platform, SafeAreaView, StatusBar as RNStatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BottomTabs from './src/components/BottomTabs';
import AccessCodeGateScreen from './src/screens/AccessCodeGateScreen';
import ControlScreen from './src/screens/ControlScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ShowSettingsScreen from './src/screens/ShowSettingsScreen';
import bleService from './src/services/ble/bleService';
import { SettingsProvider, useSettings } from './src/state/SettingsContext';
import { colors } from './src/theme/tokens';
import { resolveProfile } from './src/show/accessProfiles';

function AppContent() {
  const [tab, setTab] = useState('show');
  const [bleConnected, setBleConnected] = useState(bleService.isConnected());
  const [bleStatus, setBleStatus] = useState('Отключено');
  const { loading, settings, updateSettings } = useSettings();
  const reconnectIntervalRef = useRef(null);
  const topInset = Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0;
  const bottomInset = Platform.OS === 'android' ? 56 : 0;
  const normalizedCode = (settings.accessCode || '').trim();
  const hasValidCode = normalizedCode === 'escalion' && !!resolveProfile(normalizedCode);

  useEffect(() => {
    const unsub = bleService.subscribeConnection((nextConnected) => {
      setBleConnected(nextConnected);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = bleService.subscribeStatus((nextStatus) => {
      setBleStatus(String(nextStatus || ''));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!hasValidCode) return;

    const tryConnect = () => {
      bleService.connect().catch(() => {});
    };

    // Immediate attempt on app enter.
    tryConnect();

    // Keep retrying in background while device is unavailable/offline.
    reconnectIntervalRef.current = setInterval(() => {
      if (!bleService.isConnected()) {
        tryConnect();
      }
    }, 5000);

    return () => {
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
      }
    };
  }, [hasValidCode]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (!hasValidCode) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <View style={[styles.main, { paddingTop: topInset, backgroundColor: '#000' }]}>
          <AccessCodeGateScreen
            loading={false}
            onSubmit={(code) => {
              const normalized = code.trim();
              if (normalized !== 'escalion' || !resolveProfile(normalized)) {
                return false;
              }
              updateSettings({ accessCode: normalized });
              setTab('show');
              return true;
            }}
          />
        </View>
      </SafeAreaView>
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
        {(bleConnected || bleStatus.startsWith('Ошибка')) ? (
          <View
            pointerEvents="none"
            style={[
              styles.bleConnectedDot,
              {
                top: topInset + 2,
                backgroundColor:
                  bleStatus.startsWith('Ошибка')
                    ? '#ff4d4f'
                    : bleStatus.startsWith('Идет транс') || bleStatus === 'Команда start подтверждена'
                      ? '#34c759'
                      : '#8a8a8a',
              },
            ]}
          />
        ) : null}
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
  bleConnectedDot: {
    position: 'absolute',
    left: 2,
    width: 2,
    height: 2,
    backgroundColor: '#8a8a8a',
    zIndex: 9999,
  },
});
