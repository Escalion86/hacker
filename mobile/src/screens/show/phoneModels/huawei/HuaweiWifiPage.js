import React from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  randomLevel,
  useWifiBroadcastFlow,
} from '../../shared/useWifiBroadcastFlow'

function stableLevelFromSpot(spot, index) {
  const text = String(spot || '')
  let hash = index + 17
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 9973
  }
  return (hash % 4) + 1
}

function SwitchMock({ on }) {
  const translateX = React.useRef(new Animated.Value(on ? 17 : 0)).current

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: on ? 17 : 0,
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

function WifiSignal({ level = 4 }) {
  const safeLevel = Math.max(1, Math.min(4, level))
  const active = safeLevel >= 3 ? '#111317' : '#9498a0'
  return (
    <View style={styles.wifiSignalWrap}>
      <Ionicons name="wifi" size={22} color={active} />
      <Ionicons
        name="lock-closed"
        size={9}
        color="#111317"
        style={styles.wifiLock}
      />
    </View>
  )
}

function WifiRow({
  title,
  subtitle = 'Защищено',
  level = 4,
  noBorder = false,
  onPress,
  connected = false,
}) {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.wifiRow}>
        <View style={styles.wifiTextWrap}>
          <Text
            style={[styles.wifiName, connected && styles.wifiNameConnected]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.wifiSubtitle,
              connected && styles.wifiSubtitleConnected,
            ]}
          >
            {subtitle}
          </Text>
        </View>
        <WifiSignal level={level} />
      </View>
      {!noBorder ? <View style={styles.wifiRowDivider} /> : null}
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
}) {
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
          level: spot.level || randomLevel(),
        }))
      : shownSpots.map((spot, index) => ({
          key: `real-${index}-${spot}`,
          text: spot,
          level: stableLevelFromSpot(spot, index),
        }))

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setPage('general')}
          hitSlop={10}
          style={styles.headerBack}
        >
          <Ionicons name="arrow-back" size={31} color="#111318" />
        </Pressable>
        <Text style={styles.headerTitle}>Wi-Fi</Text>
        <Pressable hitSlop={10} style={styles.headerHelp}>
          <Ionicons name="help-circle-outline" size={30} color="#2a2d33" />
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
        <View style={styles.card}>
          <View style={styles.wifiToggleRow}>
            <Text style={styles.wifiToggleTitle}>Wi-Fi</Text>
            <Pressable onPress={onSwitchPress} hitSlop={10}>
              <SwitchMock on={wifiEnabled} />
            </Pressable>
          </View>
          <View style={styles.wifiRowDivider} />
          <Pressable style={styles.wifiHelperRow}>
            <Text style={styles.wifiHelperText}>Другие настройки</Text>
            <Ionicons name="chevron-forward" size={20} color="#c3c6cc" />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>ДОСТУПНО</Text>
        <View style={styles.card}>
          {spotsForView.length > 0 ? (
            spotsForView.map((spot, index, arr) => (
              <WifiRow
                key={spot.key}
                title={spot.text}
                level={spot.level}
                noBorder={index === arr.length - 1}
                onPress={handleWifiSpotPress}
              />
            ))
          ) : (
            <>
              <WifiRow title="Beeline_2G_A0AA0C" />
              <WifiRow title="TP-Link_1456" />
              <WifiRow title="WIFI" />
              <WifiRow title="Beeline_5G_F17476" noBorder />
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
    height: 60,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eceef1',
  },
  headerBack: {
    width: 44,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    color: '#181a1f',
    fontSize: 21,
    fontWeight: '500',
  },
  headerHelp: {
    width: 38,
    alignItems: 'flex-end',
  },
  scroll: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 14,
    gap: 8,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#f8f9fb',
  },
  wifiToggleRow: {
    minHeight: 66,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wifiToggleTitle: {
    color: '#181a1f',
    fontSize: 20,
    fontWeight: '400',
  },
  wifiHelperRow: {
    minHeight: 62,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wifiHelperText: {
    color: '#1a1d22',
    fontSize: 20,
    fontWeight: '400',
  },
  switchTrack: {
    width: 40,
    height: 24,
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
    width: 19,
    height: 19,
    borderRadius: 9.5,
    backgroundColor: '#f7f9fe',
  },
  sectionTitle: {
    color: '#6b707a',
    fontSize: 18,
    fontWeight: '500',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  wifiRow: {
    minHeight: 78,
    paddingHorizontal: 16,
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
    fontSize: 19,
    fontWeight: '400',
  },
  wifiNameConnected: {
    color: '#1f5eb8',
    fontWeight: '500',
  },
  wifiSubtitle: {
    marginTop: 2,
    color: '#646b76',
    fontSize: 16,
    fontWeight: '400',
  },
  wifiSubtitleConnected: {
    color: '#646b76',
  },
  wifiRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#dde1e7',
    marginHorizontal: 16,
  },
  wifiSignalWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wifiLock: {
    position: 'absolute',
    right: 1,
    bottom: 2,
  },
})
