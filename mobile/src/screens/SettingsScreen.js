import React from 'react'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import PrimaryButton from '../components/PrimaryButton'
import Toggle from '../components/Toggle'
import { buildCardCode, resolvePhoneModelByAccessCode } from '../show/accessProfiles'
import { getSettingsCopy } from './localization/settingsLocalization'
import { resolveModelLocale } from './show/shared/modelLocale'
import { colors, spacing } from '../theme/tokens'

export default function SettingsScreen({
  settings,
  onChange,
  onRefreshShowUi,
  refreshInProgress,
  refreshStatus,
  onResetActivation,
}) {
  const parseNonNegativeInt = (value, fallback = 0) => {
    const parsed = Number.parseInt(String(value || '').trim(), 10)
    if (!Number.isFinite(parsed) || parsed < 0) return fallback
    return parsed
  }

  const formatCardPreview = (rawCode) => {
    const text = String(rawCode || '').trim()
    const match = text.match(/^(A|[2-9]|10|J|Q|K)([SHCD])$/)
    if (!match) return text
    const suit =
      match[2] === 'S'
        ? '♠'
        : match[2] === 'H'
          ? '♥'
          : match[2] === 'C'
            ? '♣'
            : match[2] === 'D'
              ? '♦'
              : match[2]
    return `${match[1]} ${suit}`
  }
  const phoneModel =
    String(settings.phoneModel || '').trim() ||
    resolvePhoneModelByAccessCode(settings.accessCode)
  const locale = resolveModelLocale(settings, phoneModel || 'samsungOneUi8')
  const copy = getSettingsCopy(locale)

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{copy.title}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{copy.languageLabel}</Text>
        <View style={styles.rowButtons}>
          <Text
            style={[styles.chip, locale === 'ru' ? styles.chipActive : styles.chipIdle]}
            onPress={() => onChange({ showLocale: 'ru' })}
          >
            RU
          </Text>
          <Text
            style={[styles.chip, locale === 'de' ? styles.chipActive : styles.chipIdle]}
            onPress={() => onChange({ showLocale: 'de' })}
          >
            DE
          </Text>
          <Text
            style={[styles.chip, locale === 'en' ? styles.chipActive : styles.chipIdle]}
            onPress={() => onChange({ showLocale: 'en' })}
          >
            EN
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{copy.modeLabel}</Text>
        <View style={styles.rowButtons}>
          <Text
            style={[
              styles.chip,
              settings.mode === 'word' ? styles.chipActive : styles.chipIdle,
            ]}
            onPress={() => onChange({ mode: 'word' })}
          >
            {copy.modeWord}
          </Text>
          <Text
            style={[
              styles.chip,
              settings.mode === 'card' ? styles.chipActive : styles.chipIdle,
            ]}
            onPress={() => onChange({ mode: 'card' })}
          >
            {copy.modeCard}
          </Text>
        </View>
      </View>

      {settings.mode === 'word' && (
        <View style={styles.card}>
          <Text style={styles.label}>{copy.wifiNameLabel}</Text>
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
          <Text style={styles.label}>{copy.cardLabel}</Text>
          <Text style={styles.preview}>
            {formatCardPreview(
              buildCardCode(settings.cardRankIndex, settings.cardMastIndex),
            )}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>{copy.delayLabel}</Text>
        <TextInput
          keyboardType="number-pad"
          value={String(settings.delay)}
          onChangeText={(text) => onChange({ delay: Number(text || 0) })}
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{copy.autostopLabel}</Text>
        <TextInput
          keyboardType="number-pad"
          value={String(settings.minutesBeforeStop)}
          onChangeText={(text) =>
            onChange({ minutesBeforeStop: Number(text || 0) })
          }
          style={styles.input}
        />
      </View>

      <Toggle
        label={copy.dotToggle}
        value={settings.dot}
        onToggle={() => onChange({ dot: !settings.dot })}
      />
      <Toggle
        label={copy.secondWordToggle}
        value={Boolean(settings.secondWordEnabled)}
        onToggle={() =>
          onChange({ secondWordEnabled: !settings.secondWordEnabled })
        }
      />

      {settings.secondWordEnabled ? (
        <View style={styles.card}>
          <Text style={styles.label}>{copy.secondWordLabel}</Text>
          <TextInput
            value={settings.secondWord}
            onChangeText={(secondWord) => onChange({ secondWord })}
            placeholder="SECOND"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Text style={styles.label}>{copy.secondWordWhenLabel}</Text>
          <View style={styles.rowButtons}>
            <Text
              style={[
                styles.chip,
                settings.secondWordTrigger === 'tap'
                  ? styles.chipActive
                  : styles.chipIdle,
              ]}
              onPress={() => onChange({ secondWordTrigger: 'tap' })}
            >
              {copy.secondWordWhenTap}
            </Text>
            <Text
              style={[
                styles.chip,
                settings.secondWordTrigger === 'afterDelay'
                  ? styles.chipActive
                  : styles.chipIdle,
              ]}
              onPress={() => onChange({ secondWordTrigger: 'afterDelay' })}
            >
              {copy.secondWordWhenAfter}
            </Text>
          </View>

          <Text style={styles.label}>{copy.secondWordDelayLabel}</Text>
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
        label={copy.startOnWifiToggle}
        value={settings.startOnSetWiFiPage}
        onToggle={() =>
          onChange({ startOnSetWiFiPage: !settings.startOnSetWiFiPage })
        }
      />
      <Toggle
        label={copy.learnToggle}
        value={settings.learn}
        onToggle={() => onChange({ learn: !settings.learn })}
      />

      <View style={styles.card}>
        <Text style={styles.label}>{copy.showUiLabel}</Text>
        <Text style={styles.label}>{copy.themeLabel}</Text>
        <View style={styles.rowButtons}>
          <Text
            style={[
              styles.chip,
              settings.uiThemeMode === 'model'
                ? styles.chipActive
                : styles.chipIdle,
            ]}
            onPress={() => onChange({ uiThemeMode: 'model' })}
          >
            {copy.themeModel}
          </Text>
          <Text
            style={[
              styles.chip,
              settings.uiThemeMode === 'dark'
                ? styles.chipActive
                : styles.chipIdle,
            ]}
            onPress={() => onChange({ uiThemeMode: 'dark' })}
          >
            {copy.themeDark}
          </Text>
          <Text
            style={[
              styles.chip,
              settings.uiThemeMode === 'light'
                ? styles.chipActive
                : styles.chipIdle,
            ]}
            onPress={() => onChange({ uiThemeMode: 'light' })}
          >
            {copy.themeLight}
          </Text>
        </View>
        <Text style={styles.label}>{copy.syncLabel}</Text>
        <PrimaryButton
          title={refreshInProgress ? copy.refreshBusy : copy.refreshIdle}
          onPress={onRefreshShowUi}
          disabled={refreshInProgress}
        />
        {refreshStatus ? (
          <Text style={styles.syncStatus}>{refreshStatus}</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{copy.accessCodeLabel}</Text>
        <PrimaryButton
          title={copy.resetAccess}
          danger
          onPress={onResetActivation}
        />
        <Text style={styles.syncStatus}>{copy.resetHint}</Text>
      </View>
    </ScrollView>
  )
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
    maxHeight: 40,
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
})
