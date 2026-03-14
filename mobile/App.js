import React, { useEffect, useRef, useState } from 'react';
import { Platform, SafeAreaView, StatusBar as RNStatusBar, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BottomTabs from './src/components/BottomTabs';
import AccessCodeGateScreen from './src/screens/AccessCodeGateScreen';
import ControlScreen from './src/screens/ControlScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ShowSettingsScreen from './src/screens/ShowSettingsScreen';
import bleService from './src/services/ble/bleService';
import configService from './src/services/config/configService';
import { cacheAvatarLocally } from './src/services/config/avatarCache';
import { SettingsProvider, useSettings } from './src/state/SettingsContext';
import { colors } from './src/theme/tokens';
import {
  buildCardCode,
  resolvePhoneModelByAccessCode,
  resolvePhoneModelByTemplateId,
} from './src/show/accessProfiles';

function AppContent() {
  const systemScheme = useColorScheme();
  const [tab, setTab] = useState('show');
  const [bleConnected, setBleConnected] = useState(bleService.isConnected());
  const [bluetoothOn, setBluetoothOn] = useState(bleService.isBluetoothPoweredOn());
  const [bleStatus, setBleStatus] = useState('Отключено');
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState('');
  const [configSyncStatus, setConfigSyncStatus] = useState('');
  const [resolvedAccessCode, setResolvedAccessCode] = useState('');
  const { loading, settings, updateSettings } = useSettings();
  const reconnectIntervalRef = useRef(null);
  const topInset = Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0;
  const bottomInset = Platform.OS === 'android' ? 56 : 0;
  const normalizedCode = (settings.accessCode || '').trim().toLowerCase();
  const effectiveAccessCode = resolvedAccessCode || normalizedCode;
  const effectivePhoneModel =
    (settings.phoneModel || '').trim() ||
    resolvePhoneModelByAccessCode(effectiveAccessCode);
  const hasValidCode = Boolean(effectiveAccessCode && effectivePhoneModel);
  const learnCardCode = buildCardCode(settings.cardRankIndex, settings.cardMastIndex);
  const showScreenBottomPadding =
    tab === 'show' &&
    (effectivePhoneModel === 'onePlus' || effectivePhoneModel === 'huawei')
      ? 0
      : bottomInset;
  const showScreenBg = effectivePhoneModel === 'huawei' ? '#eceef1' : '#000';
  const appSurfaceBg = tab === 'show' ? showScreenBg : colors.bg;
  const statusBarStyle =
    tab === 'show'
      ? effectivePhoneModel === 'huawei'
        ? 'dark'
        : 'light'
      : systemScheme === 'dark'
        ? 'light'
        : 'dark';

  const getBleDotColor = () => {
    if (!bluetoothOn) return '#2f76ff';
    if (String(bleStatus || '').startsWith('Ошибка')) return '#ff4d4f';
    if (
      String(bleStatus || '').startsWith('Идет транс') ||
      bleStatus === 'Команда start подтверждена'
    ) {
      return '#34c759';
    }
    if (bleConnected) return '#8a8a8a';
    return '#2f76ff';
  };

  const resolveCodeAndLoadConfig = async (inputCode) => {
    const code = String(inputCode || '').trim().toLowerCase();
    if (!code) return false;

    setConfigLoading(true);
    setConfigError('');
    setConfigSyncStatus('');

    try {
      const result = await configService.resolveConfigByCode(code);
      const templateId = String(result?.config?.templateId || '').trim().toLowerCase();
      const targetCode = code;
      const phoneModel =
        resolvePhoneModelByTemplateId(templateId) ||
        resolvePhoneModelByAccessCode(targetCode) ||
        resolvePhoneModelByAccessCode(code);
      const operatorName = String(result?.config?.ui?.operatorName || '').trim();
      const operatorAvatarRemote = String(result?.config?.ui?.operatorAvatarUrl || '').trim();
      const templateTitle = String(result?.config?.ui?.templateTitle || '').trim();
      const cachedAvatarLocal = await cacheAvatarLocally(operatorAvatarRemote);

      let operatorAvatar = '';
      if (!operatorAvatarRemote) {
        operatorAvatar = '';
      } else if (cachedAvatarLocal) {
        operatorAvatar = cachedAvatarLocal;
      } else if (
        settings.showOperatorAvatar &&
        settings.showOperatorAvatarRemote &&
        settings.showOperatorAvatarRemote === operatorAvatarRemote
      ) {
        // Offline fallback: keep previously cached local file path.
        operatorAvatar = settings.showOperatorAvatar;
      } else {
        // Last resort for first run if download failed.
        operatorAvatar = operatorAvatarRemote;
      }

      if (!phoneModel) {
        throw new Error(`Модель UI для кода "${targetCode}" не поддерживается в текущей сборке`);
      }

      setResolvedAccessCode(targetCode);
      updateSettings({
        accessCode: targetCode,
        phoneModel,
        showOperatorName: operatorName,
        showOperatorAvatar: operatorAvatar,
        showOperatorAvatarRemote: operatorAvatarRemote,
        showTemplateTitle: templateTitle,
      });
      setConfigSyncStatus(
        result.source === 'cache'
          ? 'Show UI обновлен из локального кэша'
          : 'Show UI обновлен с сервера',
      );
      return true;
    } catch (error) {
      setResolvedAccessCode('');
      const message = String(error?.message || 'Не удалось загрузить конфигурацию экрана');
      setConfigError(message);
      setConfigSyncStatus(message);
      return false;
    } finally {
      setConfigLoading(false);
    }
  };

  const resetActivation = async () => {
    setResolvedAccessCode('');
    setConfigError('');
    setConfigSyncStatus('');
    try {
      await bleService.disconnect();
    } catch {}
    updateSettings({
      accessCode: '',
      phoneModel: '',
      showOperatorName: '',
      showOperatorAvatar: '',
      showOperatorAvatarRemote: '',
      showTemplateTitle: '',
    });
    setTab('show');
  };

  useEffect(() => {
    const unsub = bleService.subscribeConnection((nextConnected) => {
      setBleConnected(nextConnected);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = bleService.subscribeBluetoothState((nextState) => {
      setBluetoothOn(nextState === 'PoweredOn');
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
    if (!normalizedCode) {
      setResolvedAccessCode('');
      setConfigError('');
      return;
    }
    resolveCodeAndLoadConfig(normalizedCode).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedCode]);

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
      <SafeAreaView style={[styles.safe, { backgroundColor: '#000' }]}>
        <StatusBar style="light" />
        <View style={[styles.main, { paddingTop: topInset, backgroundColor: '#000' }]}>
          <AccessCodeGateScreen
            loading={configLoading}
            serverError={configError}
            onSubmit={async (code) => {
              const ok = await resolveCodeAndLoadConfig(code);
              if (!ok) return false;
              setTab('show');
              return true;
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: appSurfaceBg }]}>
      <StatusBar style={statusBarStyle} />
      <View
        style={[
          styles.main,
          {
            backgroundColor: appSurfaceBg,
            paddingTop: topInset,
            paddingBottom: tab === 'show' ? showScreenBottomPadding : 0,
          },
        ]}
      >
        {hasValidCode && (!bluetoothOn || bleConnected || String(bleStatus || '').startsWith('Ошибка')) ? (
          <View
            pointerEvents="none"
            style={[
              styles.bleConnectedDot,
              {
                top: topInset + 2,
                backgroundColor: getBleDotColor(),
              },
            ]}
          />
        ) : null}
        {tab === 'show' && settings.learn ? (
          <View
            pointerEvents="none"
            style={[styles.learnCodeBadge, { top: topInset + 8 }]}
          >
            <Text style={styles.learnCodeText}>Код: {learnCardCode}</Text>
          </View>
        ) : null}
        {tab === 'control' ? (
          <ControlScreen settings={{ ...settings, accessCode: effectiveAccessCode }} />
        ) : tab === 'show' ? (
          <ShowSettingsScreen
            settings={{ ...settings, accessCode: effectiveAccessCode }}
            onChange={updateSettings}
            onOpenSettings={() => setTab('settings')}
          />
        ) : (
          <SettingsScreen
            settings={{ ...settings, accessCode: effectiveAccessCode }}
            onChange={updateSettings}
            onRefreshShowUi={() => resolveCodeAndLoadConfig(effectiveAccessCode)}
            refreshInProgress={configLoading}
            refreshStatus={configSyncStatus}
            onResetActivation={resetActivation}
          />
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
  learnCodeBadge: {
    position: 'absolute',
    left: 8,
    paddingHorizontal: 8,
    minHeight: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12,15,22,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 10000,
  },
  learnCodeText: {
    color: '#f6f8ff',
    fontSize: 12,
    fontWeight: '700',
  },
});
