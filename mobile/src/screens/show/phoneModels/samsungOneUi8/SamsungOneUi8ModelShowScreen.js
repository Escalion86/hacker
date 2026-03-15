import React, { useMemo, useState } from 'react'
import { Animated, Platform, StyleSheet, Text, View } from 'react-native'
import bleService from '../../../../services/ble/bleService'
import { buildCardCode } from '../../../../show/accessProfiles'
import { isShowThemeLight } from '../../shared/themeMode'
import SamsungOneUi8GeneralPage from './SamsungOneUi8GeneralPage'
import SamsungOneUi8ConnectionsPage from './SamsungOneUi8ConnectionsPage'
import SamsungOneUi8WifiPage from './SamsungOneUi8WifiPage'

export default function SamsungOneUi8ModelShowScreen({
  settings,
  onChange,
  onOpenSettings,
}) {
  const bottomInset = Platform.OS === 'android' ? 0 : 0
  const [page, setPage] = useState('general')
  const [wifiSpots, setWifiSpots] = useState([])
  const [wifiEnabled, setWifiEnabled] = useState(
    Boolean(settings.startOnSetWiFiPage),
  )
  const generalScrollY = React.useRef(new Animated.Value(0)).current
  const connectionsScrollY = React.useRef(new Animated.Value(0)).current
  const wifiScrollY = React.useRef(new Animated.Value(0)).current
  const lightTheme = isShowThemeLight(settings, 'samsungOneUi8')

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
    <View style={[styles.screen, { backgroundColor: lightTheme ? '#eceef1' : '#000' }]}>
      {page === 'general' && (
        <SamsungOneUi8GeneralPage
          settings={settings}
          onChange={onChange}
          onOpenSettings={onOpenSettings}
          setPage={setPage}
          scrollY={generalScrollY}
          cardCode={cardCode}
          isLightTheme={lightTheme}
        />
      )}
      {page === 'connections' && (
        <SamsungOneUi8ConnectionsPage
          setPage={setPage}
          scrollY={connectionsScrollY}
          wifiEnabled={wifiEnabled}
          isLightTheme={lightTheme}
        />
      )}
      {page === 'wifi' && (
        <SamsungOneUi8WifiPage
          setPage={setPage}
          scrollY={wifiScrollY}
          wifiSpots={wifiSpots}
          settings={settings}
          cardCode={cardCode}
          wifiEnabled={wifiEnabled}
          onWifiEnabledChange={setWifiEnabled}
          isLightTheme={lightTheme}
        />
      )}

      {settings.learn && (
        <View
          style={[
            styles.learnHintBar,
            {
              paddingBottom: 8 + bottomInset,
              borderTopColor: lightTheme ? '#d6dce8' : '#202738',
              backgroundColor: lightTheme ? '#f2f5fb' : '#0d111a',
            },
          ]}
        >
          <Text style={[styles.learnHintText, { color: lightTheme ? '#3b4354' : '#d8dde9' }]}>
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
