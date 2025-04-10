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

  const height = useTransform(scrollY, [0, 190], [160, 0])
  const opacity = useTransform(scrollY, [0, 100], [1, 0])
  const opacity2 = useTransform(scrollY, [100, 190], [0, 1])

  return (
    <div
      className={cn(
        'min-h-[calc(100vh+250px)] select-none px-0.5 dark:text-white text-black bg-[#f6f6f8] dark:bg-black flex flex-col gap-x-2 pb-5'
      )}
      // style={{
      //   scrollSnapType: 'y mandatory',
      // }}
    >
      <div
        style={{ height: 230 }}
        className="flex flex-col items-center justify-end w-full"
      >
        <motion.div
          className="z-50 flex items-center justify-center overflow-hidden text-4xl"
          // style={{ height: 100, minHeight: 100 }}
          style={{ height, opacity, scrollSnapAlign: 'center' }}
          // style={{

          //   minHeight: height,
          //   height,
          //   y: 300,
          // }}
        >
          {title}
        </motion.div>
      </div>
      <div
        className={cn(
          'bg-[#f6f6f8] -mb-[72px] dark:bg-black z-10 sticky top-0 font-bold flex justify-between items-center',
          // size === 'small'
          //   ? 'pl-5 pr-4 pt-5 pb-3'
          //   : size === 'big'
          //   ? 'pl-6 pr-6 pt-8 pb-3.5'
          //   : 'pl-6 pr-5 pt-6 pb-3.5'
          'pl-4 pr-3 pt-6 pb-3.5'
        )}
        // onClick={toggleTheme}
      >
        {onClickBack && (
          <div
            onClick={onClickBack}
            className="button cursor-pointer -ml-6 p-5 -mb-3.5 -mt-3.5 rounded-full"
          >
            <ArrowBack size={size} className="fill-dark dark:fill-white" />
          </div>
        )}
        <motion.div
          className={cn(
            'text-left flex-1 font-bold',
            size === 'small'
              ? 'text-lg'
              : size === 'big'
              ? 'text-2xl'
              : 'text-xl'
          )}
          style={{ opacity: opacity2 }}
        >
          {title}
        </motion.div>
        {icons.length > 0
          ? icons.map((Icon, index) => (
              <Icon
                key={'icon' + index}
                size={size}
                className="ml-2 fill-dark dark:fill-white stroke-dark dark:stroke-white"
              />
            ))
          : null}
      </div>
      <div
        className={cn(
          'flex flex-col pt-[78px]',
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
        setTitleState(makeId(localStorage.wifi?.length || 6))
      }, getRandomInt(350, 650))
    }
    if (!hack || iteration >= index) {
      clearInterval(interval.current)
      if (hack) {
        if (!mode || mode === 'word') {
          setTitleState(
            `${localStorage.dot === 'true' ? '.' : ''}${
              localStorage.wifi || 'Hacked'
            }`
          )
        } else if (mode === 'card') {
          setTitleState(
            `${localStorage.dot === 'true' ? '.' : ''}${suits[suit]}${
              suit <= 12 ? masts[mast] : '' //mastsEmoji
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
  size,
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
  boldTitle,
  className,
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
          size === 'small'
            ? 'px-4 pb-3'
            : size === 'big'
            ? 'px-[18px] pb-[13px]'
            : 'px-[18px] pb-3'
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
              'pointer-events-none mr-3',
              size === 'small' ? 'pt-3' : size === 'big' ? 'pt-[13px]' : 'pt-3'
            )}
          >
            <Icon />
          </div>
        )}
        <div
          className={cn(
            'flex gap-x-3 items-center justify-between flex-1 group-first:border-none border-t dark:border-[#3a3a3c] border-[#e2e2e4]',
            size === 'small' ? 'pt-3' : size === 'big' ? 'pt-[13px]' : 'pt-3'
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
                activeTitle ? 'text-[#578ffe] font-bold' : '',
                boldTitle ? 'font-semibold' : '',
                size === 'small'
                  ? 'text-base'
                  : size === 'big'
                  ? 'text-[19px] leading-[28px]'
                  : 'text-lg'
              )}
            >
              {title}
            </div>
            {subItems && (
              <div
                className={cn(
                  'text-left text-secondary',
                  size === 'small'
                    ? 'text-xs'
                    : size === 'big'
                    ? 'text-[15px] leading-[20px]'
                    : 'text-sm'
                )}
              >
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
          if (!mode || mode === 'word') {
            writeOnCharacteristic(localStorage.wifi || 'Hacked', true)
          } else if (mode === 'card') {
            writeOnCharacteristic(
              `${suits[suit]}${suit <= 12 ? masts[mast] : ''}`,
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
      size={size}
      toggleTheme={toggleTheme}
      title="Wi-Fi"
      onClickBack={() => setPage('connections')}
      className={className}
      icons={[QRCodeIcon, VerticalDots]}
    >
      <ItemsBlock>
        <Item
          title="Включено"
          activeTitle={true}
          // subItems={['Wi-Fi', 'Bluetooth', 'Диспетчер SIM-карт']}
          size={size}
          onClick={() => {
            if (waitingForHack) return
            if (!hack) {
              setWaitingForHack(true)
              setTimeout(() => {
                setHack(true)
                setWaitingForHack(false)
                if (!mode || mode === 'word') {
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
        {wifiSpots.map((title, index) => {
          if (title.trim() === '') return null
          return (
            <ItemWiFi
              key={title}
              title={title}
              size={size}
              index={index + 5}
              level={wiFiSpotsLevels[index] ?? 4}
            />
          )
        })}
        {hack && wifiSpots?.length < 1 && (
          <ItemWiFi
            title=""
            size={size}
            index={5}
            hidden
            level={wiFiSpotsLevels[0]}
          />
        )}
        {hack && wifiSpots?.length < 2 && (
          <ItemWiFi
            title=""
            size={size}
            index={5}
            hidden
            level={wiFiSpotsLevels[1]}
          />
        )}
        {hack && wifiSpots?.length < 3 && (
          <ItemWiFi
            title=""
            size={size}
            index={6}
            hidden
            level={wiFiSpotsLevels[2]}
          />
        )}
        {hack && wifiSpots?.length < 4 && (
          <ItemWiFi
            title=""
            size={size}
            index={7}
            hidden
            level={wiFiSpotsLevels[3]}
          />
        )}
        {hack && wifiSpots?.length < 5 && (
          <ItemWiFi
            title=""
            size={size}
            index={8}
            hidden
            level={wiFiSpotsLevels[4]}
          />
        )}
        {hack && wifiSpots?.length < 6 && (
          <ItemWiFi
            title=""
            size={size}
            index={9}
            hidden
            level={wiFiSpotsLevels[5]}
          />
        )}
        {hack && wifiSpots?.length < 7 && (
          <ItemWiFi
            title=""
            size={size}
            index={10}
            hidden
            level={wiFiSpotsLevels[6]}
          />
        )}
        {hack && wifiSpots?.length < 8 && (
          <ItemWiFi
            title=""
            size={size}
            index={11}
            hidden
            level={wiFiSpotsLevels[7]}
          />
        )}
        {hack && wifiSpots?.length < 9 && (
          <ItemWiFi
            title=""
            size={size}
            index={12}
            hidden
            level={wiFiSpotsLevels[8]}
          />
        )}
        {hack && wifiSpots?.length < 10 && (
          <ItemWiFi
            title=""
            size={size}
            index={13}
            hidden
            level={wiFiSpotsLevels[9]}
          />
        )}
        {hack && wifiSpots?.length < 11 && (
          <ItemWiFi
            title=""
            size={size}
            index={14}
            hidden
            level={wiFiSpotsLevels[10]}
          />
        )}
        {hack && wifiSpots?.length < 12 && (
          <ItemWiFi
            title=""
            size={size}
            index={15}
            hidden
            level={wiFiSpotsLevels[11]}
          />
        )}
        <ItemWiFiAdd size={size} />
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

export const ConnectionsPage = ({ size, toggleTheme, setPage, className }) => {
  return (
    <PageWrapper
      size={size}
      toggleTheme={toggleTheme}
      title="Подключения"
      onClickBack={() => setPage('general')}
      className={className}
      icons={[SearchIcon]}
    >
      <ItemsBlock>
        <Item
          title="Wi-Fi"
          // Icon={WiFiIcon}
          // subItems={['Wi-Fi', 'Bluetooth', 'Диспетчер SIM-карт']}
          size={size}
          onClick={() => setPage('wifi')}
          checkbox
        />
        <Item
          title="Вызовы по Wi-Fi"
          // Icon={WiFiIcon}
          // subItems={['Wi-Fi', 'Bluetooth', 'Диспетчер SIM-карт']}
          size={size}
          // onClick={() => setPage('connections')}
          checkbox={false}
        />
        <Item
          title="Bluetooth"
          // Icon={WiFiIcon}
          // subItems={['Wi-Fi', 'Bluetooth', 'Диспетчер SIM-карт']}
          size={size}
          // onClick={() => setPage('connections')}
          checkbox
        />
        <Item
          title="NFC и бесконтактные платежи"
          // Icon={WiFiIcon}
          // subItems={['Wi-Fi', 'Bluetooth', 'Диспетчер SIM-карт']}
          size={size}
          // onClick={() => setPage('connections')}
          checkbox
        />
        <Item
          title="Сверхширокая полоса (UWB)"
          // Icon={WiFiIcon}
          subItems={[
            'Определение точного местоположения устройства поблизости.',
          ]}
          size={size}
          // onClick={() => setPage('connections')}
          checkbox={false}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item title="Авиарежим" size={size} checkbox={false} />
      </ItemsBlock>
      <ItemsBlock>
        <Item title="Диспетчер SIM-карт" size={size} />
        <Item title="Мобильные сети" size={size} />
        <Item title="Использование данных" size={size} />
        <Item title="Мобильная точка доступа и модем" size={size} />
      </ItemsBlock>
      <ItemsBlock>
        <Item title="Другие настройки" size={size} />
      </ItemsBlock>
      {localStorage.learn === 'true' && (
        <>
          <div className="min-h-10" />
          <div className="absolute bottom-0 left-0 right-0 w-full p-1 text-white bg-gray-800 border-t border-gray-400">
            Теперь перейдите в меню Wi-Fi
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
    <PageWrapper
      size={size}
      title="Einstellungen"
      className={className}
      icons={[SearchIcon]}
    >
      <ItemsBlock>
        <Item
          title="владимир шмидт"
          subItems={['Samsung account']}
          size={size}
          boldTitle
          className="mt-4"
        >
          <div
            className={cn(
              'absolute p-[1px] rounded-full border border-[#f6f6f8] dark:border-[#2c2d2f]',
              size === 'small'
                ? 'h-[68px] w-[68px] right-5 -top-3'
                : size === 'big'
                ? 'h-[82px] w-[82px] right-5 -top-3.5'
                : 'h-[72px] w-[72px] right-5 -top-3.5'
            )}
          >
            <img
              className="w-full h-full rounded-full"
              src="img/escalion.png"
              alt="avatar"
            />
          </div>
        </Item>
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Verbindungen"
          Icon={WiFiIcon}
          subItems={['Wi-Fi', 'Bluetooth', 'SIM-Manager']}
          size={size}
          onClick={() => {
            setPage('connections')
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
          title="Verbundene Geräte"
          Icon={ConnectedDevicesIcon}
          subItems={['Quick Share', 'Samsung DeX', 'Android Auto']}
          size={size}
          hiddenSwipeElementsFunc={[
            () => setSuit(0),
            () => setSuit(1),
            () => setSuit(2),
            () => setSuit(3),
          ]}
          hiddenSwipeElementsNames={[suits[0], suits[1], suits[2], suits[3]]}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Galaxy AI"
          Icon={ScenariosIcon}
          subItems={['Chat-Assistent', 'Notizenassistent', 'Foto-Assistent']}
          size={size}
          hiddenSwipeElementsFunc={[
            () => setSuit(4),
            () => setSuit(5),
            () => setSuit(6),
            () => setSuit(7),
          ]}
          hiddenSwipeElementsNames={[suits[4], suits[5], suits[6], suits[7]]}
        />
        <Item
          title="Modi und Routinen"
          Icon={ScenariosIcon}
          subItems={['Modi', 'Routinen']}
          size={size}
          hiddenSwipeElementsFunc={[
            () => setSuit(8),
            () => setSuit(9),
            () => setSuit(10),
            () => setSuit(11),
          ]}
          hiddenSwipeElementsNames={[suits[8], suits[9], suits[10], suits[11]]}
        />
        <Item
          title="Töne and Vibration"
          Icon={SoundIcon}
          subItems={['Tonmodus', 'Klingelton']}
          size={size}
          hiddenSwipeElementsFunc={[() => setSuit(12), () => setSuit(13)]}
          hiddenSwipeElementsNames={[suits[12], suits[13]]}
        />
        <Item
          title="Benachrichtigungen"
          Icon={NotificationsIcon}
          subItems={['Statusleiste', 'Nicht stören']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Anzeige"
          Icon={DisplayIcon}
          subItems={['Helligkeit', 'Augenkomfort', 'Navigationsleiste']}
          size={size}
        />
        <Item
          title="Akku"
          Icon={BateryIcon}
          subItems={['Energiesparen', 'Laden']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Hintergroundbild und Stil"
          Icon={WallpappersIcon}
          subItems={['Hintergr.', 'Farbpalette']}
          size={size}
        />
        <Item
          title="Themes"
          Icon={ThemesIcon}
          subItems={['Themes', 'Hintergründe', 'Symbole']}
          size={size}
        />
        <Item
          title="Startbildschirm"
          Icon={BlockScreenIcon}
          subItems={['Layout', 'App-Symbolindikatoren']}
          size={size}
        />
        <Item
          title="Startbildschirm und AOD"
          Icon={ShildIcon}
          subItems={['Sperrbildschirmtyp', 'Always On Display']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Sicherheit und Datenschutz"
          Icon={ShildIcon}
          subItems={['Biometrische Daten', 'Berechtigungsverwaltung']}
          size={size}
        />
        <Item
          title="Standort"
          Icon={LocationIcon}
          subItems={['Standortanfragen']}
          size={size}
        />
        <Item
          title="Sicherheit und Datenschutz"
          Icon={ExtraIcon}
          subItems={['Medizinische Informationen', 'Notfallwarnungen']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Konten und Sicherung"
          Icon={AccountsIcon}
          subItems={['Konten verwalten', 'Smart Switch']}
          size={size}
        />
        <Item
          title="Google"
          Icon={GoogleIcon}
          subItems={['Google-Dienste']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Erweitrte Funktionen"
          Icon={AdditionalFunctionsIcon}
          subItems={['Labs', 'S Pen', 'Funktionstaste']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Digitales Wohlbefinden und Kindersicherung"
          Icon={ParentsControlIcon}
          subItems={['Bildschirmzeit', 'App-Timer']}
          size={size}
        />
        <Item
          title="Gerateverwaltung"
          Icon={CleanUpIcon}
          subItems={['Speicherplatz', 'Arbeitsspeicher', 'App-Schutz']}
          size={size}
        />
        <Item
          title="Apps"
          Icon={AppsIcon}
          subItems={['Standart-Apps', 'App-Einstellungen']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Allgemeine Verwaltung"
          Icon={SettingsIcon}
          subItems={['Sprache und Tastatur', 'Datum und Uhrzeit']}
          size={size}
        />
        <Item
          title="Eingabehilfe"
          Icon={SpecialIcon}
          subItems={['Sichtbarkeit', 'Hören', 'Geschicklichkeit']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Software-Update"
          Icon={RefreshIcon}
          subItems={['Herunterladen und installieren']}
          size={size}
        />
        <Item
          title="Tipps und Benutzerhandbuch"
          Icon={DocumentationIcon}
          subItems={['Hilfreiche Tipps', 'Neue Funktionen']}
          size={size}
        />
        <Item
          title="Telefoninfo"
          Icon={InfoIcon}
          subItems={['Status', 'Rechtliche Informationen', 'Telefonname']}
          size={size}
        />
        {/* <Item
          title="Параметры разработчика"
          Icon={DevIcon}
          subItems={['Параметры разработчика']}
          size={size}
          onClick={() => setPage('settings')}
        /> */}
      </ItemsBlock>
      {localStorage.learn === 'true' && (
        <>
          <div className="min-h-24" />
          <div className="absolute bottom-0 left-0 right-0 z-30 w-full p-1 text-white bg-gray-800 border-t border-gray-400">
            Обратите внимание, что выделены поля! Первое что нужно сделать это
            сначала свайпнуть сверху вниз по экрану держа изначально палец на
            необходимом номинале карты, а затем нужно кликнуть по масти (пункту
            меню "Подключения")
          </div>
        </>
      )}
    </PageWrapper>
  )
}
