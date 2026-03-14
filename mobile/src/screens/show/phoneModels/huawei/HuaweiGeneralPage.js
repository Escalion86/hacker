import React, { useRef } from 'react'
import { Animated, Pressable, StyleSheet, Text, View, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const HEADER_HEIGHT_MAX = 112
const HEADER_HEIGHT_MIN = 70
const TITLE_SIZE_MAX = 54
const TITLE_SIZE_MIN = 40

function PlaceholderIcon({ color = '#57b8ff' }) {
  return (
    <View style={[styles.placeholderIcon, { backgroundColor: color }]}>
      <View style={styles.placeholderIconInner} />
    </View>
  )
}

function Row({
  title,
  subtitle,
  rightText,
  iconColor,
  onPress,
  noBorder,
  withArrow = true,
  rightNode = null,
  segmentCount = 0,
  onSegmentTouch,
  showLearnOverlay = false,
  learnOverlayLabels = [],
}) {
  const rowWidthRef = useRef(1)

  const handleSegmentTouch = (event) => {
    const count = showLearnOverlay
      ? learnOverlayLabels.length || segmentCount
      : segmentCount
    if (!count || !onSegmentTouch) return

    const width = Math.max(1, rowWidthRef.current)
    const x = Math.max(0, Math.min(width, event.nativeEvent.locationX))
    const segment = Math.max(
      0,
      Math.min(count - 1, Math.floor(x / (width / count))),
    )
    onSegmentTouch(segment)
  }

  return (
    <Pressable
      onPress={onPress}
      onLayout={(event) => {
        rowWidthRef.current = event.nativeEvent.layout.width
      }}
      onTouchStart={
        segmentCount > 0 || showLearnOverlay ? handleSegmentTouch : undefined
      }
      style={styles.row}
    >
      <View style={styles.rowIconWrap}>
        <PlaceholderIcon color={iconColor} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightText ? <Text style={styles.rowRightText}>{rightText}</Text> : null}
      {rightNode}
      {withArrow ? (
        <Ionicons name="chevron-forward" size={20} color="#b5b7bc" style={styles.rowArrow} />
      ) : null}
      {!noBorder ? <View style={styles.rowDivider} /> : null}
      {showLearnOverlay && learnOverlayLabels.length > 0 ? (
        <View style={styles.learnOverlayWrap} pointerEvents="none">
          {learnOverlayLabels.map((label, index) => (
            <View
              key={`${title}-${label}-${index}`}
              style={[
                styles.learnOverlaySegment,
                index > 0 && styles.learnOverlaySegmentBorder,
              ]}
            >
              <Text style={styles.learnOverlayText}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  )
}

function Block({ children }) {
  return <View style={styles.block}>{children}</View>
}

function ProfileAvatar({ uri }) {
  const cleanUri = String(uri || '').trim()
  if (cleanUri) {
    return (
      <View style={styles.profileAvatarWrap}>
        <Image source={{ uri: cleanUri }} style={styles.profileAvatarImage} />
      </View>
    )
  }

  return (
    <View style={styles.profileAvatarWrap}>
      <Ionicons name="person" size={30} color="#9da1aa" />
    </View>
  )
}

function ProfileRow({ title, subtitle, avatarUri }) {
  return (
    <Pressable style={styles.profileRow}>
      <ProfileAvatar uri={avatarUri} />
      <View style={styles.profileTextWrap}>
        <Text style={styles.profileTitle}>{title}</Text>
        <Text style={styles.profileSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#b5b7bc" />
    </Pressable>
  )
}

function SwitchMock() {
  return (
    <View style={styles.switchTrack}>
      <View style={styles.switchKnob} />
    </View>
  )
}

export default function HuaweiGeneralPage({
  settings,
  onChange,
  setPage,
  scrollY,
  onOpenSettings,
}) {
  const hasManualRankSelectionRef = useRef(false)
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [HEADER_HEIGHT_MAX, HEADER_HEIGHT_MIN],
    extrapolate: 'clamp',
  })
  const headerPaddingBottom = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [12, 8],
    extrapolate: 'clamp',
  })
  const titleFontSize = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [TITLE_SIZE_MAX, TITLE_SIZE_MIN],
    extrapolate: 'clamp',
  })

  const setRankSegment = (base, segment) => {
    hasManualRankSelectionRef.current = true
    onChange({ cardRankIndex: Math.min(13, base + segment) })
  }

  const setMastAndOpenWifi = (segment) => {
    onChange({
      cardMastIndex: segment,
      cardRankIndex: hasManualRankSelectionRef.current
        ? settings.cardRankIndex
        : 0,
    })
    setPage('wifi')
  }

  const operatorAvatarUri =
    (settings.showOperatorAvatar || '').trim() ||
    (settings.showOperatorAvatarRemote || '').trim()

  return (
    <View style={styles.page}>
      <Animated.View
        style={[
          styles.stickyHeader,
          { height: headerHeight, paddingBottom: headerPaddingBottom },
        ]}
      >
        <Animated.Text style={[styles.headerTitle, { fontSize: titleFontSize }]}>
          Настройки
        </Animated.Text>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={22} color="#8c9098" />
          <Text style={styles.searchText}>Поиск</Text>
        </View>

        <ProfileRow
          title={settings.showOperatorName || 'VladMagician'}
          subtitle="Аккаунт HUAWEI, Платежи и покупки, Облако и прочее"
          avatarUri={operatorAvatarUri}
        />

        <Block>
          <Row
            title="Авиарежим"
            iconColor="#f7b228"
            rightNode={<SwitchMock />}
            withArrow={false}
          />
          <Row
            title="Wi-Fi"
            rightText="Beeline_5G_A0AA0C"
            iconColor="#52b8ed"
            onPress={() => setPage('wifi')}
            segmentCount={4}
            onSegmentTouch={setMastAndOpenWifi}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['♠️', '♥️', '♣️', '♦️']}
          />
          <Row
            title="Bluetooth"
            rightText="Включено"
            iconColor="#54b6eb"
            segmentCount={4}
            onSegmentTouch={(segment) => setRankSegment(4, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['5', '6', '7', '8']}
          />
          <Row
            title="Мобильная сеть"
            iconColor="#6ac667"
            segmentCount={4}
            onSegmentTouch={(segment) => setRankSegment(0, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['A', '2', '3', '4']}
          />
          <Row
            title="Суперустройство"
            iconColor="#5fbde7"
            segmentCount={4}
            onSegmentTouch={(segment) => setRankSegment(8, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['9', '10', 'J', 'Q']}
          />
          <Row title="Другие соединения" iconColor="#ffb123" noBorder />
        </Block>

        <Block>
          <Row
            title="Рабочий экран"
            iconColor="#66c564"
            segmentCount={2}
            onSegmentTouch={(segment) => setRankSegment(12, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['K', 'Joker']}
          />
          <Row title="Экран и яркость" iconColor="#66c564" noBorder />
        </Block>

        <Block>
          <Row title="Звуки и вибрация" iconColor="#5448df" />
          <Row title="Уведомления и строка состояния" iconColor="#f5b221" noBorder />
        </Block>

        <Block>
          <Row title="Биометрические данные и пароли" iconColor="#66d3c5" />
          <Row title="Приложения и службы" iconColor="#f5b221" />
          <Row title="Батарея" iconColor="#66c564" />
          <Row title="Память" iconColor="#2e70ee" />
          <Row title="Безопасность" iconColor="#66d3c5" />
          <Row title="Конфиденциальность" iconColor="#66d3c5" />
          <Row title="Данные о местоположении" iconColor="#66d3c5" noBorder />
        </Block>

        <Block>
          <Row title="Цифровой баланс" iconColor="#4ccc58" />
          <Row title="HUAWEI Assistant" iconColor="#80c9f4" />
          <Row title="Специальные возможности" iconColor="#f5a41f" noBorder />
        </Block>

        <Block>
          <Row title="Пользователи и аккаунты" iconColor="#f24b36" />
          <Row title="HMS Core" iconColor="#f34d58" />
          <Row title="Система и обновления" iconColor="#2f6ff1" />
          <Row
            title="О телефоне"
            iconColor="#868a92"
            onPress={onOpenSettings}
            noBorder
          />
        </Block>
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#eceef1',
  },
  scroll: {
    paddingTop: HEADER_HEIGHT_MAX + 6,
    paddingHorizontal: 18,
    paddingBottom: 0,
    gap: 14,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT_MAX,
    backgroundColor: '#eceef1',
    zIndex: 40,
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#111215',
    fontWeight: '500',
    letterSpacing: -0.7,
  },
  searchBox: {
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  searchText: {
    color: '#8b9098',
    fontSize: 40 / 2,
    fontWeight: '400',
  },
  block: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#f8f9fb',
  },
  row: {
    minHeight: 68,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  rowIconWrap: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIconInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  profileRow: {
    minHeight: 100,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#f8f9fb',
  },
  profileTextWrap: {
    flex: 1,
  },
  profileTitle: {
    color: '#16181b',
    fontSize: 22 / 1.1,
    lineHeight: 26,
    fontWeight: '500',
  },
  profileSubtitle: {
    color: '#7f848d',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  profileAvatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#d4d6db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarImage: {
    width: 56,
    height: 56,
  },
  rowTextWrap: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 12,
    gap: 1,
  },
  rowTitle: {
    color: '#191b20',
    fontSize: 41 / 2,
    lineHeight: 28,
    fontWeight: '400',
  },
  rowSubtitle: {
    color: '#838892',
    fontSize: 14,
    lineHeight: 19,
    marginTop: 1,
  },
  rowRightText: {
    color: '#8c8f97',
    fontSize: 17,
    marginRight: 4,
  },
  rowArrow: {
    marginRight: 1,
  },
  rowDivider: {
    position: 'absolute',
    left: 67,
    right: 16,
    bottom: 0,
    height: 1,
    backgroundColor: '#e1e3e7',
  },
  switchTrack: {
    width: 42,
    height: 25,
    borderRadius: 12.5,
    justifyContent: 'center',
    marginRight: 4,
    backgroundColor: '#2f78ff',
  },
  switchKnob: {
    position: 'absolute',
    right: 1.5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f5f7fb',
  },
  learnOverlayWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 4,
    bottom: 4,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    zIndex: 30,
    backgroundColor: 'rgba(41, 117, 255, 0.12)',
  },
  learnOverlaySegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnOverlaySegmentBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(83, 132, 255, 0.45)',
  },
  learnOverlayText: {
    color: '#1145ad',
    fontSize: 18,
    fontWeight: '700',
  },
})
