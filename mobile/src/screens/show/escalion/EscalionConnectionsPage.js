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
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.rowRight}>{right}</View>
      {rightDivider ? <View style={styles.rowRightDivider} /> : null}
      {!noBorder ? <View style={styles.rowDividerLine} /> : null}
    </Pressable>
  )
}

function NavRow({ title, noBorder }) {
  return (
    <Pressable style={styles.row}>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      <View style={styles.rowRight}>
        <Ionicons name="chevron-forward" size={20} color="#757b87" />
      </View>
      {!noBorder ? <View style={styles.rowDividerLine} /> : null}
    </Pressable>
  )
}

export default function EscalionConnectionsPage({ setPage, scrollY }) {
  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setPage('general')}
          hitSlop={10}
          style={styles.headerBack}
        >
          <Ionicons name="chevron-back" size={24} color="#f2f5fb" />
        </Pressable>
        <Text style={styles.headerTitle}>Подключения</Text>
        <View style={styles.headerSearch}>
          <Ionicons name="search" size={24} color="#f2f5fb" />
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
        <View style={styles.card}>
          <ConnectionRow
            title="Wi-Fi"
            right={<SwitchMock on={false} />}
            onPress={() => setPage('wifi')}
            rightDivider
          />
          <ConnectionRow
            title="Вызовы по Wi-Fi"
            right={<SwitchMock on={false} />}
            rightDivider
          />
          <ConnectionRow
            title="Bluetooth"
            right={<SwitchMock on />}
            rightDivider
          />
          <ConnectionRow
            title="NFC и бесконтактные платежи"
            right={<SwitchMock on />}
            rightDivider
          />
          <ConnectionRow
            title="Сверхширокая полоса (UWB)"
            subtitle="Определение точного местоположения устройства поблизости."
            right={<SwitchMock on={false} />}
            noBorder
          />
        </View>

        <View style={styles.card}>
          <ConnectionRow
            title="Авиарежим"
            right={<SwitchMock on={false} />}
            noBorder
            rightDivider
          />
        </View>

        <View style={styles.card}>
          <NavRow title="Диспетчер SIM-карт" />
          <NavRow title="Мобильные сети" />
          <NavRow title="Использование данных" />
          <NavRow title="Мобильная точка доступа и модем" noBorder />
        </View>

        <View style={styles.card}>
          <NavRow title="Другие настройки" noBorder />
        </View>

        <View style={styles.suggestCard}>
          <Text style={styles.suggestTitle}>Ищете что-то другое?</Text>
          <Text style={styles.suggestItem}>Samsung Cloud</Text>
          <Text style={styles.suggestItem}>Связь с Windows</Text>
          <Text style={styles.suggestItem}>Android Auto</Text>
          <Text style={styles.suggestItem}>Быстрая отправка</Text>
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
