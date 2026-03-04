import React, { useMemo, useState } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import bleService from '../../../services/ble/bleService'
import { buildCardCode } from '../../../show/accessProfiles'
import FertVladGeneralPage from './FertVladGeneralPage'
import FertVladWifiPage from './FertVladWifiPage'

export default function FertVladShowScreen({ settings, onChange, onOpenSettings }) {
  const [page, setPage] = useState('general')
  const [wifiSpots, setWifiSpots] = useState([])
  const [wifiEnabled, setWifiEnabled] = useState(
    Boolean(settings.startOnSetWiFiPage),
  )
  const generalScrollY = React.useRef(new Animated.Value(0)).current
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
    <View style={styles.screen}>
      {page === 'general' ? (
        <FertVladGeneralPage
          settings={settings}
          onChange={onChange}
          setPage={setPage}
          scrollY={generalScrollY}
          onOpenSettings={onOpenSettings}
        />
      ) : (
        <FertVladWifiPage
          setPage={setPage}
          scrollY={wifiScrollY}
          wifiSpots={wifiSpots}
          settings={settings}
          cardCode={cardCode}
          wifiEnabled={wifiEnabled}
          onWifiEnabledChange={setWifiEnabled}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
})
