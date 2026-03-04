import React, { useRef } from 'react'
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

function IconBall({ name, lib = 'ion', color = '#317dff' }) {
  return (
    <View style={[styles.iconBall, { backgroundColor: color }]}>
      {lib === 'ion' ? (
        <Ionicons name={name} size={16} color="#fff" />
      ) : (
        <MaterialCommunityIcons name={name} size={16} color="#fff" />
      )}
    </View>
  )
}

function Row({
  title,
  subtitle,
  icon,
  onPress,
  onPressIn,
  onPressOut,
  noBorder,
  segmentCount = 0,
  onSegmentTouch,
  showLearnOverlay = false,
  learnOverlayLabels = [],
  onLearnSelect,
}) {
  const rowWidthRef = useRef(1)

  const emitSegment = (segment) => {
    if (onSegmentTouch) onSegmentTouch(segment)
    if (onLearnSelect) onLearnSelect(segment)
  }

  const getSegmentFromEvent = (event, count) => {
    if (!count) return null
    const width = Math.max(1, rowWidthRef.current)
    const x = Math.max(0, Math.min(width, event.nativeEvent.locationX))
    return Math.max(0, Math.min(count - 1, Math.floor(x / (width / count))))
  }

  const handleSegmentTouch = (event, count = segmentCount) => {
    const segment = getSegmentFromEvent(event, count)
    if (segment === null) return
    emitSegment(segment)
  }

  const overlayCount = learnOverlayLabels.length || segmentCount

  const handleLearnTouch = (event) => {
    if (!overlayCount) return
    handleSegmentTouch(event, overlayCount)
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={(event) => {
        if (!showLearnOverlay && segmentCount > 0) {
          handleSegmentTouch(event)
        }
        if (onPressIn) onPressIn(event)
      }}
      onPressOut={onPressOut}
      onLayout={(event) => {
        rowWidthRef.current = event.nativeEvent.layout.width
      }}
      onTouchMove={!showLearnOverlay ? handleSegmentTouch : undefined}
      style={[styles.row]}
    >
      <View pointerEvents="none" style={styles.rowLeft}>
        {icon}
        <View
          pointerEvents="none"
          style={[styles.rowTextWrap, noBorder && styles.rowNoBorder]}
        >
          <Text style={styles.rowTitle}>{title}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {showLearnOverlay && learnOverlayLabels.length > 0 ? (
        <View
          style={styles.learnOverlayWrap}
          onTouchStart={handleLearnTouch}
          onTouchMove={handleLearnTouch}
        >
          {learnOverlayLabels.map((label, index) => (
            <View
              key={`${title}-learn-${label}-${index}`}
              pointerEvents="none"
              style={[
                styles.learnOverlaySegment,
                index > 0 && styles.learnOverlaySegmentBorder,
              ]}
            >
              <Text pointerEvents="none" style={styles.learnOverlayText}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  )
}

export default function EscalionGeneralPage({
  settings,
  onChange,
  onOpenSettings,
  setPage,
  scrollY,
  cardCode,
}) {
  const scrollRef = useRef(null)
  const swipeStartY = useRef(0)
  const hasManualRankSelectionRef = useRef(false)
  const HERO_HEIGHT = 300
  const TITLE_HEIGHT = HERO_HEIGHT - 90

  const shiftRank = (delta) => {
    hasManualRankSelectionRef.current = true
    const next = (settings.cardRankIndex + delta + 14) % 14
    onChange({ cardRankIndex: next })
  }

  const setRankSegment = (base, segment) => {
    hasManualRankSelectionRef.current = true
    onChange({ cardRankIndex: Math.min(13, base + segment) })
  }

  const bigHeaderOpacity = scrollY.interpolate({
    inputRange: [0, TITLE_HEIGHT / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  })
  const bigHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, (TITLE_HEIGHT / 3) * 2],
    outputRange: [0, TITLE_HEIGHT / 2],
    extrapolate: 'clamp',
  })
  const smallHeaderOpacity = scrollY.interpolate({
    inputRange: [TITLE_HEIGHT / 2, (TITLE_HEIGHT / 3) * 2],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })
  const searchTranslateY = scrollY.interpolate({
    inputRange: [0, TITLE_HEIGHT + 40],
    outputRange: [TITLE_HEIGHT + 40, 0],
    extrapolate: 'clamp',
  })

  React.useEffect(() => {
    scrollY.setValue(0)
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false })
    })
    return () => cancelAnimationFrame(id)
  }, [scrollY])

  const profileName = (settings.showOperatorName || '').trim() || 'Алексей Белинский'
  const avatarUri = (settings.showOperatorAvatar || '').trim()

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.searchFloating,
          {
            transform: [{ translateY: searchTranslateY }],
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            {
              opacity: smallHeaderOpacity,
              backgroundColor: '#000',
              position: 'absolute',
              top: -40,
              left: 0,
              right: 0,
              bottom: 0,
            },
          ]}
        />
        <Animated.Text
          style={[
            styles.headerTitleSmall,
            {
              opacity: smallHeaderOpacity,
              width: '100%',
              position: 'absolute',
              bottom: 20,
              left: 32,
            },
          ]}
        >
          Настройки
        </Animated.Text>
        <Ionicons
          style={{ position: 'absolute', right: 14, bottom: 20 }}
          name="search"
          size={24}
          color="#f2f5fb"
        />
      </Animated.View>
      {settings.learn ? (
        <View style={styles.learnCode}>
          <Text style={styles.code}>Код: {cardCode}</Text>
        </View>
      ) : null}
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: HERO_HEIGHT }}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.heroTitleWrap,
              {
                transform: [{ translateY: bigHeaderTranslateY }],
                paddingTop: 54,
                zIndex: 90,
              },
            ]}
          >
            <Animated.Text
              style={[styles.headerTitleBig, { opacity: bigHeaderOpacity }]}
            >
              Настройки
            </Animated.Text>
          </Animated.View>
        </View>

        <View style={styles.cardsStack}>
          <View style={[styles.card, styles.profileCard]}>
            <View style={styles.profileTextWrap}>
              <Text style={styles.profileName}>{profileName}</Text>
              <Text style={styles.profileSub}>Samsung account</Text>
            </View>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
          </View>

          <View style={styles.card}>
            <Row
              title="Подключения"
              subtitle="Wi-Fi • Bluetooth • Диспетчер SIM-карт"
              icon={<IconBall name="wifi" color="#336ee6" />}
              segmentCount={4}
              onSegmentTouch={(segment) => {
                onChange({
                  cardMastIndex: segment,
                  cardRankIndex: hasManualRankSelectionRef.current
                    ? settings.cardRankIndex
                    : 0,
                })
                setPage('connections')
              }}
              showLearnOverlay={settings.learn}
              learnOverlayLabels={['♠️', '♥️', '♣️', '♦️']}
              onPressIn={(event) => {
                swipeStartY.current = event.nativeEvent.pageY
              }}
              onPressOut={(event) => {
                const delta = event.nativeEvent.pageY - swipeStartY.current
                if (delta <= -16) shiftRank(1)
                if (delta >= 16) shiftRank(-1)
              }}
            />
            <Row
              title="Подключенные устройства"
              subtitle="Быстрая отправка • Samsung DeX • Android Auto"
              icon={<IconBall name="phone-portrait" color="#336ee6" />}
              onPress={() => setRankSegment(0, 0)}
              segmentCount={4}
              onSegmentTouch={(segment) => setRankSegment(0, segment)}
              showLearnOverlay={settings.learn}
              learnOverlayLabels={['A', '2', '3', '4']}
              noBorder
            />
          </View>

          <View style={styles.card}>
            <Row
              title="Galaxy AI"
              subtitle="Ассистент по письму • Ассистент по заметкам • Ассистент по фотографиям"
              icon={<IconBall name="sparkles" color="#1c9fd8" />}
              segmentCount={4}
              onSegmentTouch={(segment) => setRankSegment(4, segment)}
              showLearnOverlay={settings.learn}
              learnOverlayLabels={['5', '6', '7', '8']}
            />
            <Row
              title="Режимы и сценарии"
              subtitle="Режимы • Сценарии"
              icon={<IconBall name="checkmark-done-circle" color="#6858ef" />}
              segmentCount={4}
              onSegmentTouch={(segment) => setRankSegment(8, segment)}
              showLearnOverlay={settings.learn}
              learnOverlayLabels={['9', '10', 'J', 'Q']}
            />
            <Row
              title="Звуки и вибрация"
              subtitle="Рингтон • Громкость • Вибрация"
              icon={<IconBall name="volume-high" color="#655ce8" />}
              segmentCount={2}
              onSegmentTouch={(segment) => setRankSegment(12, segment)}
              showLearnOverlay={settings.learn}
              learnOverlayLabels={['K', 'Joker']}
            />
            <Row
              title="Уведомления"
              subtitle="Строка состояния • Не беспокоить"
              icon={<IconBall name="notifications" color="#dd621a" />}
              noBorder
            />
          </View>

          <View style={styles.card}>
            <Row
              title="Дисплей"
              subtitle="Яркость • Комфорт для глаз • Навигационная панель"
              icon={<IconBall name="sunny" color="#95c11f" />}
            />
            <Row
              title="Батарея"
              subtitle="Энергосбережение • Зарядка"
              icon={<IconBall name="battery-half" color="#56bf3f" />}
            />
            <Row
              title="Обои и стиль"
              subtitle="Обои • Палитра цветов"
              icon={<IconBall name="image" color="#d45684" />}
              noBorder
            />
          </View>

          <View style={styles.card}>
            <Row
              title="Безопасность и конфиденциальность"
              subtitle="Биометрия • Разрешения"
              icon={<IconBall name="shield-checkmark" color="#6a59ee" />}
            />
            <Row
              title="Локация"
              subtitle="Доступ к местоположению"
              icon={<IconBall name="location" color="#6a59ee" />}
            />
            <Row
              title="Экстренные ситуации"
              subtitle="SOS и медданные"
              icon={<IconBall name="warning" color="#d63c39" />}
              noBorder
            />
          </View>

          <View style={styles.card}>
            <Row
              title="Учетные записи и архивация"
              subtitle="Управление аккаунтами • Smart Switch"
              icon={<IconBall name="sync" color="#3f82ff" />}
            />
            <Row
              title="Google"
              subtitle="Службы Google"
              icon={<IconBall name="logo-google" color="#3f82ff" />}
            />
            <Row
              title="Дополнительные функции"
              subtitle="Labs • Боковая кнопка"
              icon={<IconBall name="sparkles" color="#e4ad45" />}
              noBorder
            />
          </View>

          <View style={styles.card}>
            <Row
              title="Использование устройства и родительский контроль"
              subtitle="Время экрана • Таймеры"
              icon={<IconBall name="timer-outline" color="#63be3c" />}
            />
            <Row
              title="Обслуживание устройства"
              subtitle="Хранилище • Память • Защита"
              icon={<IconBall name="build" color="#7871b8" />}
            />
            <Row
              title="Приложения"
              subtitle="Приложения по умолчанию"
              icon={<IconBall name="apps" color="#3f82ff" />}
              noBorder
            />
          </View>

          <View style={styles.card}>
            <Row
              title="Общие настройки"
              subtitle="Язык и клавиатура • Дата и время"
              icon={<IconBall name="settings" color="#7871b8" />}
            />
            <Row
              title="Специальные возможности"
              subtitle="Отображение • Слышимость • Подвижность"
              icon={<IconBall name="accessibility" color="#63be3c" />}
            />
            <Row
              title="Обновление ПО"
              subtitle="Загрузка и установка"
              icon={<IconBall name="download" color="#3f82ff" />}
            />
            <Row
              title="Советы и руководство пользователя"
              subtitle="Полезные советы • Новые функции"
              icon={<IconBall name="bulb" color="#e4ad45" />}
            />
            <Row
              title="Сведения о телефоне"
              subtitle="Состояние • Юридическая информация"
              icon={<IconBall name="information-circle" color="#7871b8" />}
            />
            <Row
              title="Параметры разработчика"
              subtitle="Открыть экран настроек приложения"
              icon={<IconBall name="code-slash" color="#7871b8" />}
              onPress={onOpenSettings}
              noBorder
            />
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  heroTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 72,
    alignItems: 'center',
  },
  searchFloating: {
    position: 'absolute',
    paddingHorizontal: 14,
    zIndex: 45,
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 65,
  },
  headerTitleBig: {
    color: '#f2f2f4',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerTitleSmall: {
    color: '#f2f2f4',
    fontSize: 21,
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 14,
    gap: 14,
  },
  cardsStack: {
    gap: 14,
  },
  card: {
    backgroundColor: '#171719',
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 0,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
  profileTextWrap: {
    flex: 1,
    paddingRight: 14,
  },
  profileName: {
    color: '#f5f7fa',
    fontSize: 18,
    fontWeight: '700',
  },
  profileSub: {
    marginTop: 3,
    color: '#767676',
    fontSize: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    borderColor: '#2f3441',
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    borderColor: '#2f3441',
    backgroundColor: '#222631',
  },
  row: {
    minHeight: 72,
    paddingHorizontal: 20,
    justifyContent: 'center',
    position: 'relative',
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
    lineHeight: 18,
    paddintTop: 2,
  },
  iconBall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnOverlayWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 6,
    bottom: 6,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    zIndex: 30,
    backgroundColor: 'rgba(22, 35, 64, 0.25)',
  },
  learnOverlaySegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnOverlaySegmentBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(140, 170, 255, 0.45)',
  },
  learnOverlayText: {
    color: '#d9e6ff',
    fontSize: 18,
    fontWeight: '700',
  },
  learnCode: {
    position: 'absolute',
    left: 20,
    top: 6,
    zIndex: 99,
    padding: 4,
    backgroundColor: 'rgba(22, 35, 64, 0.9Cltqk)',
    borderRadius: 8,
  },
  code: {
    color: '#8ca8ff',
    fontSize: 12,
    fontWeight: '600',
  },
})
