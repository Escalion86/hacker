import React, { useRef } from 'react'
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

const avatar = require('../../../../assets/escalion.png')

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

function Row({
  title,
  subtitle,
  icon,
  onPress,
  onPressIn,
  onPressOut,
  onTouchStart,
  noBorder,
}) {
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchStart={onTouchStart}
      style={[styles.row]}
    >
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
  const selectorWidth = useRef(1)
  const HERO_HEIGHT = 320
  const TITLE_HEIGHT = HERO_HEIGHT - 90

  const shiftRank = (delta) => {
    const next = (settings.cardRankIndex + delta + 14) % 14
    onChange({ cardRankIndex: next })
  }

  const setRankSegment = (base, segment) => {
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
    inputRange: [0, TITLE_HEIGHT],
    outputRange: [TITLE_HEIGHT, 0],
    extrapolate: 'clamp',
  })

  React.useEffect(() => {
    scrollY.setValue(0)
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false })
    })
    return () => cancelAnimationFrame(id)
  }, [scrollY])

  return (
    <>
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
      {settings.learn ? <Text style={styles.learnCode}>Код: {cardCode}</Text> : null}
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
            <Animated.Text style={[styles.headerTitleBig, { opacity: bigHeaderOpacity }]}>
              Настройки
            </Animated.Text>
          </Animated.View>
        </View>

        <View style={styles.cardsStack}>
          <View style={[styles.card, styles.profileCard]}>
            <View style={styles.profileTextWrap}>
              <Text style={styles.profileName}>Алексей Белинский</Text>
              <Text style={styles.profileSub}>Samsung account</Text>
            </View>
            <Image source={avatar} style={styles.avatar} />
          </View>

          <View style={styles.card}>
            <Row
              title="Подключения"
              subtitle="Wi-Fi • Bluetooth • Диспетчер SIM-карт"
              icon={<IconBall name="wifi" color="#2d7af2" />}
              onPress={() => setPage('connections')}
              onPressIn={(event) => {
                swipeStartY.current = event.nativeEvent.pageY
              }}
              onPressOut={(event) => {
                const delta = event.nativeEvent.pageY - swipeStartY.current
                if (delta <= -16) shiftRank(1)
                if (delta >= 16) shiftRank(-1)
              }}
              onTouchStart={(event) => {
                const w = selectorWidth.current || 1
                const x = event.nativeEvent.locationX
                const pad = 20
                if (x > pad && x < w - pad) {
                  const part = (w - pad * 2) / 4
                  const mast = Math.max(0, Math.min(3, Math.floor((x - pad) / part)))
                  onChange({ cardMastIndex: mast })
                }
              }}
            />
            <Row
              title="Подключенные устройства"
              subtitle="Быстрая отправка • Samsung DeX • Android Auto"
              icon={<IconBall name="phone-portrait" color="#2d7af2" />}
              onPress={() => setRankSegment(0, 0)}
              onTouchStart={(event) => {
                const x = event.nativeEvent.locationX
                const seg = Math.max(0, Math.min(3, Math.floor(x / (selectorWidth.current / 4))))
                setRankSegment(0, seg)
              }}
              onPressIn={(event) => {
                selectorWidth.current = event.nativeEvent.locationX * 2 || 320
              }}
              noBorder
            />
          </View>

          <View style={styles.card}>
            <Row
              title="Galaxy AI"
              subtitle="Ассистент по письму • Ассистент по заметкам • Ассистент по фотографиям"
              icon={<IconBall name="sparkles" color="#32b7a5" />}
            />
            <Row
              title="Режимы и сценарии"
              subtitle="Режимы • Сценарии"
              icon={<IconBall name="moon" color="#6d5af4" />}
              onTouchStart={(event) => {
                const x = event.nativeEvent.locationX
                const seg = Math.max(0, Math.min(3, Math.floor(x / (selectorWidth.current / 4))))
                setRankSegment(4, seg)
              }}
              onPressIn={(event) => {
                selectorWidth.current = event.nativeEvent.locationX * 2 || 320
              }}
            />
            <Row
              title="Звуки и вибрация"
              subtitle="Рингтон • Громкость • Вибрация"
              icon={<IconBall name="volume-high" color="#6f54f2" />}
              onTouchStart={(event) => {
                const x = event.nativeEvent.locationX
                const seg = Math.max(0, Math.min(3, Math.floor(x / (selectorWidth.current / 4))))
                setRankSegment(8, seg)
              }}
              onPressIn={(event) => {
                selectorWidth.current = event.nativeEvent.locationX * 2 || 320
              }}
            />
            <Row
              title="Уведомления"
              subtitle="Строка состояния • Не беспокоить"
              icon={<IconBall name="notifications" color="#8a93a8" />}
              onTouchStart={(event) => {
                const x = event.nativeEvent.locationX
                const seg = Math.max(0, Math.min(1, Math.floor(x / (selectorWidth.current / 2))))
                setRankSegment(12, seg)
              }}
              onPressIn={(event) => {
                selectorWidth.current = event.nativeEvent.locationX * 2 || 320
              }}
              noBorder
            />
          </View>

          <View style={styles.card}>
            <Row
              title="Дисплей"
              subtitle="Яркость • Комфорт для глаз • Навигационная панель"
              icon={<IconBall name="phone-portrait" color="#8a93a8" />}
            />
            <Row
              title="Батарея"
              subtitle="Энергосбережение • Зарядка"
              icon={<IconBall name="battery-half" color="#8a93a8" />}
            />
            <Row
              title="Обои и стиль"
              subtitle="Обои • Палитра цветов"
              icon={<IconBall name="color-palette" color="#8a93a8" />}
              noBorder
            />
          </View>

          <View style={styles.card}>
            <Row
              title="Безопасность и конфиденциальность"
              subtitle="Биометрия • Разрешения"
              icon={<IconBall name="shield-checkmark" color="#666d7f" />}
            />
            <Row
              title="Локация"
              subtitle="Доступ к местоположению"
              icon={<IconBall name="location" color="#666d7f" />}
            />
            <Row
              title="Экстренные ситуации"
              subtitle="SOS и медданные"
              icon={<IconBall name="warning" color="#666d7f" />}
              noBorder
            />
          </View>

          <View style={styles.card}>
            <Row
              title="Учетные записи и архивация"
              subtitle="Управление аккаунтами • Smart Switch"
              icon={<IconBall name="person" color="#666d7f" />}
            />
            <Row
              title="Google"
              subtitle="Службы Google"
              icon={<IconBall name="logo-google" color="#666d7f" />}
            />
            <Row
              title="Дополнительные функции"
              subtitle="Labs • Боковая кнопка"
              icon={<IconBall name="sparkles" color="#666d7f" />}
              noBorder
            />
          </View>

          <View style={styles.card}>
            <Row
              title="Использование устройства и родительский контроль"
              subtitle="Время экрана • Таймеры"
              icon={<IconBall name="time" color="#666d7f" />}
            />
            <Row
              title="Обслуживание устройства"
              subtitle="Хранилище • Память • Защита"
              icon={<IconBall name="build" color="#666d7f" />}
            />
            <Row
              title="Приложения"
              subtitle="Приложения по умолчанию"
              icon={<IconBall name="apps" color="#666d7f" />}
              noBorder
            />
          </View>

          <View style={styles.card}>
            <Row
              title="Общие настройки"
              subtitle="Язык и клавиатура • Дата и время"
              icon={<IconBall name="settings" color="#666d7f" />}
            />
            <Row
              title="Специальные возможности"
              subtitle="Отображение • Слышимость • Подвижность"
              icon={<IconBall name="accessibility" color="#666d7f" />}
            />
            <Row
              title="Обновление ПО"
              subtitle="Загрузка и установка"
              icon={<IconBall name="refresh" color="#666d7f" />}
            />
            <Row
              title="Советы и руководство пользователя"
              subtitle="Полезные советы • Новые функции"
              icon={<IconBall name="book" color="#666d7f" />}
            />
            <Row
              title="Сведения о телефоне"
              subtitle="Состояние • Юридическая информация"
              icon={<IconBall name="information-circle" color="#666d7f" />}
            />
            <Row
              title="Параметры разработчика"
              subtitle="Открыть экран настроек приложения"
              icon={<IconBall name="code-slash" color="#317dff" />}
              onPress={onOpenSettings}
              noBorder
            />
          </View>
        </View>
      </Animated.ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  heroTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 98,
    alignItems: 'center',
  },
  searchFloating: {
    position: 'absolute',
    paddingHorizontal: 14,
    zIndex: 45,
    display: 'flex',
    flexDirection: 'row',
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 100,
  },
  headerTitleBig: {
    color: '#f2f2f4',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerTitleSmall: {
    color: '#f2f2f4',
    fontSize: 20,
    fontWeight: '700',
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
  learnCode: {
    position: 'absolute',
    left: 20,
    top: 6,
    color: '#8ca8ff',
    fontSize: 12,
    fontWeight: '600',
  },
})
