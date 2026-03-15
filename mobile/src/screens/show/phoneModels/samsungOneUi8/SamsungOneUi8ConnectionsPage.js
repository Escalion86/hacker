import React from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

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

function ConnectionRow({
  title,
  subtitle,
  right,
  onPress,
  noBorder,
  rightDivider = false,
  palette,
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowTitle, { color: palette.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: palette.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={styles.rowRight}>{right}</View>
      {rightDivider ? (
        <View style={[styles.rowRightDivider, { backgroundColor: palette.dividerStrong }]} />
      ) : null}
      {!noBorder ? <View style={[styles.rowDividerLine, { backgroundColor: palette.divider }]} /> : null}
    </Pressable>
  )
}

function NavRow({ title, noBorder, palette }) {
  return (
    <Pressable style={styles.row}>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowTitle, { color: palette.textPrimary }]}>{title}</Text>
      </View>
      <View style={styles.rowRight}>
        <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
      </View>
      {!noBorder ? <View style={[styles.rowDividerLine, { backgroundColor: palette.divider }]} /> : null}
    </Pressable>
  )
}

export default function SamsungOneUi8ConnectionsPage({
  setPage,
  scrollY,
  wifiEnabled,
  isLightTheme = false,
}) {
  const palette = isLightTheme
    ? {
        pageBg: '#eceef1',
        headerBg: '#eceef1',
        textPrimary: '#181a1f',
        textSecondary: '#666d79',
        cardBg: '#f8f9fb',
        divider: '#dde1e7',
        dividerStrong: '#cfd4dd',
        suggestBg: '#f2f5fb',
      }
    : {
        pageBg: '#000',
        headerBg: '#000',
        textPrimary: '#f3f5fa',
        textSecondary: '#757b87',
        cardBg: '#171719',
        divider: '#343741',
        dividerStrong: '#3f424a',
        suggestBg: '#081327',
      }
  return (
    <View style={[styles.page, { backgroundColor: palette.pageBg }]}>
      <View style={[styles.header, { backgroundColor: palette.headerBg }]}>
        <Pressable
          onPress={() => setPage('general')}
          hitSlop={10}
          style={styles.headerBack}
        >
          <Ionicons name="chevron-back" size={24} color={palette.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Подключения</Text>
        <View style={styles.headerSearch}>
          <Ionicons name="search" size={24} color={palette.textPrimary} />
        </View>
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
          <ConnectionRow
            palette={palette}
            title="Wi-Fi"
            right={<SwitchMock on={Boolean(wifiEnabled)} />}
            onPress={() => setPage('wifi')}
            rightDivider
          />
          <ConnectionRow
            palette={palette}
            title="Вызовы по Wi-Fi"
            right={<SwitchMock on={false} />}
            rightDivider
          />
          <ConnectionRow
            palette={palette}
            title="Bluetooth"
            right={<SwitchMock on />}
            rightDivider
          />
          <ConnectionRow
            palette={palette}
            title="NFC и бесконтактные платежи"
            right={<SwitchMock on />}
            rightDivider
          />
          <ConnectionRow
            palette={palette}
            title="Сверхширокая полоса (UWB)"
            subtitle="Определение точного местоположения устройства поблизости."
            right={<SwitchMock on={false} />}
            noBorder
          />
        </View>

        <View style={[styles.card, { backgroundColor: palette.cardBg }]}>
          <ConnectionRow
            palette={palette}
            title="Авиарежим"
            right={<SwitchMock on={false} />}
            noBorder
            rightDivider
          />
        </View>

        <View style={[styles.card, { backgroundColor: palette.cardBg }]}>
          <NavRow title="Диспетчер SIM-карт" palette={palette} />
          <NavRow title="Мобильные сети" palette={palette} />
          <NavRow title="Использование данных" palette={palette} />
          <NavRow title="Мобильная точка доступа и модем" noBorder palette={palette} />
        </View>

        <View style={[styles.card, { backgroundColor: palette.cardBg }]}>
          <NavRow title="Другие настройки" noBorder palette={palette} />
        </View>

        <View style={[styles.suggestCard, { backgroundColor: palette.suggestBg }]}>
          <Text style={[styles.suggestTitle, { color: palette.textPrimary }]}>Ищете что-то другое?</Text>
          <Text style={[styles.suggestItem, { color: palette.textSecondary }]}>Samsung Cloud</Text>
          <Text style={[styles.suggestItem, { color: palette.textSecondary }]}>Связь с Windows</Text>
          <Text style={[styles.suggestItem, { color: palette.textSecondary }]}>Android Auto</Text>
          <Text style={[styles.suggestItem, { color: palette.textSecondary }]}>Быстрая отправка</Text>
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
    height: 70,
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
  headerSearch: {
    width: 28,
    alignItems: 'flex-end',
  },
  debugCodeWrap: {
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  debugCodeText: {
    color: '#8ea3cf',
    fontSize: 12,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    borderRadius: 23,
    overflow: 'hidden',
    backgroundColor: '#171719',
  },
  row: {
    minHeight: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTextWrap: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 10,
    justifyContent: 'center',
  },
  rowDividerLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
    height: 1,
    backgroundColor: '#343741',
  },
  rowTitle: {
    color: '#f4f6fb',
    fontSize: 16,
    fontWeight: '400',
  },
  rowSubtitle: {
    marginTop: 1,
    color: '#9a9ea8',
    fontSize: 10,
    lineHeight: 12.5,
  },
  rowRight: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rowRightDivider: {
    position: 'absolute',
    right: 72,
    top: '50%',
    marginTop: -10,
    width: 1,
    height: 20,
    backgroundColor: '#3f424a',
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
  suggestCard: {
    borderRadius: 26,
    backgroundColor: '#081327',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 6,
  },
  suggestTitle: {
    color: '#e8edf8',
    fontSize: 17,
    marginBottom: 4,
  },
  suggestItem: {
    color: '#5a85ff',
    fontSize: 17,
    lineHeight: 26,
  },
})
