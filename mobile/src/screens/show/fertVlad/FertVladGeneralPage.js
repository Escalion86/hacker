import React, { useRef } from 'react'
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons'

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

function Row({
  title,
  subtitle,
  rightText,
  icon,
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
    const segment = Math.max(0, Math.min(count - 1, Math.floor(x / (width / count))))
    onSegmentTouch(segment)
  }

  return (
    <Pressable
      onPress={onPress}
      onLayout={(event) => {
        rowWidthRef.current = event.nativeEvent.layout.width
      }}
      onTouchStart={segmentCount > 0 || showLearnOverlay ? handleSegmentTouch : undefined}
      style={styles.row}
    >
      <View style={styles.rowIconWrap}>
        {icon}
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightText ? <Text style={styles.rowRightText}>{rightText}</Text> : null}
      {rightNode}
      {withArrow ? (
        <Ionicons
          name="chevron-forward"
          size={19}
          color={iconColor || '#565b64'}
          style={styles.rowArrow}
        />
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

export default function FertVladGeneralPage({
  settings,
  onChange,
  setPage,
  scrollY,
}) {
  const hasManualRankSelectionRef = useRef(false)

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

  return (
    <View style={styles.page}>
      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Настройки</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={23} color="#777c84" />
          <Text style={styles.searchText}>Поиск</Text>
        </View>

        <Block>
          <Row
            title={settings.showOperatorName || 'Magfert'}
            subtitle="Управляйте сведениями об аккаунте и его безопасностью."
            withArrow
            noBorder
            icon={
              <MaterialCommunityIcons
                name="account"
                size={30}
                color="#a6a6a6"
              />
            }
          />
        </Block>

        <Block>
          <Row
            title="Авиарежим"
            icon={<Ionicons name="airplane" size={21} color="#ffad17" />}
            rightNode={<SwitchMock on={false} />}
            withArrow={false}
          />
          <Row
            title="Wi-Fi"
            rightText="DIREZABLe"
            icon={<Ionicons name="wifi" size={20} color="#1b67ff" />}
            onPress={() => setPage('wifi')}
            segmentCount={4}
            onSegmentTouch={setMastAndOpenWifi}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['♠️', '♥️', '♣️', '♦️']}
          />
          <Row
            title="Bluetooth"
            rightText="Подключено"
            icon={<MaterialCommunityIcons name="bluetooth" size={22} color="#1f73ff" />}
            segmentCount={4}
            onSegmentTouch={(segment) => setRankSegment(4, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['5', '6', '7', '8']}
          />
          <Row
            title="Мобильная сеть"
            icon={<MaterialCommunityIcons name="signal-cellular-2" size={22} color="#32c244" />}
            segmentCount={4}
            onSegmentTouch={(segment) => setRankSegment(0, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['A', '2', '3', '4']}
          />
          <Row
            title="Подключение к устройствам"
            icon={<MaterialCommunityIcons name="access-point-network" size={21} color="#1e6cff" />}
            noBorder
            segmentCount={4}
            onSegmentTouch={(segment) => setRankSegment(8, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['9', '10', 'J', 'Q']}
          />
        </Block>

        <Block>
          <Row
            title="Главный экран, экран блокировки и стиль"
            icon={<MaterialCommunityIcons name="gesture-swipe" size={20} color="#ff971d" />}
            segmentCount={2}
            onSegmentTouch={(segment) => setRankSegment(12, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['K', 'Joker']}
          />
          <Row
            title="Экран и яркость"
            icon={<MaterialCommunityIcons name="white-balance-sunny" size={20} color="#f0ba08" />}
            noBorder
          />
        </Block>

        <Block>
          <Row
            title="Звуки и вибрация"
            icon={<Feather name="bell" size={20} color="#29bf37" />}
          />
          <Row
            title="Уведомления и быстрые настройки"
            icon={<MaterialIcons name="notifications-none" size={21} color="#2a72ff" />}
            noBorder
          />
        </Block>

        <Block>
          <Row
            title="Защита и конфиденциальность"
            icon={<MaterialCommunityIcons name="shield-outline" size={20} color="#2b6aff" />}
          />
          <Row
            title="Безопасность и экстренные случаи"
            icon={<Text style={styles.sosIcon}>SOS</Text>}
          />
          <Row
            title="Местоположение"
            icon={<Ionicons name="location-outline" size={20} color="#f8bb19" />}
          />
          <Row
            title="Цифровое благополучие и родительский контроль"
            icon={<MaterialCommunityIcons name="account-group-outline" size={20} color="#2a72ff" />}
            noBorder
          />
        </Block>

        <Block>
          <Row
            title="Приложения"
            icon={<Feather name="grid" size={20} color="#22be3f" />}
          />
          <Row
            title="Батарея"
            icon={<Ionicons name="battery-half" size={20} color="#1ec843" />}
          />
          <Row
            title="Plus Key"
            icon={<MaterialCommunityIcons name="plus-circle-outline" size={20} color="#2b77ff" />}
          />
          <Row
            title="Специальные возможности и удобство"
            icon={<MaterialCommunityIcons name="human-male-board" size={20} color="#ff9b17" />}
            noBorder
          />
        </Block>

        <Block>
          <Row
            title="OnePlus AI"
            icon={<Text style={styles.aiIcon}>1+</Text>}
            noBorder
          />
        </Block>

        <Block>
          <Row
            title="Система и обновление"
            icon={<Ionicons name="settings-outline" size={20} color="#818792" />}
          />
          <Row
            title="Об устройстве"
            icon={<Ionicons name="phone-portrait-outline" size={20} color="#20c346" />}
          />
          <Row
            title="Пользователи и аккаунты"
            icon={<Ionicons name="person-outline" size={20} color="#2471ff" />}
          />
          <Row
            title="Google"
            icon={<MaterialCommunityIcons name="google-circles" size={20} color="#1d68ff" />}
          />
          <Row
            title="Справка и отзывы"
            icon={<MaterialCommunityIcons name="message-outline" size={20} color="#f0851d" />}
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
    backgroundColor: '#000',
  },
  scroll: {
    paddingTop: 110,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  headerTitle: {
    color: '#ebedf1',
    fontSize: 46,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  searchBox: {
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: '#1a1c22',
    borderWidth: 1,
    borderColor: '#22262f',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchText: {
    color: '#7f848e',
    fontSize: 15,
    fontWeight: '400',
  },
  block: {
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#17191f',
  },
  row: {
    minHeight: 68,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  rowIconWrap: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextWrap: {
    flex: 1,
    paddingRight: 12,
    gap: 1,
  },
  rowTitle: {
    color: '#f2f4f8',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  rowSubtitle: {
    color: '#9ea4af',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 2,
  },
  rowRightText: {
    color: '#8d919b',
    fontSize: 14,
    marginRight: 7,
  },
  rowArrow: {
    marginRight: 2,
  },
  rowDivider: {
    position: 'absolute',
    left: 68,
    right: 16,
    bottom: 0,
    height: 1,
    backgroundColor: '#2a2e37',
  },
  switchTrack: {
    width: 46,
    height: 27,
    borderRadius: 13.5,
    borderWidth: 1,
    justifyContent: 'center',
    marginRight: 6,
  },
  switchTrackOn: {
    backgroundColor: '#3a8cff',
    borderColor: '#60a0ff',
  },
  switchTrackOff: {
    backgroundColor: '#3f4248',
    borderColor: '#50545d',
  },
  switchKnob: {
    position: 'absolute',
    width: 23,
    height: 23,
    borderRadius: 11.5,
    backgroundColor: '#f3f5f7',
  },
  switchKnobOn: {
    right: 1.5,
  },
  switchKnobOff: {
    left: 1.5,
  },
  learnOverlayWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 4,
    bottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    zIndex: 30,
    backgroundColor: 'rgba(22, 35, 64, 0.20)',
  },
  learnOverlaySegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnOverlaySegmentBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(160, 183, 255, 0.45)',
  },
  learnOverlayText: {
    color: '#d9e6ff',
    fontSize: 18,
    fontWeight: '700',
  },
  sosIcon: {
    color: '#ea4036',
    fontSize: 16,
    fontWeight: '700',
  },
  aiIcon: {
    color: '#3f84ff',
    fontSize: 18,
    fontWeight: '700',
  },
})
