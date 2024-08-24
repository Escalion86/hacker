import ConnectedDevicesIcon from '../icons/ConnectedDevicesIcon'
import ScenariosIcon from '../icons/ScenariosIcon'
import SoundIcon from '../icons/SoundIcon'
import NotificationsIcon from '../icons/NotificationsIcon'
import BateryIcon from '../icons/BateryIcon'
import DisplayIcon from '../icons/DisplayIcon'
import WallpappersIcon from '../icons/WallpappersIcon'
import ThemesIcon from '../icons/ThemesIcon'
import BlockScreenIcon from '../icons/BlockScreenIcon'
import ShildIcon from '../icons/ShildIcon'
import LocationIcon from '../icons/LocationIcon'
import ExtraIcon from '../icons/ExtraIcon'
import AccountsIcon from '../icons/AccountsIcon'
import GoogleIcon from '../icons/GoogleIcon'
import PlusIcon from '../icons/PlusIcon'
import AdditionalFunctionsIcon from '../icons/AdditionalFunctionsIcon'
import ParentsControlIcon from '../icons/ParentsControlIcon'
import AppsIcon from '../icons/AppsIcon'
import SettingsIcon from '../icons/SettingsIcon'
import SpecialIcon from '../icons/SpecialIcon'
import RefreshIcon from '../icons/RefreshIcon'
import DocumentationIcon from '../icons/DocumentationIcon'
import InfoIcon from '../icons/InfoIcon'
import DevIcon from '../icons/DevIcon'
import CleanUpIcon from '../icons/CleanUpIcon'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import wifiSpotsAtom from '../state/wifiSpotsAtom'
import hackAtom from '../state/hackAtom'
import { useRef, useState } from 'react'
import cardMastAtom from '../state/cardMastAtom'
import cardSuitAtom from '../state/cardSuitAtom'
import { useEffect } from 'react'
import { masts, mastsEmoji, suits } from '../constants'
import cn from 'classnames'
import WiFiIcon from '../icons/WiFiIcon'
import SearchIcon from '../icons/SearchIcon'
import ArrowBack from '../icons/ArrowBack'
import makeId from '../helpers/makeId'
import getRandomInt from '../helpers/getRandomInt'
import { motion, useScroll, useTransform } from 'framer-motion'
import WiFiSpot from '../icons/WiFiSpot'
import QRCodeIcon from '../icons/QRCodeIcon'
import VerticalDots from '../icons/VerticalDots'
import UserIcon from '../icons/UserIcon'
import PhoneIcon from '../icons/enkD83Js/PhoneIcon'

const PageWrapper = ({
  title,
  size,
  children,
  onClickBack,
  icons = [],
  collapsedTitle = false,
}) => {
  const { scrollY } = useScroll()

  // const height = useTransform(scrollYProgress, [0, 100], [100, 60])
  // console.log('height :>> ', height)
  // useEffect(() => {
  //   window.addEventListener('scroll', function () {
  //     let scroll = window.scrollY
  //     console.log('scroll :>> ', scroll)
  //     let title = document.querySelector('.title')
  //     title.style.transform =
  //       'translate3d(0,' +
  //       scroll / 100 +
  //       '%,0) scale(' +
  //       (100 - scroll / 100) / 100 +
  //       ')'
  //   })
  // }, [])

  const height = useTransform(scrollY, [0, 70], [100, 35])
  const scale = useTransform(scrollY, [0, 70], [1, 0.7])
  const marginLeft = useTransform(scrollY, [0, 70], [0, -16])
  const marginTop = useTransform(scrollY, [0, 70], [-90, -40])
  // const opacity = useTransform(scrollY, [0, 100], [1, 0])
  // const opacity2 = useTransform(scrollY, [100, 190], [0, 1])

  return (
    <div
      className={cn(
        'relative min-h-[calc(100vh+250px)] select-none px-[18px] dark:text-white text-black bg-[#f6f6f8] dark:bg-black flex flex-col gap-x-2 pb-5'
      )}
      // style={{
      //   scrollSnapType: 'y mandatory',
      // }}
    >
      <div className="" style={{ height: 100 }} />
      <motion.div
        className={cn(
          'bg-[#f6f6f8] dark:bg-black z-10 sticky top-0 flex justify-between items-center',
          // size === 'small'
          //   ? 'pl-5 pr-4 pt-5 pb-3'
          //   : size === 'big'
          //   ? 'pl-6 pr-6 pt-8 pb-3.5'
          //   : 'pl-6 pr-5 pt-6 pb-3.5'
          'pl-4 pr-3 pt-6 pb-3.5'
        )}
        style={{ marginTop }}
        // onClick={toggleTheme}
      >
        {onClickBack && (
          <div
            onClick={onClickBack}
            className="button cursor-pointer -ml-6 p-5 -mb-3.5 -mt-3.5 rounded-full"
          >
            <ArrowBack className="fill-dark dark:fill-white" />
          </div>
        )}
        <motion.div
          className="flex items-center justify-start overflow-visible"
          style={{ marginLeft }}
        >
          <motion.div
            className="z-50 flex items-center w-full overflow-visible text-[34px] leading-[38px]"
            // style={{ height: 100, minHeight: 100 }}
            style={{ height, scrollSnapAlign: 'center', scale }}
            // style={{

            //   minHeight: height,
            //   height,
            //   y: 300,
            // }}
          >
            {title}
          </motion.div>
        </motion.div>
        <div className="absolute bottom-3 right-3">
          {icons.length > 0
            ? icons.map((Icon) => (
                <Icon className="ml-2 fill-dark dark:fill-white stroke-dark dark:stroke-white" />
              ))
            : null}
        </div>
      </motion.div>
      <div
        className={cn(
          'flex flex-col pb-5',
          size === 'small' ? 'gap-y-4' : size === 'big' ? 'gap-y-5' : 'gap-y-4'
        )}
        style={{ scrollSnapAlign: 'start' }}
      >
        {children}
      </div>
    </div>
  )
}

const ItemWiFi = ({ size, title, onClick, index, hidden, level }) => {
  const hack = useRecoilValue(hackAtom)
  const [titleState, setTitleState] = useState(title)
  const [iteration, setIteration] = useState(0)
  const mast = useRecoilValue(cardMastAtom)
  const suit = useRecoilValue(cardSuitAtom)
  const mode = localStorage.mode
  const itemRef = useRef()
  const interval = useRef()

  useEffect(() => {
    if (hack && iteration === 0) {
      setIteration(0)
      interval.current = setInterval(() => {
        setIteration((state) => state + 1)
        setTitleState(makeId(localStorage.wifi?.length || ' '))
      }, getRandomInt(350, 650))
    }
    if (!hack || iteration >= index) {
      clearInterval(interval.current)
      if (hack) {
        if (!mode || mode === 'wifi') {
          setTitleState(
            `${localStorage.dot === 'true' ? '.' : ''}${localStorage.wifi}`
          )
        } else if (mode === 'card') {
          setTitleState(
            `${localStorage.dot === 'true' ? '.' : ''}${suits[suit]}${
              suit <= 12 ? mastsEmoji[mast] : ''
            }`
          )
        }
      } else setTitleState(title)
      // setIteration(0)
    }
  }, [hack, iteration, mast, suit, mode])

  useEffect(() => {
    if (!hack) setIteration(0)
  }, [hack])

  useEffect(() => {
    // let button = document.getElementById('button')
    const touchStartEventListener = (e) => {
      var rect = e.target.getBoundingClientRect()
      var x = e.touches[0].clientX - rect.left //x position within the element.
      var y = e.touches[0].clientY - rect.top

      itemRef.current.style.setProperty('--mouse-x', x + 'px')
      itemRef.current.style.setProperty('--mouse-y', y + 'px')
    }

    itemRef.current.addEventListener('touchstart', touchStartEventListener)
    // return () => {
    //   itemRef.current.removeEventListener('touchstart', touchStartEventListener)
    // }
  }, [])

  useEffect(() => {
    const mouseDownEventListener = (e) => {
      var rect = e.target.getBoundingClientRect()
      var x = e.clientX - rect.left //x position within the element.
      var y = e.clientY - rect.top

      itemRef.current.style.setProperty('--mouse-x', x + 'px')
      itemRef.current.style.setProperty('--mouse-y', y + 'px')
    }

    itemRef.current.addEventListener('mousedown', mouseDownEventListener)
    // return () => {
    //   itemRef.current.removeEventListener('mousedown', mouseDownEventListener)
    // }
  }, [])

  return (
    <div
      className={cn(
        'relative group first:rounded-t-3xl last:rounded-b-3xl duration-1000 transition-opacity bg-white dark:bg-[#171719]',
        hidden && iteration < index ? 'h-0 opacity-0' : 'opacity-100'
      )}
      onClick={onClick}
    >
      <div
        ref={itemRef}
        className={cn(
          'button flex items-center group-first:rounded-t-3xl group-last:rounded-b-3xl',
          size === 'small'
            ? 'px-4 pb-3'
            : size === 'big'
            ? 'px-[18px] pb-[13px]'
            : 'px-[18px] pb-3'
        )}
      >
        <div
          className={cn(
            'pointer-events-none mr-1.5',
            size === 'small' ? 'pt-3' : size === 'big' ? 'pt-[13px]' : 'pt-3'
          )}
        >
          <WiFiSpot level={level} />
        </div>
        <div
          className={cn(
            'flex gap-x-3 items-center justify-between flex-1',
            size === 'small' ? 'pt-3' : size === 'big' ? 'pt-[13px]' : 'pt-3'
          )}
        >
          <div
            className={cn(
              'relative ml-2 flex-1 pointer-events-none gap-x-2 flex-col items-start'
            )}
          >
            <div
              className={cn(
                'text-left -mt-0.5 text-current',
                size === 'small'
                  ? 'text-base'
                  : size === 'big'
                  ? 'text-[19px] leading-[28px]'
                  : 'text-lg'
              )}
            >
              {titleState}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ItemWiFiAdd = ({ size }) => {
  return (
    <div className="relative group first:rounded-t-3xl last:rounded-b-3xl">
      <div
        className={cn(
          'button flex items-center group-first:rounded-t-3xl group-last:rounded-b-3xl bg-white dark:bg-[#171719]',
          size === 'small'
            ? 'px-4 pb-3'
            : size === 'big'
            ? 'px-[18px] pb-[13px]'
            : 'px-[18px] pb-3'
        )}
      >
        <div
          className={cn(
            'pointer-events-none',
            size === 'small' ? 'pt-3' : size === 'big' ? 'pt-[13px]' : 'pt-3'
          )}
        >
          <PlusIcon stroke="#25b35d" />
        </div>
        <div
          className={cn(
            'flex gap-x-3 items-center justify-between flex-1',
            size === 'small' ? 'pt-3' : size === 'big' ? 'pt-[13px]' : 'pt-3'
          )}
        >
          <div
            className={cn(
              'relative ml-2 flex-1 pointer-events-none gap-x-2 flex-col items-start'
            )}
          >
            <div
              className={cn(
                'text-left -mt-0.5 text-current',
                size === 'small'
                  ? 'text-base'
                  : size === 'big'
                  ? 'text-[19px] leading-[28px]'
                  : 'text-lg'
              )}
            >
              Добавить сеть
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Item = ({
  title,
  Icon,
  subItems,
  children,
  onClick,
  checkbox,
  checkboxBorder = true,
  activeTitle,
  hiddenSwipeElementsFunc,
  hiddenSwipeElementsNames,
  className,
  arrow = true,
  textRight,
}) => {
  const [isChecked, setIsChecked] = useState(checkbox)
  const itemRef = useRef()
  useEffect(() => {
    // let button = document.getElementById('button')
    const touchStartEventListener = (e) => {
      var rect = e.target.getBoundingClientRect()
      var x = e.touches[0].clientX - rect.left //x position within the element.
      var y = e.touches[0].clientY - rect.top

      itemRef.current.style.setProperty('--mouse-x', x + 'px')
      itemRef.current.style.setProperty('--mouse-y', y + 'px')
    }

    itemRef.current.addEventListener('touchstart', touchStartEventListener)
    // return () => {
    //   itemRef.current.removeEventListener('touchstart', touchStartEventListener)
    // }
  }, [])

  useEffect(() => {
    const mouseDownEventListener = (e) => {
      var rect = e.target.getBoundingClientRect()
      var x = e.clientX - rect.left //x position within the element.
      var y = e.clientY - rect.top

      itemRef.current.style.setProperty('--mouse-x', x + 'px')
      itemRef.current.style.setProperty('--mouse-y', y + 'px')
    }

    itemRef.current.addEventListener('mousedown', mouseDownEventListener)
    // return () => {
    //   itemRef.current.removeEventListener('mousedown', mouseDownEventListener)
    // }
  }, [])

  return (
    <div
      className={cn(
        'relative group first:rounded-t-3xl last:rounded-b-3xl',
        activeTitle
          ? 'bg-[#eeeef0] dark:bg-[#2d2d2f]'
          : 'bg-[#fcfcfe] dark:bg-dark',
        className
        //font-semibold
      )}
    >
      <div
        ref={itemRef}
        onClick={onClick}
        className={cn(
          'button flex items-center group-first:rounded-t-3xl group-last:rounded-b-3xl',
          'px-[18px] pb-[13px]'
        )}
      >
        {hiddenSwipeElementsFunc?.length > 0 && (
          <div
            // onClick={(e) => e.stopPropagation()}
            // onClick={() => {
            //   console.log('!! :>> ')
            //   // func()
            // }}
            className="absolute top-0 bottom-0 left-0 right-0 z-[1] flex items-stretch"
          >
            {hiddenSwipeElementsFunc.map((func, index) => (
              <div
                key={index}
                className={cn(
                  'flex-1',
                  localStorage.learn === 'true'
                    ? 'border border-gray-400 text-gray-400 text-5xl font-bold flex justify-center items-center bg-black bg-opacity-30'
                    : 'text-transparent'
                )}
                onTouchStart={func}
                // onClick={() => {
                //   console.log('! :>> ')
                //   func()
                // }}
              >
                {hiddenSwipeElementsNames[index]}
              </div>
            ))}
          </div>
        )}
        {Icon && (
          <div
            className={cn(
              'pointer-events-none mr-4 min-w-[36px] min-h-[49px] flex justify-center items-center',
              'pt-[13px]'
            )}
          >
            <Icon />
          </div>
        )}
        <div
          className={cn(
            'flex gap-x-3 items-center justify-between flex-1',
            'pt-[13px]'
          )}
        >
          <div
            className={cn(
              'flex-1 pointer-events-none gap-x-2 flex-col items-start'
            )}
          >
            <div
              className={cn(
                'text-left -mt-0.5',
                activeTitle ? 'text-[#578ffe] font-bold' : 'font-semibold',
                'text-[14px] leading-[20px]'
              )}
            >
              {title}
            </div>
            {subItems && (
              <div className="text-left text-secondary text-[11px] leading-[13px]">
                {subItems.map((item, index) => (
                  <div key={item} className="inline">
                    <span>{item}</span>
                    {index !== subItems.length - 1 && (
                      <span className="mx-2 text-secondary">{`\u{2022}`}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {typeof checkbox === 'boolean' && (
            <div
              // onClick={(e) => e.stopPropagation()}
              className={cn(
                'pl-3 h-[18px]',
                checkboxBorder ? 'border-l border-[#474749]' : ''
              )}
            >
              <input
                type="checkbox"
                className="switch_1"
                checked={isChecked}
                onChange={(e) => {
                  // e.stopPropagation()
                  setIsChecked(!isChecked)
                }}
              />
            </div>
          )}
          {textRight && (
            <div className="text-[13px] leading-[15px] text-secondary">
              {textRight}
            </div>
          )}
          {arrow && (
            <div className="rotate-180">
              <ArrowBack
                width={16}
                height={16}
                className="fill-[#c1c1c1] dark:fill-white"
              />
            </div>
          )}
        </div>
      </div>
      <div className="pointer-events-none">{children}</div>
    </div>
  )
}

const ItemsBlock = ({ title, children }) => {
  return (
    <div>
      {title && (
        <div className="font-bold text-[#999999] text-sm ml-6 mb-1.5">
          {title}
        </div>
      )}
      <div className="flex flex-col items-stretch">{children}</div>
    </div>
  )
}

const wiFiSpotsLevels = [
  4, 3, 3, 4, 2, 4, 3, 1, 2, 4, 3, 4, 4, 1, 3, 2, 4, 3, 1, 1, 2, 3,
]

export const WiFiPage = ({
  size,
  toggleTheme,
  setPage,
  writeOnCharacteristic,
  className,
}) => {
  const wifiSpots = useRecoilValue(wifiSpotsAtom)
  const [hack, setHack] = useRecoilState(hackAtom)
  const [waitingForHack, setWaitingForHack] = useState(false)
  const mast = useRecoilValue(cardMastAtom)
  const suit = useRecoilValue(cardSuitAtom)
  const mode = localStorage.mode
  const startOnSetWiFiPage = localStorage.startOnSetWiFiPage === 'true'

  useEffect(() => {
    if (startOnSetWiFiPage && !waitingForHack) {
      if (!hack) {
        setTimeout(() => {
          setHack(true)
          setWaitingForHack(false)
          if (!mode || mode === 'wifi') {
            writeOnCharacteristic(localStorage.wifi || 'Hacked', true)
          } else if (mode === 'card') {
            writeOnCharacteristic(
              `${suits[suit]}${suit <= 13 ? masts[mast] : ''}`,
              true
            )
          }
        }, (localStorage.delay || 3) * 1000)
        setWaitingForHack(true)
      } else {
        setHack(false)
        setWaitingForHack(false)
        writeOnCharacteristic(' ', true)
      }
    }
  }, [startOnSetWiFiPage])

  return (
    <PageWrapper
      toggleTheme={toggleTheme}
      title="Wi-Fi"
      onClickBack={() => setPage('general')}
      className={className}
      icons={[QRCodeIcon, VerticalDots]}
    >
      <ItemsBlock>
        <Item
          title="Включено"
          activeTitle={true}
          // subItems={['Wi-Fi', 'Bluetooth', 'Диспетчер SIM-карт']}
          onClick={() => {
            if (waitingForHack) return
            if (!hack) {
              setWaitingForHack(true)
              setTimeout(() => {
                setHack(true)
                setWaitingForHack(false)
                if (!mode || mode === 'wifi') {
                  writeOnCharacteristic(localStorage.wifi || 'Hacked', true)
                } else if (mode === 'card') {
                  writeOnCharacteristic(
                    `${suits[suit]}${suit <= 13 ? masts[mast] : ''}`,
                    true
                  )
                }
              }, (localStorage.delay || 3) * 1000)
            } else {
              setHack(false)
              setWaitingForHack(false)
              writeOnCharacteristic(' ', true)
            }
          }}
          checkbox
          checkboxBorder={false}
        />
      </ItemsBlock>
      <ItemsBlock title="Доступные сети">
        {wifiSpots.map((title, index) => (
          <ItemWiFi
            key={title}
            title={title}
            index={index + 5}
            level={wiFiSpotsLevels[index] ?? 4}
          />
        ))}
        {wifiSpots?.length < 1 && (
          <ItemWiFi title="" index={5} hidden level={wiFiSpotsLevels[0]} />
        )}
        {wifiSpots?.length < 2 && (
          <ItemWiFi title="" index={5} hidden level={wiFiSpotsLevels[1]} />
        )}
        {wifiSpots?.length < 3 && (
          <ItemWiFi title="" index={6} hidden level={wiFiSpotsLevels[2]} />
        )}
        {wifiSpots?.length < 4 && (
          <ItemWiFi title="" index={7} hidden level={wiFiSpotsLevels[3]} />
        )}
        {wifiSpots?.length < 5 && (
          <ItemWiFi title="" index={8} hidden level={wiFiSpotsLevels[4]} />
        )}
        {wifiSpots?.length < 6 && (
          <ItemWiFi title="" index={9} hidden level={wiFiSpotsLevels[5]} />
        )}
        {wifiSpots?.length < 7 && (
          <ItemWiFi title="" index={10} hidden level={wiFiSpotsLevels[6]} />
        )}
        {wifiSpots?.length < 8 && (
          <ItemWiFi title="" index={11} hidden level={wiFiSpotsLevels[7]} />
        )}
        {wifiSpots?.length < 9 && (
          <ItemWiFi title="" index={12} hidden level={wiFiSpotsLevels[8]} />
        )}
        {wifiSpots?.length < 10 && (
          <ItemWiFi title="" index={13} hidden level={wiFiSpotsLevels[9]} />
        )}
        {wifiSpots?.length < 11 && (
          <ItemWiFi title="" index={14} hidden level={wiFiSpotsLevels[10]} />
        )}
        {wifiSpots?.length < 12 && (
          <ItemWiFi
            title="1313"
            index={15}
            hidden
            level={wiFiSpotsLevels[11]}
          />
        )}
        <ItemWiFiAdd />
      </ItemsBlock>
      {localStorage.learn === 'true' && (
        <>
          <div className="min-h-16" />
          <div className="absolute bottom-0 left-0 right-0 w-full p-1 text-white bg-gray-800 border-t border-gray-400">
            Осталось нажать на кнопку "Включено" и дождаться старта анимации
          </div>
        </>
      )}
    </PageWrapper>
  )
}

export const GeneralPage = ({ size, setPage, className }) => {
  const setSuit = useSetRecoilState(cardSuitAtom)
  const setMast = useSetRecoilState(cardMastAtom)

  return (
    <PageWrapper title="Настройки" className={className} icons={[SearchIcon]}>
      <ItemsBlock>
        <Item
          title="Войти в TECNO ID"
          Icon={UserIcon}
          subItems={[
            'Просмотр TECNO ID, использование электронного гарантийного талона и управление синхронизацией устро...',
          ]}
          // className="mt-4"
        />
        <Item
          title="Мой телефон"
          Icon={PhoneIcon}
          textRight="TECNO POVA Neo 2"
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Настройка SIM карты и сети"
          Icon={WiFiIcon}
          hiddenSwipeElementsFunc={[
            () => setSuit(0),
            () => setSuit(1),
            () => setSuit(2),
            () => setSuit(3),
          ]}
          hiddenSwipeElementsNames={[suits[0], suits[1], suits[2], suits[3]]}
        />
        <Item
          title="Wi-Fi"
          Icon={ConnectedDevicesIcon}
          onClick={() => {
            setPage('wifi')
          }}
          hiddenSwipeElementsFunc={[
            () => {
              setMast(0)
            },
            () => {
              setMast(1)
            },
            () => {
              setMast(2)
            },
            () => {
              setMast(3)
            },
          ]}
          hiddenSwipeElementsNames={[masts[0], masts[1], masts[2], masts[3]]}
        />
        <Item
          title="Точка доступа и модем"
          Icon={ScenariosIcon}
          hiddenSwipeElementsFunc={[
            () => setSuit(4),
            () => setSuit(5),
            () => setSuit(6),
            () => setSuit(7),
          ]}
          hiddenSwipeElementsNames={[suits[4], suits[5], suits[6], suits[7]]}
        />
        <Item
          title="Другие подключения"
          Icon={SoundIcon}
          textRight="Android Auto"
          hiddenSwipeElementsFunc={[
            () => setSuit(8),
            () => setSuit(9),
            () => setSuit(10),
            () => setSuit(11),
          ]}
          hiddenSwipeElementsNames={[suits[8], suits[9], suits[10], suits[11]]}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Персонализация"
          Icon={NotificationsIcon}
          hiddenSwipeElementsFunc={[() => setSuit(12), () => setSuit(13)]}
          hiddenSwipeElementsNames={[suits[12], suits[13]]}
        />
        <Item title="Экран и яркость" Icon={DisplayIcon} />
        <Item title="Звук и Вибрация" Icon={BateryIcon} />
        <Item title="Центр уведомлений" Icon={BateryIcon} />
      </ItemsBlock>
      <ItemsBlock>
        <Item title="Безопасность" Icon={WallpappersIcon} />
        <Item title="Конфиденциальность" Icon={ThemesIcon} />
        <Item title="Память" Icon={BlockScreenIcon} />
        <Item title="Управление приложениями" Icon={BlockScreenIcon} />
        <Item title="Местоположение" Icon={BlockScreenIcon} />
      </ItemsBlock>
      <ItemsBlock>
        <Item title="Помощник AI" Icon={ShildIcon} />
        <Item title="Лаборатория батареи" Icon={LocationIcon} />
        <Item
          title="Цифровое благополучие и родительский контроль"
          Icon={ExtraIcon}
        />
        <Item title="Специальные функции" Icon={ExtraIcon} />
      </ItemsBlock>
      <ItemsBlock>
        <Item title="Пароли и аккаунты" Icon={AccountsIcon} />
        <Item title="Безопасность и экстренные случаи" Icon={AccountsIcon} />
        <Item title="Google" Icon={GoogleIcon} />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Система"
          Icon={AdditionalFunctionsIcon}
          onClick={() => setPage('settings')}
        />
      </ItemsBlock>
      {localStorage.learn === 'true' && (
        <>
          <div className="min-h-24" />
          <div className="absolute bottom-0 left-0 right-0 z-30 w-full p-1 text-white bg-gray-800 border-t border-gray-400">
            Обратите внимание, что выделены поля! Первое что нужно сделать это
            сначала свайпнуть сверху вниз по номиналу карты, а затем нужно
            кликнуть по масти (пункту меню "Подключения")
          </div>
        </>
      )}
    </PageWrapper>
  )
}
