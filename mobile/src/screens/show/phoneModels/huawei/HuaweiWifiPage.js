import React from 'react'
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useWifiBroadcastFlow } from '../../shared/useWifiBroadcastFlow'

const WIFI_SPOT_1 = require('../../../../icons/huawei/wifispot1.png')
const WIFI_SPOT_2 = require('../../../../icons/huawei/wifispot2.png')
const WIFI_SPOT_3 = require('../../../../icons/huawei/wifispot3.png')
const WIFI_SPOT_4 = require('../../../../icons/huawei/wifispot4.png')
const WIFI_SPOT_5 = require('../../../../icons/huawei/wifispot5.png')
const WIFI_SPOT_1_DARK = require('../../../../icons/huawei/wifispot1_BlackTheme.png')
const WIFI_SPOT_2_DARK = require('../../../../icons/huawei/wifispot2_BlackTheme.png')
const WIFI_SPOT_3_DARK = require('../../../../icons/huawei/wifispot3_BlackTheme.png')
const WIFI_SPOT_4_DARK = require('../../../../icons/huawei/wifispot4_BlackTheme.png')
const WIFI_SPOT_5_DARK = require('../../../../icons/huawei/wifispot5_BlackTheme.png')
const HUAWEI_BACK_ARROW = require('../../../../icons/huawei/ArrowBack.png')
const HUAWEI_BACK_ARROW_DARK = require('../../../../icons/huawei/ArrowBack_BlackTheme.png')

function clampSignalLevel(level) {
  const parsed = Number(level)
  if (!Number.isFinite(parsed)) return 3
  return Math.max(1, Math.min(5, Math.round(parsed)))
}

function randomHuaweiLevel() {
  return 1 + Math.floor(Math.random() * 5)
}

function resolveWifiSpotIcon(level, isLightTheme) {
  const safeLevel = clampSignalLevel(level)
  const spots = isLightTheme
    ? [WIFI_SPOT_1, WIFI_SPOT_2, WIFI_SPOT_3, WIFI_SPOT_4, WIFI_SPOT_5]
    : [
        WIFI_SPOT_1_DARK,
        WIFI_SPOT_2_DARK,
        WIFI_SPOT_3_DARK,
        WIFI_SPOT_4_DARK,
        WIFI_SPOT_5_DARK,
      ]
  return spots[safeLevel - 1] || spots[2]
}

function stableLevelFromSpot(spot, index) {
  const text = String(spot || '')
  let hash = index + 17
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 9973
  }
  return (hash % 5) + 1
}

function SwitchMock({ on }) {
  const translateX = React.useRef(new Animated.Value(on ? 15 : 0)).current

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: on ? 15 : 0,
      duration: 170,
      useNativeDriver: true,
    }).start()
  }, [on, translateX])

  return (
    <View
      style={[
        styles.switchTrack,
        on ? styles.switchTrackOn : styles.switchTrackOff,
      ]}
    >
      <Animated.View
        style={[
          styles.switchKnob,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  )
}

function WifiSignal({ level = 4, isLightTheme = true }) {
  const icon = resolveWifiSpotIcon(level, isLightTheme)
  return (
    <View style={styles.wifiSignalWrap}>
      <Image source={icon} style={styles.wifiSignalImage} />
    </View>
  )
}

function WifiRow({
  title,
  subtitle = '',
  level = 4,
  noBorder = false,
  onPress,
  connected = false,
  palette,
  isLightTheme = true,
}) {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.wifiRow}>
        <View style={styles.wifiTextWrap}>
          <Text
            style={[
              styles.wifiName,
              { color: connected ? palette.link : palette.textPrimary },
              connected && styles.wifiNameConnected,
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.wifiSubtitle,
              { color: palette.textSecondary },
              connected && styles.wifiSubtitleConnected,
            ]}
          >
            {subtitle}
          </Text>
        </View>
        <WifiSignal level={level} isLightTheme={isLightTheme} />
      </View>
      {!noBorder ? (
        <View style={[styles.wifiRowDivider, { borderBottomColor: palette.divider }]} />
      ) : null}
    </Pressable>
  )
}

export default function HuaweiWifiPage({
  setPage,
  scrollY,
  wifiSpots,
  settings,
  cardCode,
  wifiEnabled,
  onWifiEnabledChange,
  isLightTheme = true,
  copy,
}) {
  const text = copy?.wifi || {}
  const palette = isLightTheme
    ? {
        pageBg: '#eceef1',
        headerBg: '#eceef1',
        cardBg: '#f8f9fb',
        textPrimary: '#1a1d22',
        textSecondary: '#646b76',
        section: '#6b707a',
        divider: '#dde1e7',
        icon: '#2a2d33',
        link: '#1f5eb8',
      }
    : {
        pageBg: '#000',
        headerBg: '#000',
        cardBg: '#171719',
        textPrimary: '#f3f5fa',
        textSecondary: '#8f949e',
        section: '#8f949e',
        divider: '#2a2d36',
        icon: '#f3f5fa',
        link: '#4d86ff',
      }
  const { animatedSpots, onSwitchPress, handleWifiSpotPress } =
    useWifiBroadcastFlow({
      settings,
      cardCode,
      wifiSpots,
      wifiEnabled,
      onWifiEnabledChange,
    })

  const shownSpots = wifiSpots.filter((spot) => spot && spot.trim() !== '')
  const spotsForView =
    animatedSpots.length > 0
      ? animatedSpots.map((spot, index) => ({
          key: `anim-${index}`,
          text: spot.text,
          level: clampSignalLevel(spot.level || randomHuaweiLevel()),
        }))
      : shownSpots.map((spot, index) => ({
          key: `real-${index}-${spot}`,
          text: spot,
          level: clampSignalLevel(stableLevelFromSpot(spot, index)),
        }))
  const backArrowIcon = isLightTheme ? HUAWEI_BACK_ARROW : HUAWEI_BACK_ARROW_DARK

  return (
    <View style={[styles.page, { backgroundColor: palette.pageBg }]}>
      <View style={[styles.header, { backgroundColor: palette.headerBg }]}>
        <Pressable
          onPress={() => setPage('general')}
          hitSlop={10}
          style={styles.headerBack}
        >
          <Image source={backArrowIcon} style={styles.headerBackImage} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>{text.headerTitle}</Text>
        <Pressable hitSlop={10} style={styles.headerHelp}>
          <Ionicons name="help-circle-outline" size={27} color={palette.icon} />
        </Pressable>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: palette.cardBg }]}>
          <View style={styles.wifiToggleRow}>
            <Text style={[styles.wifiToggleTitle, { color: palette.textPrimary }]}>{text.toggleTitle}</Text>
            <Pressable onPress={onSwitchPress} hitSlop={10}>
              <SwitchMock on={wifiEnabled} />
            </Pressable>
          </View>
          <View style={[styles.wifiRowDivider, { borderBottomColor: palette.divider }]} />
          <Pressable style={styles.wifiHelperRow}>
            <Text style={[styles.wifiHelperText, { color: palette.textPrimary }]}>{text.otherSettingsTitle}</Text>
            <Ionicons name="chevron-forward" size={18} color={palette.section} />
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: palette.section }]}>{text.availableTitle}</Text>
        <View style={[styles.card, { backgroundColor: palette.cardBg }]}>
          {spotsForView.length > 0 ? (
            spotsForView.map((spot, index, arr) => (
              <WifiRow
                key={spot.key}
                title={spot.text}
                subtitle={text.protectedLabel}
                level={spot.level}
                noBorder={index === arr.length - 1}
                onPress={handleWifiSpotPress}
                palette={palette}
                isLightTheme={isLightTheme}
              />
            ))
          ) : (
            <>
              <WifiRow
                title="Beeline_2G_A0AA0C"
                subtitle={text.protectedLabel}
                palette={palette}
                isLightTheme={isLightTheme}
              />
              <WifiRow
                title="TP-Link_1456"
                subtitle={text.protectedLabel}
                palette={palette}
                isLightTheme={isLightTheme}
              />
              <WifiRow
                title="WIFI"
                subtitle={text.protectedLabel}
                palette={palette}
                isLightTheme={isLightTheme}
              />
              <WifiRow
                title="Beeline_5G_F17476"
                subtitle={text.protectedLabel}
                noBorder
                palette={palette}
                isLightTheme={isLightTheme}
              />
            </>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#eceef1',
  },
  header: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eceef1',
  },
  headerBack: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerBackImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerTitle: {
    flex: 1,
    color: '#181a1f',
    fontSize: 19,
    fontWeight: '500',
  },
  headerHelp: {
    width: 34,
    alignItems: 'flex-end',
  },
  scroll: {
    paddingHorizontal: 6,
    paddingTop: 4,
    paddingBottom: 0,
    gap: 6,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f8f9fb',
  },
  wifiToggleRow: {
    minHeight: 60,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wifiToggleTitle: {
    color: '#181a1f',
    fontSize: 18,
    fontWeight: '400',
  },
  wifiHelperRow: {
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wifiHelperText: {
    color: '#1a1d22',
    fontSize: 18,
    fontWeight: '400',
  },
  switchTrack: {
    width: 36,
    height: 22,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: '#1f6df7',
    borderColor: '#2b77fa',
  },
  switchTrackOff: {
    backgroundColor: '#d8dbe2',
    borderColor: '#c9ced9',
  },
  switchKnob: {
    position: 'absolute',
    left: 2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#f7f9fe',
  },
  sectionTitle: {
    color: '#6b707a',
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 14,
    marginTop: 8,
  },
  wifiRow: {
    minHeight: 70,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wifiTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  wifiName: {
    color: '#1a1d22',
    fontSize: 17,
    fontWeight: '500',
  },
  wifiNameConnected: {
    color: '#1f5eb8',
    fontWeight: '500',
  },
  wifiSubtitle: {
    marginTop: 2,
    color: '#646b76',
    fontSize: 14,
    fontWeight: '400',
  },
  wifiSubtitleConnected: {
    color: '#646b76',
  },
  wifiRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#dde1e7',
    marginHorizontal: 14,
  },
  wifiSignalWrap: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wifiSignalImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
})
