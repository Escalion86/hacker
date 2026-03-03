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

function WifiRow({ title, color = '#2f76ff', noBorder = false }) {
  return (
    <View style={[styles.wifiRow, !noBorder && styles.wifiRowDivider]}>
      <Ionicons name="wifi" size={28} color={color} />
      <Text style={styles.wifiName}>{title}</Text>
    </View>
  )
}

export default function EscalionWifiPage({ setPage, scrollY, wifiSpots }) {
  const shownSpots = wifiSpots.filter((spot) => spot && spot.trim() !== '')

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
            <Text style={styles.enabledTitle}>Включено</Text>
            <SwitchMock on />
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>Доступные сети</Text>

          {shownSpots.length === 0 ? null : (
            <View style={styles.card}>
              {shownSpots.map((spot, index) => (
                <WifiRow
                  key={`${spot}-${index}`}
                  title={spot}
                  color={index % 3 === 1 ? '#7f8593' : '#2f76ff'}
                  noBorder={index === shownSpots.length - 1}
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
    fontSize: 22 / 2,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
})
