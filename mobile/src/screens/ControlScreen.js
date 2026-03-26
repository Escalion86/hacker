import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import PrimaryButton from '../components/PrimaryButton';
import bleService from '../services/ble/bleService';
import { buildCardCode } from '../show/accessProfiles';
import { resolveWordFromActiveSet } from './show/shared/wordSets';
import { colors, spacing } from '../theme/tokens';

export default function ControlScreen({ settings }) {
  const [status, setStatus] = useState('Отключено');
  const [connected, setConnected] = useState(false);
  const [bluetoothOn, setBluetoothOn] = useState(bleService.isBluetoothPoweredOn());
  const [running, setRunning] = useState(false);
  const [wifiSpots, setWifiSpots] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [copiedAt, setCopiedAt] = useState(0);

  const normalizeDeviceStatus = (rawStatus) => {
    const cleaned = String(rawStatus || '').replace(/\uFFFD/g, '').trim();
    const lower = cleaned.toLowerCase();

    if (
      cleaned === 'Трансляция не ведется' ||
      lower.includes('не ведется') ||
      cleaned === 'Трансляция остановлена'
    ) {
      return 'Трансляция остановлена';
    }
    if (cleaned.startsWith('Идет транс') || lower.startsWith('идет транс')) {
      return 'Идет трансляция';
    }
    return cleaned || 'Отключено';
  };

  useEffect(() => {
    const unsubStatus = bleService.subscribeStatus((nextStatus) => {
      const normalizedStatus = normalizeDeviceStatus(nextStatus);
      setStatus(normalizedStatus);
      if (normalizedStatus.startsWith('Идет трансляция')) {
        setRunning(true);
      } else if (
        normalizedStatus === 'Трансляция остановлена' ||
        normalizedStatus === 'Отключено' ||
        normalizedStatus.startsWith('Ошибка')
      ) {
        setRunning(false);
      }
    });

    const unsubSpots = bleService.subscribeWifiSpots((spots) => setWifiSpots(spots));
    const unsubConnection = bleService.subscribeConnection((nextConnected) =>
      setConnected(nextConnected)
    );
    const unsubDiagnostics = bleService.subscribeDiagnostics((entries) =>
      setDiagnostics(entries)
    );
    const unsubBluetoothState = bleService.subscribeBluetoothState((nextState) =>
      setBluetoothOn(nextState === 'PoweredOn')
    );

    return () => {
      unsubStatus();
      unsubSpots();
      unsubConnection();
      unsubDiagnostics();
      unsubBluetoothState();
    };
  }, []);

  const targetSsid = useMemo(() => {
    if (settings.mode === 'card') {
      return buildCardCode(settings.cardRankIndex, settings.cardMastIndex);
    }
    if (settings.mode === 'wordSet') {
      const selected = resolveWordFromActiveSet(
        settings,
        settings.wordSetWordIndex,
      );
      return selected.word || settings.wifi || 'Hacked';
    }
    return settings.wifi || 'Hacked';
  }, [
    settings.mode,
    settings.wifi,
    settings.cardRankIndex,
    settings.cardMastIndex,
    settings.wordSetWordIndex,
    settings.wordSets,
    settings.selectedWordSetId,
  ]);

  const handleConnect = async () => {
    if (!bluetoothOn) return;
    try {
      await bleService.connect();
    } catch (error) {
      setStatus(`Ошибка подключения: ${error.message || 'unknown'}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await bleService.disconnect();
      setRunning(false);
    } catch (error) {
      setStatus(`Ошибка отключения: ${error.message || 'unknown'}`);
    }
  };

  const handleStart = async () => {
    if (!bluetoothOn) return;
    try {
      setRunning(true);
      await bleService.sendStart({
        ssid: targetSsid,
        dot: settings.dot,
        minutes: settings.minutesBeforeStop,
      });
    } catch (error) {
      setRunning(false);
      setStatus(`Ошибка start: ${error.message || 'unknown'}`);
    }
  };

  const handleStop = async () => {
    try {
      await bleService.sendStop();
      setRunning(false);
      setStatus('Трансляция остановлена');
    } catch (error) {
      setStatus(`Ошибка stop: ${error.message || 'unknown'}`);
    }
  };

  const handleCopyDiagnostics = async () => {
    const payload =
      diagnostics.length > 0
        ? diagnostics.join('\n')
        : 'BLE Diagnostics: empty';
    await Clipboard.setStringAsync(payload);
    setCopiedAt(Date.now());
  };

  const shownStatus = bluetoothOn ? status : 'Bluetooth не включен!';
  const shownStatusStyle = !bluetoothOn
    ? styles.disconnected
    : status.startsWith('Ошибка')
      ? styles.disconnected
      : running
        ? styles.connected
        : styles.inactive;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Управление устройством</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Статус:</Text>
        <Text
          style={[
            styles.statusValue,
            shownStatusStyle,
          ]}
        >
          {shownStatus}
        </Text>
      </View>

      <View style={styles.buttonsRow}>
        {!connected ? (
          <PrimaryButton title="Подключить" onPress={handleConnect} disabled={!bluetoothOn} />
        ) : (
          <PrimaryButton title="Отключить" onPress={handleDisconnect} danger />
        )}
      </View>

      <View style={styles.buttonsRow}>
        {!running ? (
          <PrimaryButton title="Старт трансляции" onPress={handleStart} disabled={!connected || !bluetoothOn} />
        ) : (
          <PrimaryButton title="Стоп" onPress={handleStop} danger />
        )}
      </View>

      <View style={styles.listWrap}>
        <Text style={styles.subTitle}>Доступные сети (preview)</Text>
        <FlatList
          data={wifiSpots}
          keyExtractor={(item, index) => `${item}-${index}`}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={styles.spotItem}>
              <Text style={styles.spotText}>{item}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Список пуст</Text>}
        />
      </View>

      <View style={styles.diagWrap}>
        <Text style={styles.subTitle}>BLE Diagnostics</Text>
        <View style={styles.copyButtonWrap}>
          <PrimaryButton title="Копировать BLE логи" onPress={handleCopyDiagnostics} />
        </View>
        {copiedAt > 0 ? <Text style={styles.copyHint}>Скопировано</Text> : null}
        {diagnostics.length === 0 ? (
          <Text style={styles.empty}>Событий пока нет</Text>
        ) : (
          diagnostics.slice(0, 8).map((entry, index) => (
            <Text key={`${entry}-${index}`} style={styles.diagItem}>
              {entry}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  subTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  statusCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    gap: 6,
  },
  statusLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  statusValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  connected: {
    color: colors.success,
  },
  inactive: {
    color: colors.muted,
  },
  disconnected: {
    color: colors.danger,
  },
  buttonsRow: {
    minHeight: 50,
  },
  listWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
  },
  diagWrap: {
    maxHeight: 170,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    gap: 4,
  },
  copyButtonWrap: {
    minHeight: 44,
    marginBottom: 4,
  },
  copyHint: {
    color: colors.success,
    fontSize: 12,
    marginBottom: 4,
  },
  diagItem: {
    color: colors.muted,
    fontSize: 12,
  },
  spotItem: {
    borderRadius: 10,
    padding: spacing.sm,
    backgroundColor: '#10131a',
    borderWidth: 1,
    borderColor: colors.border,
  },
  spotText: {
    color: colors.text,
  },
  empty: {
    color: colors.muted,
  },
});
