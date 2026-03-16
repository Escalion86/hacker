import React, { useRef } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { Image } from 'react-native'

const WIFI_ICON = require('../../../../icons/onePlus/WiFi.png')
const NETWORK_ICON = require('../../../../icons/onePlus/Network.png')
const CONNECTIONS_ICON = require('../../../../icons/onePlus/Connections.png')
const GENERAL_SCREEN_ICON = require('../../../../icons/onePlus/GeneralScreen.png')
const SCREEN_ICON = require('../../../../icons/onePlus/Screen.png')
const SOUND_ICON = require('../../../../icons/onePlus/Sound.png')
const NOTIFICATIONS_ICON = require('../../../../icons/onePlus/Notifications.png')
const DEFEND_ICON = require('../../../../icons/onePlus/Defend.png')
const SOS_ICON = require('../../../../icons/onePlus/SOS.png')
const GPS_ICON = require('../../../../icons/onePlus/GPS.png')
const PARENT_CONTROL_ICON = require('../../../../icons/onePlus/ParentControl.png')
const BATTERY_ICON = require('../../../../icons/onePlus/Battery.png')
const PLUS_KEY_ICON = require('../../../../icons/onePlus/PlusKey.png')
const SPECIAL_ICON = require('../../../../icons/onePlus/Special.png')
const ONEPLUS_ICON = require('../../../../icons/onePlus/OnePlus.png')
const REFERENCE_ICON = require('../../../../icons/onePlus/Reference.png')
const ABOUT_ICON = require('../../../../icons/onePlus/About.png')
const ACCOUNTS_ICON = require('../../../../icons/onePlus/Accounts.png')
const GOOGLE_ICON = require('../../../../icons/onePlus/Google.png')

const HEADER_HEIGHT_MAX = 110
const HEADER_HEIGHT_MIN = 58
const TITLE_SIZE_MAX = 34
const TITLE_SIZE_MIN = 20
const DEFAULT_PALETTE = {
  textPrimary: '#f4f6fb',
  textSecondary: '#8f95a2',
  divider: '#2a2d36',
  arrow: '#565b64',
  cardBg: '#171719',
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
  palette = DEFAULT_PALETTE,
}) {
  const rowWidthRef = useRef(1)
  const touchSegments = showLearnOverlay
    ? learnOverlayLabels.length || segmentCount
    : segmentCount

  return (
    <Pressable
      onPress={onPress}
      onLayout={(event) => {
        rowWidthRef.current = event.nativeEvent.layout.width
      }}
      style={styles.row}
    >
      <View style={styles.rowIconWrap}>{icon}</View>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowTitle, { color: palette.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: palette.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      {rightText ? (
        <Text style={[styles.rowRightText, { color: palette.textSecondary }]}>{rightText}</Text>
      ) : null}
      {rightNode}
      {withArrow ? (
        <Ionicons
          name="chevron-forward"
          size={19}
          color={iconColor || palette.arrow}
          style={styles.rowArrow}
        />
      ) : null}
      {!noBorder ? <View style={[styles.rowDivider, { backgroundColor: palette.divider }]} /> : null}
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
      {touchSegments > 0 && onSegmentTouch ? (
        <View style={styles.segmentTouchWrap}>
          {Array.from({ length: touchSegments }).map((_, index) => (
            <Pressable
              key={`${title}-touch-${index}`}
              style={styles.segmentTouchZone}
              onPressIn={() => onSegmentTouch(index)}
            />
          ))}
        </View>
      ) : null}
    </Pressable>
  )
}

function Block({ children, palette }) {
  return <View style={[styles.block, { backgroundColor: palette.cardBg }]}>{children}</View>
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

function ProfileRow({ title, subtitle, avatarUri, palette = DEFAULT_PALETTE }) {
  return (
    <Pressable style={[styles.profileRow, { backgroundColor: palette.cardBg }]}>
      <ProfileAvatar uri={avatarUri} />
      <View style={styles.profileTextWrap}>
        <Text style={[styles.profileTitle, { color: palette.textPrimary }]}>{title}</Text>
        <Text style={[styles.profileSubtitle, { color: palette.textSecondary }]}>{subtitle}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={19}
        color={palette.arrow}
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
  isLightTheme = false,
  copy,
}) {
  const text = copy?.general || {}
  const palette = isLightTheme
    ? {
        pageBg: '#eceef1',
        headerBg: '#eceef1',
        textPrimary: '#181a1f',
        textSecondary: '#666d79',
        cardBg: '#f8f9fb',
        searchBg: '#f8f9fb',
        searchText: '#8b9098',
        divider: '#dde1e7',
        arrow: '#b5b7bc',
      }
    : {
        pageBg: '#000',
        headerBg: '#000',
        textPrimary: '#f4f6fb',
        textSecondary: '#8f95a2',
        cardBg: '#171719',
        searchBg: '#171719',
        searchText: '#777c84',
        divider: '#2a2d36',
        arrow: '#565b64',
      }
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
    <View style={[styles.page, { backgroundColor: palette.pageBg }]}>
      <Animated.View
        style={[
          styles.stickyHeader,
          { backgroundColor: palette.headerBg },
          { height: headerHeight, paddingBottom: headerPaddingBottom },
        ]}
      >
        <Animated.Text
          style={[styles.headerTitle, { fontSize: titleFontSize, color: palette.textPrimary }]}
        >
          {text.headerSettings}
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
        <View style={[styles.searchBox, { backgroundColor: palette.searchBg }]}>
          <Ionicons name="search-outline" size={20} color={palette.searchText} />
          <Text style={[styles.searchText, { color: palette.searchText }]}>{text.searchPlaceholder}</Text>
        </View>

        <ProfileRow
          title={settings.showOperatorName || 'Magfert'}
          subtitle={text.profileSubtitle}
          avatarUri={operatorAvatarUri}
          palette={palette}
        />

        <Block palette={palette}>
          <Row
            palette={palette}
            title={text.airplaneModeTitle}
            icon={<Ionicons name="airplane" size={21} color="#ffad17" />}
            rightNode={<SwitchMock on={false} />}
            withArrow={false}
          />
          <Row
            palette={palette}
            title={text.wifiTitle}
            // rightText="DIREZABLe"
            icon={<Image source={WIFI_ICON} style={styles.onePlusIcon} />}
            onPress={() => setPage('wifi')}
            segmentCount={4}
            onSegmentTouch={setMastAndOpenWifi}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['♠️', '♥️', '♣️', '♦️']}
          />
          <Row
            palette={palette}
            title={text.bluetoothTitle}
            rightText={text.bluetoothConnected}
            icon={
              <MaterialCommunityIcons
                name="bluetooth"
                size={22}
                color="#1f73ff"
              />
            }
            segmentCount={4}
            onSegmentTouch={(segment) => setRankSegment(0, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['A', '2', '3', '4']}
          />
          <Row
            palette={palette}
            title={text.mobileNetworkTitle}
            icon={<Image source={NETWORK_ICON} style={styles.onePlusIcon} />}
            segmentCount={4}
            onSegmentTouch={(segment) => setRankSegment(4, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['5', '6', '7', '8']}
          />
          <Row
            palette={palette}
            title={text.deviceConnectionsTitle}
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

        <Block palette={palette}>
          <Row
            palette={palette}
            title={text.homeLockStyleTitle}
            icon={
              <Image source={GENERAL_SCREEN_ICON} style={styles.onePlusIcon} />
            }
            segmentCount={2}
            onSegmentTouch={(segment) => setRankSegment(12, segment)}
            showLearnOverlay={settings.learn}
            learnOverlayLabels={['K', 'Joker']}
          />
          <Row
            palette={palette}
            title={text.screenBrightnessTitle}
            icon={<Image source={SCREEN_ICON} style={styles.onePlusIcon} />}
            noBorder
          />
        </Block>

        <Block palette={palette}>
          <Row
            palette={palette}
            title={text.soundVibrationTitle}
            icon={<Image source={SOUND_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            palette={palette}
            title={text.notificationsQuickTitle}
            icon={
              <Image source={NOTIFICATIONS_ICON} style={styles.onePlusIcon} />
            }
            noBorder
          />
        </Block>

        <Block palette={palette}>
          <Row
            palette={palette}
            title={text.securityPrivacyTitle}
            icon={<Image source={DEFEND_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            palette={palette}
            title={text.safetyEmergencyTitle}
            icon={<Image source={SOS_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            palette={palette}
            title={text.locationTitle}
            icon={<Image source={GPS_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            palette={palette}
            title={text.wellbeingTitle}
            icon={
              <Image source={PARENT_CONTROL_ICON} style={styles.onePlusIcon} />
            }
            noBorder
          />
        </Block>

        <Block palette={palette}>
          <Row
            palette={palette}
            title={text.appsTitle}
            icon={<Feather name="grid" size={20} color="#22be3f" />}
          />
          <Row
            palette={palette}
            title={text.batteryTitle}
            icon={<Image source={BATTERY_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            palette={palette}
            title={text.plusKeyTitle}
            icon={<Image source={PLUS_KEY_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            palette={palette}
            title={text.accessibilityTitle}
            icon={<Image source={SPECIAL_ICON} style={styles.onePlusIcon} />}
            noBorder
          />
        </Block>

        <Block palette={palette}>
          <Row
            palette={palette}
            title={text.oneplusAiTitle}
            icon={<Image source={ONEPLUS_ICON} style={styles.onePlusIcon} />}
            noBorder
          />
        </Block>

        <Block palette={palette}>
          <Row
            palette={palette}
            title={text.systemUpdateTitle}
            icon={
              <Ionicons name="settings-outline" size={20} color="#818792" />
            }
          />
          <Row
            palette={palette}
            title={text.aboutDeviceTitle}
            icon={<Image source={ABOUT_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            palette={palette}
            title={text.usersAccountsTitle}
            icon={<Image source={ACCOUNTS_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            palette={palette}
            title={text.googleTitle}
            icon={<Image source={GOOGLE_ICON} style={styles.onePlusIcon} />}
          />
          <Row
            palette={palette}
            title={text.helpFeedbackTitle}
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
    paddingBottom: 14,
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
  segmentTouchWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 4,
    bottom: 4,
    flexDirection: 'row',
    zIndex: 35,
  },
  segmentTouchZone: {
    flex: 1,
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


