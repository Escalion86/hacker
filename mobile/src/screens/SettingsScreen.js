import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import Toggle from '../components/Toggle';
import { buildCardCode } from '../show/accessProfiles';
import { colors, spacing } from '../theme/tokens';

export default function SettingsScreen({
  settings,
  onChange,
  onRefreshShowUi,
  refreshInProgress,
  refreshStatus,
  onResetActivation,
}) {
  const parseNonNegativeInt = (value, fallback = 0) => {
    const parsed = Number.parseInt(String(value || '').trim(), 10);
    if (!Number.isFinite(parsed) || parsed < 0) return fallback;
    return parsed;
  };

  const formatCardPreview = (rawCode) => {
    const text = String(rawCode || '').trim();
    const match = text.match(/^(A|[2-9]|10|J|Q|K)([SHCD])$/);
    if (!match) return text;
    const suit =
      match[2] === 'S' ? '♠' :
      match[2] === 'H' ? '♥' :
      match[2] === 'C' ? '♣' :
      match[2] === 'D' ? '♦' : match[2];
    return `${match[1]} ${suit}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Настройки Hacker</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Режим</Text>
        <View style={styles.rowButtons}>
          <Text
            style={[styles.chip, settings.mode === 'word' ? styles.chipActive : styles.chipIdle]}
            onPress={() => onChange({ mode: 'word' })}
          >
            Слово
          </Text>
          <Text
            style={[styles.chip, settings.mode === 'card' ? styles.chipActive : styles.chipIdle]}
            onPress={() => onChange({ mode: 'card' })}
          >
            Карта
          </Text>
        </View>
      </View>

      {settings.mode === 'word' && (
        <View style={styles.card}>
          <Text style={styles.label}>Название точки</Text>
          <TextInput
            value={settings.wifi}
            onChangeText={(wifi) => onChange({ wifi })}
            placeholder="Hacked"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </View>
      )}

      {settings.mode === 'card' && (
        <View style={styles.card}>
          <Text style={styles.label}>Карта (из Show экрана)</Text>
          <Text style={styles.preview}>
            {formatCardPreview(buildCardCode(settings.cardRankIndex, settings.cardMastIndex))}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Задержка до старта (сек)</Text>
        <TextInput
          keyboardType="number-pad"
          value={String(settings.delay)}
          onChangeText={(text) => onChange({ delay: Number(text || 0) })}
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Автостоп (мин)</Text>
        <TextInput
          keyboardType="number-pad"
          value={String(settings.minutesBeforeStop)}
          onChangeText={(text) => onChange({ minutesBeforeStop: Number(text || 0) })}
          style={styles.input}
        />
      </View>

      <Toggle label="Добавлять точку в начале SSID" value={settings.dot} onToggle={() => onChange({ dot: !settings.dot })} />
      <Toggle
        label="Добавить второе слово"
        value={Boolean(settings.secondWordEnabled)}
        onToggle={() => onChange({ secondWordEnabled: !settings.secondWordEnabled })}
      />

      {settings.secondWordEnabled ? (
        <View style={styles.card}>
          <Text style={styles.label}>Второе слово</Text>
          <TextInput
            value={settings.secondWord}
            onChangeText={(secondWord) => onChange({ secondWord })}
            placeholder="SECOND"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Text style={styles.label}>Когда менять слово</Text>
          <View style={styles.rowButtons}>
            <Text
              style={[
                styles.chip,
                settings.secondWordTrigger === 'tap' ? styles.chipActive : styles.chipIdle,
              ]}
              onPress={() => onChange({ secondWordTrigger: 'tap' })}
            >
              По нажатию на Wi-Fi
            </Text>
            <Text
              style={[
                styles.chip,
                settings.secondWordTrigger === 'afterDelay' ? styles.chipActive : styles.chipIdle,
              ]}
              onPress={() => onChange({ secondWordTrigger: 'afterDelay' })}
            >
              После трансляции
            </Text>
          </View>

          <Text style={styles.label}>Задержка перед вторым словом (сек)</Text>
          <TextInput
            keyboardType="number-pad"
            value={String(settings.secondWordDelaySec ?? 0)}
            onChangeText={(text) =>
              onChange({ secondWordDelaySec: parseNonNegativeInt(text, 0) })
            }
            style={styles.input}
          />
        </View>
      ) : null}

      <Toggle
        label="Автозапуск при входе в Wi-Fi экран"
        value={settings.startOnSetWiFiPage}
        onToggle={() => onChange({ startOnSetWiFiPage: !settings.startOnSetWiFiPage })}
      />
      <Toggle label="Режим обучения" value={settings.learn} onToggle={() => onChange({ learn: !settings.learn })} />

      <View style={styles.card}>
        <Text style={styles.label}>Синхронизация Show UI</Text>
        <PrimaryButton
          title={refreshInProgress ? 'Обновление...' : 'Обновить Show UI'}
          onPress={onRefreshShowUi}
          disabled={refreshInProgress}
        />
        {refreshStatus ? (
          <Text style={styles.syncStatus}>{refreshStatus}</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Код доступа</Text>
        <PrimaryButton
          title="Сменить код доступа"
          danger
          onPress={onResetActivation}
        />
        <Text style={styles.syncStatus}>
          Сбросит текущую активацию и вернет на экран ввода кода.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: 120,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.sm,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    overflow: 'hidden',
    color: colors.text,
  },
  chipActive: {
    backgroundColor: colors.accent,
  },
  chipIdle: {
    backgroundColor: '#313948',
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    color: colors.text,
    backgroundColor: '#10131a',
  },
  preview: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  syncStatus: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
