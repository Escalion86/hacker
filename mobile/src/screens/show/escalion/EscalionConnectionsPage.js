import React from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

function SwitchMock({ on }) {
  return (
    <View style={[styles.switchTrack, on ? styles.switchTrackOn : styles.switchTrackOff]}>
      <View style={[styles.switchKnob, on ? styles.switchKnobOn : styles.switchKnobOff]} />
    </View>
  )
}

function ConnectionRow({
  title,
  subtitle,
  isFirst = false,
  isLast = false,
  right,
  onPress,
  titleBlue = false,
}) {
  return (
    <Pressable onPress={onPress} style={[styles.row, isFirst && styles.rowFirst, isLast && styles.rowLast]}>
      <View style={[styles.textWrap, !isLast && styles.rowDivider]}>
        <Text style={[styles.rowTitle, titleBlue && styles.rowTitleBlue]}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.rightWrap}>{right}</View>
    </Pressable>
  )
}

function NavRow({ title, isFirst = false, isLast = false }) {
  return (
    <Pressable style={[styles.row, styles.rowCompact, isFirst && styles.rowFirst, isLast && styles.rowLast]}>
      <View style={[styles.textWrap, !isLast && styles.rowDivider]}>
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      <View style={styles.rightWrap}>
        <Ionicons name="chevron-forward" size={20} color="#747a86" />
      </View>
    </Pressable>
  )
}

export default function EscalionConnectionsPage({ setPage, scrollY }) {
  const EXPAND_RANGE = 180
  const scrollRef = React.useRef(null)

  React.useEffect(() => {
    scrollY.setValue(EXPAND_RANGE)
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: 0, y: EXPAND_RANGE, animated: false })
    })
    return () => cancelAnimationFrame(id)
  }, [scrollY])

  const pullProgress = scrollY.interpolate({
    inputRange: [0, EXPAND_RANGE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  })
  const extraHeroTranslateY = scrollY.interpolate({
    inputRange: [0, EXPAND_RANGE],
    outputRange: [0, -EXPAND_RANGE],
    extrapolate: 'clamp',
  })

  return (
    <View style={styles.page}>
      <Animated.View style={styles.headerLayer} pointerEvents="box-none">
        <View style={styles.header}>
          <Pressable onPress={() => setPage('general')} hitSlop={10} style={styles.headerBack}>
            <Ionicons name="chevron-back" size={24} color="#f2f5fb" />
          </Pressable>
          <Animated.Text style={[styles.headerTitle, { opacity: Animated.subtract(1, pullProgress) }]}>
            Подключения
          </Animated.Text>
          <Pressable hitSlop={10} style={styles.headerSearch}>
            <Ionicons name="search" size={24} color="#f2f5fb" />
          </Pressable>
        </View>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.headerHero,
            {
              transform: [{ translateY: extraHeroTranslateY }],
              opacity: pullProgress,
            },
          ]}
        >
          <Text style={styles.headerHeroTitle}>Подключения</Text>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        contentOffset={{ x: 0, y: EXPAND_RANGE }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: EXPAND_RANGE }} />
        <View style={styles.card}>
          <ConnectionRow
            title="Wi-Fi"
            subtitle="Включено"
            titleBlue
            right={<SwitchMock on />}
            isFirst
            onPress={() => setPage('wifi')}
          />
          <ConnectionRow
            title="Вызовы по Wi-Fi"
            subtitle="Выключено"
            right={<SwitchMock on={false} />}
          />
          <ConnectionRow title="Bluetooth" subtitle="Включено" right={<SwitchMock on />} />
          <ConnectionRow
            title="NFC и бесконтактные платежи"
            subtitle="Выключено"
            right={<SwitchMock on={false} />}
          />
          <ConnectionRow
            title="Сверхширокая полоса (UWB)"
            subtitle="Точное местоположение устройства"
            right={<Ionicons name="chevron-forward" size={20} color="#747a86" />}
          />
          <ConnectionRow
            title="Авиарежим"
            subtitle="Выключено"
            right={<SwitchMock on={false} />}
            isLast
          />
        </View>

        <View style={styles.card}>
          <NavRow title="Диспетчер SIM-карт" isFirst />
          <NavRow title="Мобильные сети" />
          <NavRow title="Использование данных" />
          <NavRow title="Мобильная точка доступа и модем" isLast />
        </View>

        <View style={styles.card}>
          <NavRow title="Другие настройки" isFirst isLast />
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
  headerLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  header: {
    height: 86,
    backgroundColor: '#000',
    paddingTop: 34,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerHero: {
    height: 180,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerHeroTitle: {
    color: '#f2f5fb',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerBack: {
    width: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#f4f6fb',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginLeft: 4,
  },
  headerSearch: {
    width: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 14,
    paddingTop: 86,
    paddingBottom: 18,
    gap: 14,
  },
  card: {
    backgroundColor: '#171719',
    borderRadius: 26,
    overflow: 'hidden',
  },
  row: {
    minHeight: 105,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowCompact: {
    minHeight: 86,
  },
  rowFirst: {
    paddingTop: 2,
  },
  rowLast: {
    paddingBottom: 2,
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3c',
  },
  rowTitle: {
    color: '#f4f6fb',
    fontSize: 40 / 3, // ~13.33
    fontWeight: '400',
    letterSpacing: -0.05,
  },
  rowTitleBlue: {
    color: '#4d86ff',
  },
  rowSubtitle: {
    marginTop: 2,
    color: '#9a9ea8',
    fontSize: 31 / 3, // ~10.33
    lineHeight: 14,
    fontWeight: '400',
  },
  rightWrap: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  switchTrack: {
    width: 54,
    height: 34,
    borderRadius: 17,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f2f4fa',
  },
  switchKnobOn: {
    right: 2,
  },
  switchKnobOff: {
    left: 2,
  },
})
