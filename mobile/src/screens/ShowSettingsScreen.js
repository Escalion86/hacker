import React, { useMemo, useRef, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import bleService from '../services/ble/bleService'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import {
  buildCardCode,
  resolvePhoneModelByAccessCode,
  resolveProfile,
} from '../show/accessProfiles'
import { resolveTemplate } from '../show/templates'
import { colors, spacing } from '../theme/tokens'
import SamsungOneUi8ModelShowScreen from './show/phoneModels/samsungOneUi8/SamsungOneUi8ModelShowScreen'
import OnePlusModelShowScreen from './show/phoneModels/onePlus/OnePlusModelShowScreen'
import HuaweiModelShowScreen from './show/phoneModels/huawei/HuaweiModelShowScreen'

function RowIcon({ kind, color }) {
  const tint = color || '#7f8aa3'
  if (kind === 'wifi') return <Ionicons name="wifi" size={14} color="#fff" />
  if (kind === 'bluetooth')
    return <MaterialCommunityIcons name="bluetooth" size={14} color="#fff" />
  if (kind === 'sim')
    return <MaterialCommunityIcons name="sim" size={14} color="#fff" />
  if (kind === 'share')
    return <Ionicons name="share-social" size={14} color="#fff" />
  if (kind === 'palette')
    return <Ionicons name="color-palette" size={14} color="#fff" />
  if (kind === 'home') return <Ionicons name="home" size={14} color="#fff" />
  if (kind === 'brightness')
    return <Ionicons name="sunny" size={14} color="#fff" />
  if (kind === 'sound')
    return <Ionicons name="volume-high" size={14} color="#fff" />
  if (kind === 'notifications')
    return <Ionicons name="notifications" size={14} color="#fff" />
  if (kind === 'account')
    return <Ionicons name="person" size={14} color="#fff" />
  if (kind === 'connections')
    return (
      <MaterialCommunityIcons
        name="access-point-network"
        size={14}
        color="#fff"
      />
    )
  if (kind === 'devices')
    return <Ionicons name="phone-portrait" size={14} color="#fff" />
  if (kind === 'modes') return <Ionicons name="moon" size={14} color="#fff" />
  if (kind === 'call') return <Ionicons name="call" size={14} color="#fff" />
  if (kind === 'nfc')
    return (
      <MaterialCommunityIcons
        name="contactless-payment-circle-outline"
        size={14}
        color="#fff"
      />
    )
  if (kind === 'radar')
    return <MaterialCommunityIcons name="radar" size={14} color="#fff" />
  if (kind === 'magic')
    return <Ionicons name="sparkles" size={14} color="#fff" />
  return <Text style={styles.rowIconFallback}>•</Text>
}

function Row({ row, ui, onPress, onSwipeStart, onSwipeEnd, onSegmentTouch }) {
  const widthRef = useRef(1)
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onSwipeStart}
      onPressOut={onSwipeEnd}
      onLayout={(event) => {
        widthRef.current = Math.max(1, event.nativeEvent.layout.width)
      }}
      onTouchStart={(event) => {
        if (!row.segmented || !onSegmentTouch) return
        const locationX = event.nativeEvent.locationX
        const segmentWidth = widthRef.current / 4
        const segment = Math.max(
          0,
          Math.min(3, Math.floor(locationX / segmentWidth)),
        )
        onSegmentTouch(segment)
      }}
      style={[
        styles.row,
        { minHeight: ui.rowMinHeight, paddingVertical: ui.rowPaddingY },
        row.highlight && [
          styles.rowHighlight,
          { backgroundColor: ui.rowHighlightBg },
        ],
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: row.iconColor || '#3b4252' },
        ]}
      >
        <RowIcon kind={row.icon} color={row.iconColor} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowTitle, { fontSize: ui.rowTitleSize }]}>
          {row.title}
        </Text>
        {row.subtitle ? (
          <Text style={[styles.rowSubtitle, { fontSize: ui.rowSubtitleSize }]}>
            {row.subtitle}
          </Text>
        ) : null}
      </View>
      <Text style={styles.rowArrow}>{row.nav ? '>' : ''}</Text>
    </Pressable>
  )
}

export default function ShowSettingsScreen({
  settings,
  onChange,
  onOpenSettings,
}) {
  const [accessCodeInput, setAccessCodeInput] = useState(
    settings.accessCode || '',
  )
  const [wrongCode, setWrongCode] = useState(false)
  const [page, setPage] = useState('general')
  const [wifiSpots, setWifiSpots] = useState([])
  const swipeStartY = useRef(0)
  const swipeRowMeta = useRef(null)
  const phoneModel =
    String(settings.phoneModel || '').trim() ||
    resolvePhoneModelByAccessCode(settings.accessCode)

  const profile = useMemo(
    () => resolveProfile(settings.accessCode),
    [settings.accessCode],
  )
  const template = useMemo(
    () => resolveTemplate(phoneModel || settings.accessCode),
    [phoneModel, settings.accessCode],
  )
  const currentPage = template?.pages?.[page]
  const ui = template?.ui || {
    titleSize: 30,
    headerGap: 4,
    search: true,
    blockRadius: 16,
    rowMinHeight: 56,
    rowPaddingY: 8,
    rowTitleSize: 15,
    rowSubtitleSize: 12,
    blockSpacing: 8,
    pageBg: colors.bg,
    cardBg: colors.card,
    rowHighlightBg: '#1a202d',
    searchBg: '#171b24',
  }

  const cardCode = useMemo(
    () => buildCardCode(settings.cardRankIndex, settings.cardMastIndex),
    [settings.cardRankIndex, settings.cardMastIndex],
  )

  React.useEffect(() => {
    if (
      phoneModel === 'samsungOneUi8' ||
      phoneModel === 'onePlus' ||
      phoneModel === 'huawei'
    ) {
      return () => {}
    }

    const unsub = bleService.subscribeWifiSpots((spots) =>
      setWifiSpots(spots.slice(0, 12)),
    )
    return () => unsub()
  }, [phoneModel])

  if (phoneModel === 'samsungOneUi8') {
    return (
      <View style={styles.escalionWrap}>
        <SamsungOneUi8ModelShowScreen
          settings={settings}
          onChange={onChange}
          onOpenSettings={onOpenSettings}
        />
      </View>
    )
  }

  if (phoneModel === 'onePlus') {
    return (
      <View style={styles.escalionWrap}>
        <OnePlusModelShowScreen
          settings={settings}
          onChange={onChange}
          onOpenSettings={onOpenSettings}
        />
      </View>
    )
  }

  if (phoneModel === 'huawei') {
    return (
      <View style={styles.escalionWrap}>
        <HuaweiModelShowScreen
          settings={settings}
          onChange={onChange}
          onOpenSettings={onOpenSettings}
        />
      </View>
    )
  }

  const applyAccessCode = () => {
    const normalized = accessCodeInput.trim()
    const profile = resolveProfile(normalized)
    if (!profile) {
      setWrongCode(true)
      return
    }
    onChange({
      accessCode: normalized,
      phoneModel: profile.phoneModel || '',
      mode: 'card',
    })
    setWrongCode(false)
    setPage('general')
  }

  const shiftRank = (delta) => {
    const next = (settings.cardRankIndex + delta + 14) % 14
    onChange({ cardRankIndex: next })
  }

  const handleRowPress = (row) => {
    if (Number.isFinite(row.suitBase)) {
      const rank = Math.min(13, row.suitBase)
      onChange({ cardRankIndex: rank })
      return
    }
    if (row.nav) {
      setPage(row.nav)
      return
    }
  }

  const handleSwipeStart = (row, event) => {
    if (!row.mastSelector) return
    swipeRowMeta.current = row
    swipeStartY.current = event.nativeEvent.pageY
  }

  const handleSwipeEnd = (event) => {
    if (!swipeRowMeta.current) return
    const deltaY = event.nativeEvent.pageY - swipeStartY.current
    swipeRowMeta.current = null
    if (deltaY <= -18) shiftRank(1)
    if (deltaY >= 18) shiftRank(-1)
  }

  const handleSegmentTouch = (row, segment) => {
    if (row.mastSelector) {
      onChange({ cardMastIndex: segment })
      return
    }
    if (Number.isFinite(row.suitBase)) {
      onChange({ cardRankIndex: Math.min(13, row.suitBase + segment) })
    }
  }

  if (!profile || !template) {
    return (
      <View style={[styles.container, { backgroundColor: ui.pageBg }]}>
        <Text style={styles.title}>Код доступа</Text>
        <View style={[styles.card, { backgroundColor: ui.cardBg }]}>
          <Text style={styles.label}>Введите персональный код</Text>
          <TextInput
            value={accessCodeInput}
            onChangeText={(value) => {
              setAccessCodeInput(value)
              if (wrongCode) setWrongCode(false)
            }}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
          <Pressable style={styles.actionButton} onPress={applyAccessCode}>
            <Text style={styles.actionText}>Войти</Text>
          </Pressable>
          {wrongCode ? (
            <Text style={styles.errorText}>Код неверный</Text>
          ) : null}
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: ui.pageBg }]}>
      <View style={[styles.header, { gap: ui.headerGap }]}>
        <Text style={[styles.title, { fontSize: ui.titleSize }]}>
          {currentPage?.title || template.generalTitle}
        </Text>
        <Text style={styles.profileText}>{profile.name}</Text>
        {settings.learn ? (
          <Text style={styles.learnText}>Карта: {cardCode}</Text>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { gap: ui.blockSpacing }]}
      >
        {page === 'general' && ui.search ? (
          <View style={[styles.searchBox, { backgroundColor: ui.searchBg }]}>
            <Text style={styles.searchText}>Поиск</Text>
          </View>
        ) : null}
        {currentPage?.sections?.map((section, sectionIndex) => (
          <View
            key={`section-${sectionIndex}`}
            style={[
              styles.block,
              { borderRadius: ui.blockRadius, backgroundColor: ui.cardBg },
            ]}
          >
            {section.title ? (
              <Text style={styles.blockTitle}>{section.title}</Text>
            ) : null}
            {section.rows.map((row, rowIndex) => (
              <Row
                key={`${sectionIndex}-${row.title}-${rowIndex}`}
                row={row}
                ui={ui}
                onPress={() => handleRowPress(row)}
                onSwipeStart={(event) => handleSwipeStart(row, event)}
                onSwipeEnd={handleSwipeEnd}
                onSegmentTouch={(segment) => handleSegmentTouch(row, segment)}
              />
            ))}
            {page === 'wifi' && section.title === 'Доступные сети'
              ? wifiSpots
                  .filter((spot) => spot && spot.trim() !== '')
                  .map((spot, index) => (
                    <Row
                      key={`wifi-spot-${index}-${spot}`}
                      row={{
                        title: spot,
                        subtitle: '',
                        icon: 'wifi',
                        iconColor: '#2b8cff',
                      }}
                      ui={ui}
                      onPress={() => {}}
                    />
                  ))
              : null}
          </View>
        ))}
        {page !== 'general' ? (
          <Pressable
            style={styles.backButton}
            onPress={() => setPage('general')}
          >
            <Text style={styles.backText}>Назад в Настройки</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      {settings.learn && currentPage?.hint ? (
        <View style={styles.learnHintBar}>
          <Text style={styles.learnHintText}>{currentPage.hint}</Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  escalionWrap: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  profileText: {
    color: colors.muted,
    fontSize: 13,
  },
  learnText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.sm,
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
  actionButton: {
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
  },
  errorText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 13,
  },
  block: {
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  searchBox: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#171b24',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  searchText: {
    color: colors.muted,
    fontSize: 13,
  },
  blockTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  row: {
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowHighlight: {
    backgroundColor: '#1a202d',
  },
  rowTextWrap: {
    flex: 1,
    gap: 2,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconFallback: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  rowTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  rowSubtitle: {
    color: colors.muted,
    fontSize: 12,
  },
  rowArrow: {
    color: colors.muted,
    fontWeight: '700',
  },
  backButton: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: {
    color: colors.accent,
    fontWeight: '700',
  },
  learnHintBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: 'rgba(17,19,26,0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'center',
  },
  learnHintText: {
    color: '#d6d8de',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
})
