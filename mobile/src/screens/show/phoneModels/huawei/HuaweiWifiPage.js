import React from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { randomLevel, useWifiBroadcastFlow } from '../../shared/useWifiBroadcastFlow'

function stableLevelFromSpot(spot, index) {
  const text = String(spot || '')
  let hash = index + 17
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 9973
  }
  return (hash % 4) + 1
}

function SwitchMock({ on }) {
  const translateX = React.useRef(new Animated.Value(on ? 18 : 0)).current

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: on ? 18 : 0,
      duration: 170,
      useNativeDriver: true,
    }).start()
  }, [on, translateX])

  return (
    <View style={[styles.switchTrack, on ? styles.switchTrackOn : styles.switchTrackOff]}>
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
      <Ionicons name="wifi" size={24} color={active} />
      <MaterialCommunityIcons
        name="lock"
        size={11}
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
          <Text style={[styles.wifiName, connected && styles.wifiNameConnected]}>
            {title}
          </Text>
          <Text style={[styles.wifiSubtitle, connected && styles.wifiSubtitleConnected]}>
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
        <Pressable onPress={() => setPage('general')} hitSlop={10} style={styles.headerBack}>
          <Ionicons name="arrow-back" size={34} color="#111318" />
        </Pressable>
        <Text style={styles.headerTitle}>Wi-Fi</Text>
        <Pressable hitSlop={10} style={styles.headerHelp}>
          <Ionicons name="help-circle-outline" size={34} color="#2a2d33" />
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
            <Ionicons name="chevron-forward" size={22} color="#c3c6cc" />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>ПОДКЛЮЧЕНО</Text>
        <View style={styles.card}>
          <WifiRow
            title={spotsForView[0]?.text || 'Beeline_5G_A0AA0C'}
            subtitle="Подключено (сильный сигнал)"
            level={spotsForView[0]?.level || 4}
            connected
            noBorder
            onPress={handleWifiSpotPress}
          />
        </View>

        <Text style={styles.sectionTitle}>ДОСТУПНО</Text>
        <View style={styles.card}>
          {spotsForView.length > 1
            ? spotsForView.slice(1).map((spot, index, arr) => (
                <WifiRow
                  key={spot.key}
                  title={spot.text}
                  level={spot.level}
                  noBorder={index === arr.length - 1}
                  onPress={handleWifiSpotPress}
                />
              ))
            : (
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
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eceef1',
  },
  headerBack: {
    width: 50,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    color: '#181a1f',
    fontSize: 45 / 2,
    fontWeight: '500',
  },
  headerHelp: {
    width: 44,
    alignItems: 'flex-end',
  },
  scroll: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 0,
    gap: 10,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f8f9fb',
  },
  wifiToggleRow: {
    minHeight: 72,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wifiToggleTitle: {
    color: '#181a1f',
    fontSize: 44 / 2,
    fontWeight: '400',
  },
  wifiHelperRow: {
    minHeight: 68,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wifiHelperText: {
    color: '#1a1d22',
    fontSize: 44 / 2,
    fontWeight: '400',
  },
  switchTrack: {
    width: 42,
    height: 25,
    borderRadius: 13,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f7f9fe',
  },
  sectionTitle: {
    color: '#6b707a',
    fontSize: 19,
    fontWeight: '500',
    paddingHorizontal: 18,
    marginTop: 12,
  },
  wifiRow: {
    minHeight: 86,
    paddingHorizontal: 18,
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
    fontSize: 42 / 2,
    fontWeight: '400',
  },
  wifiNameConnected: {
    color: '#1f5eb8',
    fontWeight: '500',
  },
  wifiSubtitle: {
    marginTop: 2,
    color: '#646b76',
    fontSize: 18,
    fontWeight: '400',
  },
  wifiSubtitleConnected: {
    color: '#646b76',
  },
  wifiRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#dde1e7',
    marginHorizontal: 18,
  },
  wifiSignalWrap: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wifiLock: {
    position: 'absolute',
    right: 1,
    bottom: 2,
  },
})
