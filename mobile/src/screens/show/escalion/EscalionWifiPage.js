import React from 'react'
import { Animated, Pressable, StyleSheet, Text, UIManager, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import bleService from '../../../services/ble/bleService'
import Svg, { Path } from 'react-native-svg'

const MAX_ANIMATED_SPOTS = 12
const NOISE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*+-?'
const HAS_NATIVE_SVG =
  Boolean(UIManager.getViewManagerConfig?.('RNSVGPath')) ||
  Boolean(UIManager.getViewManagerConfig?.('RCTRNSVGPath'))

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function randomNoise() {
  const size = Math.max(5, Math.min(8, 5 + Math.floor(Math.random() * 4)))
  let out = ''
  for (let i = 0; i < size; i += 1) {
    out += NOISE_CHARS.charAt(Math.floor(Math.random() * NOISE_CHARS.length))
  }
  return out
}

function randomLevel() {
  return 1 + Math.floor(Math.random() * 4)
}

function stableLevelFromSpot(spot, index) {
  const text = String(spot || '')
  let hash = index + 17
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 9973
  }
  return (hash % 4) + 1
}

const SUIT_CHAR_TO_SYMBOL = {
  S: '♠',
  H: '♥',
  C: '♣',
  D: '♦',
  '♠': '♠',
  '♥': '♥',
  '♣': '♣',
  '♦': '♦',
}

function parseCardLikeSpot(rawText) {
  const text = String(rawText || '').trim()
  if (!text) return null

  const hasDot = text.startsWith('.')
  const normalized = hasDot ? text.slice(1) : text
  const match = normalized.match(/^(A|[2-9]|10|J|Q|K)([SHCD♠♥♣♦])$/)
  if (!match) return null
  const suitSymbol = SUIT_CHAR_TO_SYMBOL[match[2]]
  if (!suitSymbol) return null

  return {
    dot: hasDot,
    rank: match[1],
    suitSymbol,
  }
}

function toSuitSymbolCode(rawCode) {
  const text = String(rawCode || '').trim()
  const match = text.match(/^(A|[2-9]|10|J|Q|K)([SHCD♠♥♣♦])$/)
  if (!match) return text
  const suitSymbol = SUIT_CHAR_TO_SYMBOL[match[2]]
  if (!suitSymbol) return text
  return `${match[1]}${suitSymbol}`
}

function buildTargetSsid({ settings, cardCode }) {
  const base =
    settings.mode === 'card'
      ? toSuitSymbolCode(cardCode)
      : settings.wifi || 'Hacked'
  return {
    withDot: settings.dot ? `.${base}` : base,
    withoutDot: base,
  }
}

function WifiSignal({ level = 4 }) {
  const safeLevel = Math.max(1, Math.min(4, level))
  const activeColor = '#2f76ff'
  const inactiveColor = '#727a88'

  if (HAS_NATIVE_SVG) {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2.06116 8.74752C4.80094 6.33248 8.32769 5 11.9799 5C15.6321 5 19.1589 6.33248 21.8987 8.74752C22.313 9.11271 22.9449 9.07291 23.3101 8.6586C23.6753 8.2443 23.6355 7.61238 23.2212 7.24718C20.1161 4.51015 16.1191 3 11.9799 3C7.84073 3 3.84374 4.51015 0.738665 7.24718C0.32436 7.61238 0.284551 8.2443 0.649749 8.6586C1.01495 9.07291 1.64686 9.11271 2.06116 8.74752Z"
          fill={safeLevel >= 4 ? activeColor : inactiveColor}
        />
        <Path
          d="M5.62001 12.3156C7.41688 10.819 9.68147 9.99939 12.02 9.99939C14.3585 9.99939 16.6231 10.819 18.42 12.3156C18.8444 12.6691 19.4749 12.6116 19.8284 12.1873C20.1818 11.7629 20.1244 11.1324 19.7 10.7789C17.5438 8.98289 14.8263 7.99939 12.02 7.99939C9.21376 7.99939 6.49626 8.98289 4.34001 10.7789C3.91564 11.1324 3.85817 11.7629 4.21163 12.1873C4.56509 12.6116 5.19564 12.6691 5.62001 12.3156Z"
          fill={safeLevel >= 3 ? activeColor : inactiveColor}
        />
        <Path
          d="M11.985 14.9985C10.9472 14.9985 9.93514 15.3214 9.08913 15.9225C8.63891 16.2424 8.01462 16.1367 7.69476 15.6864C7.37489 15.2362 7.48057 14.6119 7.9308 14.2921C9.1152 13.4506 10.5321 12.9985 11.985 12.9985C13.4378 12.9985 14.8547 13.4506 16.0391 14.2921C16.4894 14.6119 16.595 15.2362 16.2752 15.6864C15.9553 16.1367 15.331 16.2424 14.8808 15.9225C14.0348 15.3214 13.0227 14.9985 11.985 14.9985Z"
          fill={safeLevel >= 2 ? activeColor : inactiveColor}
        />
        <Path
          d="M11.98 19.9973C12.5323 19.9973 12.98 19.5496 12.98 18.9973C12.98 18.445 12.5323 17.9973 11.98 17.9973C11.4277 17.9973 10.98 18.445 10.98 18.9973C10.98 19.5496 11.4277 19.9973 11.98 19.9973Z"
          fill={safeLevel >= 1 ? activeColor : inactiveColor}
        />
      </Svg>
    )
  }

  return (
    <View style={styles.signalWrap}>
      <View
        style={[
          styles.signalArcLarge,
          { borderColor: safeLevel >= 4 ? activeColor : inactiveColor },
        ]}
      />
      <View
        style={[
          styles.signalArcMid,
          { borderColor: safeLevel >= 3 ? activeColor : inactiveColor },
        ]}
      />
      <View
        style={[
          styles.signalArcSmall,
          { borderColor: safeLevel >= 2 ? activeColor : inactiveColor },
        ]}
      />
      <View
        style={[
          styles.signalDot,
          { backgroundColor: safeLevel >= 1 ? activeColor : inactiveColor },
        ]}
      />
    </View>
  )
}

function SwitchMock({ on }) {
  return (
    <View
      style={[
        styles.switchTrack,
        on ? styles.switchTrackOn : styles.switchTrackOff,
      ]}
    >
      <View
        style={[
          styles.switchKnob,
          on ? styles.switchKnobOn : styles.switchKnobOff,
        ]}
      />
    </View>
  )
}

function WifiRow({ title, level = 4, noBorder = false }) {
  const parsed = parseCardLikeSpot(title)
  return (
    <View style={[styles.wifiRow, !noBorder && styles.wifiRowDivider]}>
      <WifiSignal level={level} />
      {parsed ? (
        <View style={styles.cardCodeWrap}>
          {parsed.dot ? <Text style={styles.wifiName}>.</Text> : null}
          <Text style={styles.wifiName}>{parsed.rank}</Text>
          <Text style={styles.suitSymbol}>{parsed.suitSymbol}</Text>
        </View>
      ) : (
        <Text style={styles.wifiName}>{title}</Text>
      )}
    </View>
  )
}

export default function EscalionWifiPage({
  setPage,
  scrollY,
  wifiSpots,
  settings,
  cardCode,
  wifiEnabled,
  onWifiEnabledChange,
}) {
  const mountedRef = React.useRef(true)
  const startTimeoutRef = React.useRef(null)
  const animationIntervalRef = React.useRef(null)
  const flowIdRef = React.useRef(0)

  const [waitingStart, setWaitingStart] = React.useState(false)
  const [running, setRunning] = React.useState(false)
  const [animatedSpots, setAnimatedSpots] = React.useState([])

  const clearStartTimeout = React.useCallback(() => {
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current)
      startTimeoutRef.current = null
    }
  }, [])

  const clearAnimation = React.useCallback(() => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current)
      animationIntervalRef.current = null
    }
  }, [])

  React.useEffect(() => {
    return () => {
      mountedRef.current = false
      clearStartTimeout()
      clearAnimation()
    }
  }, [clearAnimation, clearStartTimeout])

  const startWifiAnimation = React.useCallback(
    (targetSsid) => {
      clearAnimation()
      let ticks = 0
      setAnimatedSpots([])

      animationIntervalRef.current = setInterval(() => {
        ticks += 1
        setAnimatedSpots((prev) => {
          const next = [...prev]
          if (next.length < MAX_ANIMATED_SPOTS) {
            next.push({
              stage: 0,
              settleAt: 4 + next.length,
              level: randomLevel(),
              text: randomNoise(),
            })
          }

          for (let i = 0; i < next.length; i += 1) {
            const row = next[i]
            const nextStage = row.stage + 1
            const settled = nextStage >= row.settleAt
            next[i] = {
              ...row,
              stage: nextStage,
              text: settled ? targetSsid : randomNoise(),
            }
          }

          return next
        })

        if (ticks >= 34) {
          clearAnimation()
          setAnimatedSpots(
            Array.from({ length: MAX_ANIMATED_SPOTS }, () => ({
              stage: 999,
              settleAt: 0,
              level: randomLevel(),
              text: targetSsid,
            })),
          )
        }
      }, 190)
    },
    [clearAnimation],
  )

  const runStart = React.useCallback(
    async (flowId) => {
      const target = buildTargetSsid({ settings, cardCode })
      try {
        if (!bleService.isConnected()) {
          await bleService.connect()
        }
        if (flowId !== flowIdRef.current || !mountedRef.current) return

        await bleService.sendStart({
          ssid: target.withoutDot,
          dot: settings.dot,
          minutes: settings.minutesBeforeStop,
        })
        if (flowId !== flowIdRef.current || !mountedRef.current) return

        setRunning(true)
        setWaitingStart(false)
        startWifiAnimation(target.withDot)
      } catch {
        if (flowId !== flowIdRef.current || !mountedRef.current) return
        setRunning(false)
        setWaitingStart(false)
        onWifiEnabledChange(false)
      }
    },
    [cardCode, settings, startWifiAnimation, onWifiEnabledChange],
  )

  const triggerStartFlow = React.useCallback(() => {
    const flowId = flowIdRef.current + 1
    flowIdRef.current = flowId
    clearStartTimeout()
    setWaitingStart(true)

    const delaySec = Math.max(0, toNumber(settings.delay, 0))
    if (delaySec <= 0) {
      runStart(flowId)
      return
    }

    startTimeoutRef.current = setTimeout(() => {
      runStart(flowId)
    }, delaySec * 1000)
  }, [clearStartTimeout, runStart, settings.delay])

  const handleDisable = React.useCallback(async () => {
    flowIdRef.current += 1
    clearStartTimeout()
    clearAnimation()
    setWaitingStart(false)
    setRunning(false)
    setAnimatedSpots([])
    try {
      await bleService.sendStop()
    } catch {}
  }, [clearAnimation, clearStartTimeout])

  React.useEffect(() => {
    if (settings.startOnSetWiFiPage) {
      onWifiEnabledChange(true)
      triggerStartFlow()
      return
    }

    onWifiEnabledChange(false)
    clearStartTimeout()
    clearAnimation()
    setWaitingStart(false)
    setRunning(false)
    setAnimatedSpots([])
  }, [
    settings.startOnSetWiFiPage,
    triggerStartFlow,
    clearStartTimeout,
    clearAnimation,
    onWifiEnabledChange,
  ])

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

  const onSwitchPress = async () => {
    if (wifiEnabled) {
      onWifiEnabledChange(false)
      await handleDisable()
      return
    }

    onWifiEnabledChange(true)
    triggerStartFlow()
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setPage('connections')}
          hitSlop={10}
          style={styles.headerBack}
        >
          <Ionicons name="chevron-back" size={24} color="#f2f5fb" />
        </Pressable>
        <Text style={styles.headerTitle}>Wi-Fi</Text>
        <Pressable hitSlop={10} style={styles.headerIcon}>
          <Ionicons name="qr-code-outline" size={22} color="#f2f5fb" />
        </Pressable>
        <Pressable hitSlop={10} style={styles.headerIcon}>
          <Ionicons name="ellipsis-vertical" size={22} color="#f2f5fb" />
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
          <View style={styles.enabledRow}>
            <Text
              style={[styles.enabledTitle, !wifiEnabled && styles.enabledTitleOff]}
            >
              {wifiEnabled ? 'Включено' : 'Выключено'}
            </Text>
            <Pressable onPress={onSwitchPress} hitSlop={10}>
              <SwitchMock on={wifiEnabled} />
            </Pressable>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>Доступные сети</Text>

          {spotsForView.length === 0 ? null : (
            <View style={styles.card}>
              {spotsForView.map((spot, index) => (
                <WifiRow
                  key={spot.key}
                  title={spot.text}
                  level={spot.level}
                  noBorder={index === spotsForView.length - 1}
                />
              ))}
            </View>
          )}

          <View style={styles.card}>
            <View style={styles.addRow}>
              <Ionicons name="add" size={34} color="#2fc35b" />
              <Text style={styles.addText}>Добавить сеть</Text>
            </View>
          </View>

        </View>
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 74,
    paddingHorizontal: 14,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBack: {
    width: 28,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    color: '#f3f5fa',
    fontSize: 21,
    fontWeight: '700',
    marginLeft: 20,
  },
  headerIcon: {
    width: 28,
    alignItems: 'center',
    marginLeft: 8,
  },
  scroll: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#171719',
  },
  enabledRow: {
    minHeight: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  enabledTitle: {
    color: '#4d86ff',
    fontSize: 18,
    fontWeight: '700',
  },
  enabledTitleOff: {
    color: '#a7acb8',
  },
  switchTrack: {
    width: 38,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: '#3b8cff',
    borderColor: '#5c9fff',
  },
  switchTrackOff: {
    backgroundColor: '#262b35',
    borderColor: '#3b424f',
  },
  switchKnob: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f2f4fa',
  },
  switchKnobOn: {
    right: 2,
  },
  switchKnobOff: {
    left: 2,
  },
  sectionTitle: {
    color: '#8f949e',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 26,
    marginTop: 2,
  },
  addRow: {
    minHeight: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  addText: {
    color: '#f4f6fb',
    fontSize: 18,
    fontWeight: '400',
  },
  wifiRow: {
    minHeight: 72,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wifiRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#23252c',
  },
  wifiName: {
    color: '#f4f6fb',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
  cardCodeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  suitSymbol: {
    color: '#646b78',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 1,
  },
  signalWrap: {
    width: 24,
    height: 18,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 1,
  },
  signalArcLarge: {
    position: 'absolute',
    bottom: 3,
    width: 18,
    height: 9,
    borderTopWidth: 1.4,
    borderLeftWidth: 1.4,
    borderRightWidth: 1.4,
    borderBottomWidth: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  signalArcMid: {
    position: 'absolute',
    bottom: 3,
    width: 12,
    height: 6,
    borderTopWidth: 1.4,
    borderLeftWidth: 1.4,
    borderRightWidth: 1.4,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  signalArcSmall: {
    position: 'absolute',
    bottom: 3,
    width: 7,
    height: 4,
    borderTopWidth: 1.4,
    borderLeftWidth: 1.4,
    borderRightWidth: 1.4,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  signalDot: {
    position: 'absolute',
    bottom: 0,
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
  },
})
