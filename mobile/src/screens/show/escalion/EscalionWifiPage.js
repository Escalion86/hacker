import React from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

function IconBall({ name, lib = 'ion', color = '#317dff' }) {
  return (
    <View style={[styles.iconBall, { backgroundColor: color }]}>
      {lib === 'ion' ? (
        <Ionicons name={name} size={20} color="#fff" />
      ) : (
        <MaterialCommunityIcons name={name} size={20} color="#fff" />
      )}
    </View>
  )
}

function Row({ title, subtitle, icon, onPress, noBorder }) {
  return (
    <Pressable onPress={onPress} style={[styles.row]}>
      <View style={styles.rowLeft}>
        {icon}
        <View style={[styles.rowTextWrap, noBorder && styles.rowNoBorder]}>
          <Text style={styles.rowTitle}>{title}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </Pressable>
  )
}

export default function EscalionWifiPage({ setPage, scrollY, wifiSpots }) {
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
          <Pressable onPress={() => setPage('connections')} hitSlop={10} style={styles.headerBack}>
            <Ionicons name="chevron-back" size={24} color="#f2f5fb" />
          </Pressable>
          <Animated.Text style={[styles.headerTitleSmall, { opacity: Animated.subtract(1, pullProgress) }]}>
            Wi-Fi
          </Animated.Text>
          <Pressable hitSlop={10} style={styles.searchWrapSmall}>
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
          <Text style={styles.headerHeroTitle}>Wi-Fi</Text>
        </Animated.View>
      </Animated.View>
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll]}
        contentOffset={{ x: 0, y: EXPAND_RANGE }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
          },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: EXPAND_RANGE }} />
        <View style={styles.card}>
          <Row title="Включено" subtitle="Сети доступны" icon={<IconBall name="wifi" color="#317dff" />} />
        </View>
        <View style={styles.card}>
          {wifiSpots.length === 0 ? (
            <Row title="Список пуст" subtitle="" icon={<IconBall name="wifi" color="#317dff" />} noBorder />
          ) : (
            wifiSpots.map((spot, index) => (
              <Row
                key={`${spot}-${index}`}
                title={spot}
                subtitle=""
                icon={<IconBall name="wifi" color="#317dff" />}
                noBorder={index === wifiSpots.length - 1}
              />
            ))
          )}
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
  headerTitleSmall: {
    flex: 1,
    color: '#f2f2f4',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginLeft: 4,
  },
  headerBack: {
    width: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  searchWrapSmall: {
    width: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
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
    borderWidth: 0,
  },
  row: {
    minHeight: 72,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  rowNoBorder: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  rowTextWrap: {
    flex: 1,
    gap: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3c',
    minHeight: 60,
    marginTop: 12,
    paddingBottom: 12,
  },
  rowTitle: {
    color: '#f5f7fa',
    fontSize: 15,
    fontWeight: '400',
  },
  rowSubtitle: {
    color: '#949494',
    fontSize: 12,
    lineHeight: 16,
  },
  iconBall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
