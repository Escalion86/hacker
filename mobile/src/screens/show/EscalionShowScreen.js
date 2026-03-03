import React, { useMemo, useState } from 'react'
import { Animated, Platform, StyleSheet, Text, View } from 'react-native'
import bleService from '../../services/ble/bleService'
import { buildCardCode } from '../../show/accessProfiles'
import EscalionGeneralPage from './escalion/EscalionGeneralPage'
import EscalionConnectionsPage from './escalion/EscalionConnectionsPage'
import EscalionWifiPage from './escalion/EscalionWifiPage'

export default function EscalionShowScreen({
  settings,
  onChange,
  onOpenSettings,
}) {
  const bottomInset = Platform.OS === 'android' ? 0 : 0
  const [page, setPage] = useState('general')
  const [wifiSpots, setWifiSpots] = useState([])
  const generalScrollY = React.useRef(new Animated.Value(0)).current
  const connectionsScrollY = React.useRef(new Animated.Value(0)).current
  const wifiScrollY = React.useRef(new Animated.Value(0)).current

  const cardCode = useMemo(
    () => buildCardCode(settings.cardRankIndex, settings.cardMastIndex),
    [settings.cardRankIndex, settings.cardMastIndex],
  )

  React.useEffect(() => {
    const unsub = bleService.subscribeWifiSpots((spots) =>
      setWifiSpots(spots.slice(0, 12)),
    )
    return () => unsub()
  }, [])

  return (
    <View style={[styles.screen]}>
      {page === 'general' && (
        <EscalionGeneralPage
          settings={settings}
          onChange={onChange}
          onOpenSettings={onOpenSettings}
          setPage={setPage}
          scrollY={generalScrollY}
          cardCode={cardCode}
        />
      )}
      {page === 'connections' && (
        <EscalionConnectionsPage
          setPage={setPage}
          scrollY={connectionsScrollY}
        />
      )}
      {page === 'wifi' && (
        <EscalionWifiPage
          setPage={setPage}
          scrollY={wifiScrollY}
          wifiSpots={wifiSpots}
        />
      )}

      {settings.learn && (
        <View style={[styles.learnHintBar, { paddingBottom: 8 + bottomInset }]}>
          <Text style={styles.learnHintText}>
            Свайп по "Подключения" меняет масть. Номинал задается тапами по
            скрытым сегментам строк ниже.
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  learnHintBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#202738',
    backgroundColor: '#0d111a',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  learnHintText: {
    color: '#d8dde9',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
})
