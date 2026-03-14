import React, { useRef } from 'react'
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const HEADER_HEIGHT_MAX = 112
const HEADER_HEIGHT_MIN = 60
const TITLE_SIZE_MAX = 36
const TITLE_SIZE_MIN = 26
const WIFI_ICON = require('../../../../icons/huawei/wifi.png')
const BLUETOOTH_ICON = require('../../../../icons/huawei/bluetooth.png')
const NETWORK_ICON = require('../../../../icons/huawei/network.png')
const SUPERDEVICE_ICON = require('../../../../icons/huawei/superdevice.png')
const OTHER_DEVICE_ICON = require('../../../../icons/huawei/otherdevice.png')
const WORKSCREEN_ICON = require('../../../../icons/huawei/workscreen.png')
const SCREEN_LIGHT_ICON = require('../../../../icons/huawei/screenandlight.png')
const SOUND_ICON = require('../../../../icons/huawei/sound.png')
const NOTIFICATIONS_ICON = require('../../../../icons/huawei/Notifications.png')
const BIOMETRY_ICON = require('../../../../icons/huawei/biometryandpasswords.png')
const APPLICATIONS_ICON = require('../../../../icons/huawei/applications.png')
const BATTERY_ICON = require('../../../../icons/huawei/battery.png')
const MEMORY_ICON = require('../../../../icons/huawei/memory.png')
const SAFETY_ICON = require('../../../../icons/huawei/safety.png')
const CONFIDENTIAL_ICON = require('../../../../icons/huawei/confidential.png')
const GPS_ICON = require('../../../../icons/huawei/gps.png')
const DIGIT_BALANCE_ICON = require('../../../../icons/huawei/digitbalance.png')
const HUAWEI_ASSISTANT_ICON = require('../../../../icons/huawei/huaweiassistant.png')
const SPECIAL_ICON = require('../../../../icons/huawei/special.png')
const ACCOUNTS_ICON = require('../../../../icons/huawei/accounts.png')
const HMS_ICON = require('../../../../icons/huawei/hms.png')
const SETTINGS_ICON = require('../../../../icons/huawei/settings.png')
const ABOUT_PHONE_ICON = require('../../../../icons/huawei/aboutphone.png')

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
  iconSource,
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
        {iconSource ? (
          <Image source={iconSource} style={styles.huaweiIcon} />
        ) : (
          <PlaceholderIcon color={iconColor} />
        )}
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
          size={20}
          color="#b5b7bc"
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
        <Animated.Text
          style={[styles.headerTitle, { fontSize: titleFontSize }]}
        >
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
            title="Wi-Fi"
            iconSource={WIFI_ICON}
            onPress={() => setPage('wifi')}
            segmentCount={4}
            onSegmentTouch={setMastAndOpenWifi}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['♠️', '♥️', '♣️', '♦️']}
          />
          <Row
            title="Bluetooth"
            rightText="Включено"
            iconSource={BLUETOOTH_ICON}
            segmentCount={4}
            onSegmentTouch={(segment) => setRankSegment(4, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['5', '6', '7', '8']}
          />
          <Row
            title="Мобильная сеть"
            iconSource={NETWORK_ICON}
            segmentCount={4}
            onSegmentTouch={(segment) => setRankSegment(0, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['A', '2', '3', '4']}
          />
          <Row
            title="Суперустройство"
            iconSource={SUPERDEVICE_ICON}
            segmentCount={4}
            onSegmentTouch={(segment) => setRankSegment(8, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['9', '10', 'J', 'Q']}
          />
          <Row
            title="Другие соединения"
            iconSource={OTHER_DEVICE_ICON}
            noBorder
          />
        </Block>

        <Block>
          <Row
            title="Рабочий экран"
            iconSource={WORKSCREEN_ICON}
            segmentCount={2}
            onSegmentTouch={(segment) => setRankSegment(12, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['K', 'Joker']}
          />
          <Row
            title="Экран и яркость"
            iconSource={SCREEN_LIGHT_ICON}
            noBorder
          />
        </Block>

        <Block>
          <Row title="Звуки и вибрация" iconSource={SOUND_ICON} />
          <Row
            title="Уведомления и строка состояния"
            iconSource={NOTIFICATIONS_ICON}
            noBorder
          />
        </Block>

        <Block>
          <Row
            title="Биометрические данные и пароли"
            iconSource={BIOMETRY_ICON}
          />
          <Row title="Приложения и службы" iconSource={APPLICATIONS_ICON} />
          <Row title="Батарея" iconSource={BATTERY_ICON} />
          <Row title="Память" iconSource={MEMORY_ICON} />
          <Row title="Безопасность" iconSource={SAFETY_ICON} />
          <Row title="Конфиденциальность" iconSource={CONFIDENTIAL_ICON} />
          <Row title="Данные о местоположении" iconSource={GPS_ICON} noBorder />
        </Block>

        <Block>
          <Row title="Цифровой баланс" iconSource={DIGIT_BALANCE_ICON} />
          <Row title="HUAWEI Assistant" iconSource={HUAWEI_ASSISTANT_ICON} />
          <Row
            title="Специальные возможности"
            iconSource={SPECIAL_ICON}
            noBorder
          />
        </Block>

        <Block>
          <Row title="Пользователи и аккаунты" iconSource={ACCOUNTS_ICON} />
          <Row title="HMS Core" iconSource={HMS_ICON} />
          <Row title="Система и обновления" iconSource={SETTINGS_ICON} />
          <Row
            title="О телефоне"
            iconSource={ABOUT_PHONE_ICON}
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
    paddingBottom: 18,
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
    backgroundColor: '#f8f9fb',
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
  huaweiIcon: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
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
    display: 'none',
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
