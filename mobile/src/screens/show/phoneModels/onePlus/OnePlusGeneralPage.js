import React, { useRef } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { Image } from 'react-native'

const WIFI_ICON = require('../../../../icons/vladFert/WiFi.png')
const NETWORK_ICON = require('../../../../icons/vladFert/Network.png')
const CONNECTIONS_ICON = require('../../../../icons/vladFert/Connections.png')
const GENERAL_SCREEN_ICON = require('../../../../icons/vladFert/GeneralScreen.png')
const SCREEN_ICON = require('../../../../icons/vladFert/Screen.png')
const SOUND_ICON = require('../../../../icons/vladFert/Sound.png')
const NOTIFICATIONS_ICON = require('../../../../icons/vladFert/Notifications.png')
const DEFEND_ICON = require('../../../../icons/vladFert/Defend.png')
const SOS_ICON = require('../../../../icons/vladFert/SOS.png')
const GPS_ICON = require('../../../../icons/vladFert/GPS.png')
const PARENT_CONTROL_ICON = require('../../../../icons/vladFert/ParentControl.png')
const BATTERY_ICON = require('../../../../icons/vladFert/Battery.png')
const PLUS_KEY_ICON = require('../../../../icons/vladFert/PlusKey.png')
const SPECIAL_ICON = require('../../../../icons/vladFert/Special.png')
const ONEPLUS_ICON = require('../../../../icons/vladFert/OnePlus.png')
const REFERENCE_ICON = require('../../../../icons/vladFert/Reference.png')
const ABOUT_ICON = require('../../../../icons/vladFert/About.png')
const ACCOUNTS_ICON = require('../../../../icons/vladFert/Accounts.png')
const GOOGLE_ICON = require('../../../../icons/vladFert/Google.png')

const HEADER_HEIGHT_MAX = 110
const HEADER_HEIGHT_MIN = 58
const TITLE_SIZE_MAX = 34
const TITLE_SIZE_MIN = 20

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
      <View style={styles.rowIconWrap}>{icon}</View>
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
      <MaterialCommunityIcons name="account" size={34} color="#a6a6a6" />
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
      <Ionicons
        name="chevron-forward"
        size={19}
        color="#565b64"
        style={styles.profileArrow}
      />
    </Pressable>
  )
}

export default function OnePlusGeneralPage({
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
          <Ionicons name="search-outline" size={20} color="#777c84" />
          <Text style={styles.searchText}>Поиск</Text>
        </View>

        <ProfileRow
          title={settings.showOperatorName || 'Magfert'}
          subtitle="Управляйте сведениями об аккаунте и его безопасностью."
          avatarUri={operatorAvatarUri}
        />

        <Block>
          <Row
            title="Авиарежим"
            icon={<Ionicons name="airplane" size={21} color="#ffad17" />}
            rightNode={<SwitchMock on={false} />}
            withArrow={false}
          />
          <Row
            title="Wi-Fi"
            // rightText="DIREZABLe"
            icon={<Image source={WIFI_ICON} style={styles.onePlusIcon} />}
            onPress={() => setPage('wifi')}
            segmentCount={4}
            onSegmentTouch={setMastAndOpenWifi}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['♠️', '♥️', '♣️', '♦️']}
          />
          <Row
            title="Bluetooth"
            rightText="Подключено"
            icon={
              <MaterialCommunityIcons
                name="bluetooth"
                size={22}
                color="#1f73ff"
              />
            }
            segmentCount={4}
            onSegmentTouch={(segment) => setRankSegment(4, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['5', '6', '7', '8']}
          />
          <Row
            title="Мобильная сеть"
            icon={<Image source={NETWORK_ICON} style={styles.onePlusIcon} />}
            segmentCount={4}
            onSegmentTouch={(segment) => setRankSegment(0, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['A', '2', '3', '4']}
          />
          <Row
            title="Подключение к устройствам"
            icon={
              <Image source={CONNECTIONS_ICON} style={styles.onePlusIcon} />
            }
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
            icon={
              <Image source={GENERAL_SCREEN_ICON} style={styles.onePlusIcon} />
            }
            segmentCount={2}
            onSegmentTouch={(segment) => setRankSegment(12, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['K', 'Joker']}
          />
          <Row
            title="Экран и яркость"
            icon={<Image source={SCREEN_ICON} style={styles.onePlusIcon} />}
            noBorder
          />
        </Block>

        <Block>
          <Row
            title="Звуки и вибрация"
            icon={<Image source={SOUND_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            title="Уведомления и быстрые настройки"
            icon={
              <Image source={NOTIFICATIONS_ICON} style={styles.onePlusIcon} />
            }
            noBorder
          />
        </Block>

        <Block>
          <Row
            title="Защита и конфиденциальность"
            icon={<Image source={DEFEND_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            title="Безопасность и экстренные случаи"
            icon={<Image source={SOS_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            title="Местоположение"
            icon={<Image source={GPS_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            title="Цифровое благополучие и родительский контроль"
            icon={
              <Image source={PARENT_CONTROL_ICON} style={styles.onePlusIcon} />
            }
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
            icon={<Image source={BATTERY_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            title="Plus Key"
            icon={<Image source={PLUS_KEY_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            title="Специальные возможности и удобство"
            icon={<Image source={SPECIAL_ICON} style={styles.onePlusIcon} />}
            noBorder
          />
        </Block>

        <Block>
          <Row
            title="OnePlus AI"
            icon={<Image source={ONEPLUS_ICON} style={styles.onePlusIcon} />}
            noBorder
          />
        </Block>

        <Block>
          <Row
            title="Система и обновление"
            icon={
              <Ionicons name="settings-outline" size={20} color="#818792" />
            }
          />
          <Row
            title="Об устройстве"
            icon={<Image source={ABOUT_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            title="Пользователи и аккаунты"
            icon={<Image source={ACCOUNTS_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            title="Google"
            icon={<Image source={GOOGLE_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            title="Справка и отзывы"
            icon={<Image source={REFERENCE_ICON} style={styles.onePlusIcon} />}
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
    backgroundColor: '#000',
  },
  scroll: {
    paddingTop: HEADER_HEIGHT_MAX + 6,
    paddingHorizontal: 18,
    paddingBottom: 0,
    gap: 18,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT_MAX,
    backgroundColor: '#000',
    zIndex: 40,
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#ebedf1',
    fontWeight: '600',
    letterSpacing: -0.5,
    paddingBottom: 2,
  },
  searchBox: {
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    // borderWidth: 1,
    // borderColor: '#22262f',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchText: {
    color: '#7f848e',
    fontSize: 16,
    fontWeight: '400',
  },
  block: {
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  row: {
    minHeight: 54,
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
  onePlusIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  profileRow: {
    minHeight: 70,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  profileTextWrap: {
    flex: 1,
  },
  profileTitle: {
    color: '#f2f4f8',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  profileSubtitle: {
    color: '#9ea4af',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 1,
  },
  profileAvatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#4a4a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarImage: {
    width: 50,
    height: 50,
  },
  profileArrow: {
    // marginLeft: 2,
  },
  rowTextWrap: {
    flex: 1,
    paddingLeft: 8,
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
    fontSize: 13,
    lineHeight: 18,
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
    left: 57,
    right: 16,
    bottom: 0,
    height: 1,
    backgroundColor: '#313131',
  },
  switchTrack: {
    width: 42,
    height: 25,
    borderRadius: 12.5,
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
    borderColor: '#3f4248',
  },
  switchKnob: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10.5,
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
