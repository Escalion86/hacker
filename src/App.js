// import logo from './logo.svg'
import './App.css'
// import * as Bluetooth from 'react-bluetooth'
import { useEffect, useRef, useState } from 'react'
import WiFiIcon from './icons/WiFiIcon'
import cn from 'classnames'
import ConnectedDevicesIcon from './icons/ConnectedDevicesIcon'
import ScenariosIcon from './icons/ScenariosIcon'
import SoundIcon from './icons/SoundIcon'
import NotificationsIcon from './icons/NotificationsIcon'
import BateryIcon from './icons/BateryIcon'
import DisplayIcon from './icons/DisplayIcon'
import SearchIcon from './icons/SearchIcon'
import WallpappersIcon from './icons/WallpappersIcon'
import ThemesIcon from './icons/ThemesIcon'
import BlockScreenIcon from './icons/BlockScreenIcon'
import ShildIcon from './icons/ShildIcon'
import LocationIcon from './icons/LocationIcon'
import ExtraIcon from './icons/ExtraIcon'
import AccountsIcon from './icons/AccountsIcon'
import GoogleIcon from './icons/GoogleIcon'
import AdditionalFunctionsIcon from './icons/AdditionalFunctionsIcon'
import ParentsControlIcon from './icons/ParentsControlIcon'
import AppsIcon from './icons/AppsIcon'
import SettingsIcon from './icons/SettingsIcon'
import SpecialIcon from './icons/SpecialIcon'
import RefreshIcon from './icons/RefreshIcon'
import DocumentationIcon from './icons/DocumentationIcon'
import InfoIcon from './icons/InfoIcon'
import DevIcon from './icons/DevIcon'
import CleanUpIcon from './icons/CleanUpIcon'
import ArrowBack from './icons/ArrowBack'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import hackAtom from './state/hackAtom'
import cardSuitAtom from './state/cardSuitAtom'
import cardMastAtom from './state/cardMastAtom'
import wifiSpotsAtom from './state/wifiSpotsAtom'
// import logsAtom from './state/logsAtom'

//Define BLE Device Specs
const deviceName = 'Hacker'
const bleService = '19b10000-e8f2-537e-4f6c-d104768a1214'
const sensorCharacteristic = '19b10001-e8f2-537e-4f6c-d104768a1214'
const ledCharacteristic = '19b10002-e8f2-537e-4f6c-d104768a1214'

//Global Variables to Handle Bluetooth
var bleServer
var bleServiceFound
var sensorCharacteristicFound

const suits = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'JOKER',
]
const masts = ['♠', '♥', '♣', '♦']
const mastsEmoji = [`\u{2660}`, `\u{2764}`, `\u{2663}`, `\u{2666}`]

// Connect Button (search for BLE Devices only if BLE is available)
// connectButton.addEventListener('click', (event) => {
//     if (isWebBluetoothEnabled()){
//         connectToDevice();
//     }
// });

// // Disconnect Button
// disconnectButton.addEventListener('click', disconnectDevice);

// // Write to the ESP32 LED Characteristic
// onButton.addEventListener('click', () => writeOnCharacteristic(1));
// offButton.addEventListener('click', () => writeOnCharacteristic(0));

// Check if BLE is available in your Browser

function getDateTime() {
  var currentdate = new Date()
  var day = ('00' + currentdate.getDate()).slice(-2) // Convert day to string and slice
  var month = ('00' + (currentdate.getMonth() + 1)).slice(-2)
  var year = currentdate.getFullYear()
  var hours = ('00' + currentdate.getHours()).slice(-2)
  var minutes = ('00' + currentdate.getMinutes()).slice(-2)
  var seconds = ('00' + currentdate.getSeconds()).slice(-2)

  var datetime =
    day +
    '/' +
    month +
    '/' +
    year +
    ' at ' +
    hours +
    ':' +
    minutes +
    ':' +
    seconds
  return datetime
}

function toggleTheme() {
  let htmlClasses = document.querySelector('html').classList
  if (
    (localStorage.theme = 'dark')
    // localStorage.AppName === 'hacker'
  ) {
    // localStorage.removeItem('AppName')
    htmlClasses.remove('dark')
    localStorage.theme = 'light'
  } else {
    // localStorage.AppName = 'hacker'
    htmlClasses.add('dark')
    localStorage.theme = 'dark'
  }
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

function makeid(length) {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ@_+-/\\&?:;%$##!`><|[]{}*^0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled) // The maximum is exclusive and the minimum is inclusive
}

const ItemWiFi = ({ size, title, onClick, index, hidden }) => {
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
        setTitleState(makeid(localStorage.wifi?.length || ' '))
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
        'relative group first:rounded-t-3xl last:rounded-b-3xl duration-1000 transition-opacity',
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
          <WiFiIcon />
        </div>
        <div
          className={cn(
            'flex gap-x-3 items-center justify-between flex-1 group-first:border-none border-t border-[#3a3a3c]',
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
                'text-left -mt-0.5 text-current ',
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
        activeTitle ? 'bg-[#2d2d2f]' : 'bg-dark'
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
              'pointer-events-none mr-1.5',
              size === 'small' ? 'pt-3' : size === 'big' ? 'pt-[13px]' : 'pt-3'
            )}
          >
            <Icon />
          </div>
        )}
        <div
          className={cn(
            'flex gap-x-3 items-center justify-between flex-1 group-first:border-none border-t border-[#3a3a3c]',
            size === 'small' ? 'pt-3' : size === 'big' ? 'pt-[13px]' : 'pt-3'
          )}
        >
          <div
            className={cn(
              'ml-2 flex-1 pointer-events-none gap-x-2 flex-col items-start'
            )}
          >
            <div
              className={cn(
                'text-left -mt-0.5',
                activeTitle ? 'text-[#578ffe] font-bold' : '',
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

const PageWrapper = ({
  title,
  size,
  toggleTheme,
  children,
  onClickBack,
  activeTitle,
}) => (
  <div
    className={cn(
      'select-none px-0.5 dark:text-white text-black bg-white dark:bg-black max-h-screen min-h-screen flex flex-col gap-x-2 gap-y-4 overflow-y-scroll pb-5',
      size === 'small' ? 'gap-y-4' : size === 'big' ? 'gap-y-5' : 'gap-y-4'
    )}
  >
    <div
      className={cn(
        'bg-white dark:bg-black z-10 sticky top-0 font-bold flex justify-between items-center',
        size === 'small'
          ? 'pl-5 pr-4 pt-5 pb-3'
          : size === 'big'
          ? 'pl-6 pr-6 pt-8 pb-3.5'
          : 'pl-6 pr-5 pt-6 pb-3.5'
      )}
      // onClick={toggleTheme}
    >
      {onClickBack && (
        <div
          onClick={onClickBack}
          className="button cursor-pointer -ml-6 p-5 -mb-3.5 -mt-3.5 rounded-full"
        >
          <ArrowBack size={size} />
        </div>
      )}
      <div
        className={cn(
          'text-left flex-1',
          size === 'small' ? 'text-lg' : size === 'big' ? 'text-2xl' : 'text-xl'
        )}
      >
        {title}
      </div>
      <SearchIcon size={size} />
    </div>
    {children}
  </div>
)

const SettingsPage = ({ size, toggleTheme, setPage }) => {
  const [mode, setMode] = useState(localStorage.mode)
  const [learn, setLearn] = useState(localStorage.learn)
  const [dot, setDot] = useState(localStorage.dot)
  const [startOnSetWiFiPage, setStartOnSetWiFiPage] = useState(
    localStorage.startOnSetWiFiPage
  )

  return (
    <PageWrapper
      size={size}
      toggleTheme={toggleTheme}
      title="Настройка Hacker"
      onClickBack={() => setPage('general')}
    >
      <div className="flex flex-wrap items-center px-5 gap-x-1">
        <label htmlFor="mode">Режим:</label>
        <select
          id="mode"
          defaultValue={mode}
          className="px-2 py-1 text-white bg-dark"
          onChange={(e) => {
            localStorage.mode = e.target.value
            setMode(e.target.value)
          }}
        >
          <option
            value="wifi"
            // selected={localStorage.mode === 'wifi'}
          >
            Слово
          </option>
          <option
            value="card"
            // selected={localStorage.mode === 'card'}
          >
            Карта
          </option>
        </select>
      </div>
      {mode === 'wifi' && (
        <div className="flex flex-wrap items-center px-5 gap-x-1">
          <label htmlFor="wifiname">Название точки Wi-Fi</label>
          <input
            id="wifiname"
            className="px-2 py-1 text-white bg-dark"
            defaultValue={localStorage.wifi}
            onChange={(e) => {
              localStorage.wifi = e.target.value
            }}
          />
        </div>
      )}
      <div className="flex flex-wrap items-center px-5 gap-x-3">
        <label htmlFor="learn">Стартовать при переходе в меню Wi-Fi</label>
        <input
          id="learn"
          type="checkbox"
          className="switch_1"
          checked={startOnSetWiFiPage === 'true'}
          onChange={(e) => {
            const newValue =
              !localStorage.startOnSetWiFiPage ||
              localStorage.startOnSetWiFiPage === 'false'
                ? 'true'
                : 'false'
            localStorage.startOnSetWiFiPage = newValue
            setStartOnSetWiFiPage(newValue)
          }}
        />
      </div>
      <div className="flex flex-wrap items-center px-5 gap-x-1">
        <label htmlFor="delay">
          Задержка в секундах до старта анимации и трансляции спама
        </label>
        <input
          id="delay"
          type="number"
          className="px-2 py-1 text-white bg-dark"
          defaultValue={localStorage.delay || 3}
          onChange={(e) => {
            localStorage.delay = e.target.value
          }}
        />
      </div>
      <div className="flex flex-wrap items-center px-5 gap-x-1">
        <label htmlFor="minutesBeforeStop">
          Количество минут через которое спам автоматически остановится
        </label>
        <input
          id="minutesBeforeStop"
          type="number"
          className="px-2 py-1 text-white bg-dark"
          defaultValue={localStorage.minutesBeforeStop || 3}
          onChange={(e) => {
            localStorage.minutesBeforeStop = e.target.value
          }}
        />
      </div>
      <div className="flex flex-wrap items-center px-5 gap-x-1">
        <label htmlFor="dot">
          Добавить "." в начале названия точки (чтобы wi-fi точки были вверху
          списка)
        </label>
        <input
          id="dot"
          type="checkbox"
          className="switch_1"
          checked={dot === 'true'}
          onChange={(e) => {
            const newValue =
              !localStorage.dot || localStorage.dot === 'false'
                ? 'true'
                : 'false'
            localStorage.dot = newValue
            setDot(newValue)
          }}
        />
      </div>
      <div className="flex flex-wrap items-center px-5 gap-x-3">
        <label htmlFor="learn">Режим обучения</label>
        <input
          id="learn"
          type="checkbox"
          className="switch_1"
          checked={learn === 'true'}
          onChange={(e) => {
            const newValue =
              !localStorage.learn || localStorage.learn === 'false'
                ? 'true'
                : 'false'
            localStorage.learn = newValue
            setLearn(newValue)
          }}
        />
      </div>
    </PageWrapper>
  )
}

const WiFiPage = ({ size, toggleTheme, setPage, writeOnCharacteristic }) => {
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
        setWaitingForHack(true)
        setTimeout(() => {
          setHack(true)
          setWaitingForHack(false)
          if (!mode || mode === 'wifi') {
            writeOnCharacteristic(localStorage.wifi, true)
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
    }
  }, [
    startOnSetWiFiPage,
    waitingForHack,
    setWaitingForHack,
    hack,
    setHack,
    mode,
    writeOnCharacteristic,
  ])

  return (
    <PageWrapper
      size={size}
      toggleTheme={toggleTheme}
      title="Wi-Fi"
      onClickBack={() => setPage('connections')}
    >
      <ItemsBlock>
        <div className="text-white">{hack ? 'вкл' : 'выкл'}</div>
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
                if (!mode || mode === 'wifi') {
                  writeOnCharacteristic(localStorage.wifi, true)
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
          <ItemWiFi key={title} title={title} size={size} index={index + 5} />
        ))}
        {wifiSpots?.length < 1 && (
          <ItemWiFi title="" size={size} index={5} hidden />
        )}
        {wifiSpots?.length < 2 && (
          <ItemWiFi title="" size={size} index={5} hidden />
        )}
        {wifiSpots?.length < 3 && (
          <ItemWiFi title="" size={size} index={6} hidden />
        )}
        {wifiSpots?.length < 4 && (
          <ItemWiFi title="" size={size} index={7} hidden />
        )}
        {wifiSpots?.length < 5 && (
          <ItemWiFi title="" size={size} index={8} hidden />
        )}
        {wifiSpots?.length < 6 && (
          <ItemWiFi title="" size={size} index={9} hidden />
        )}
        {wifiSpots?.length < 7 && (
          <ItemWiFi title="" size={size} index={10} hidden />
        )}
        {wifiSpots?.length < 8 && (
          <ItemWiFi title="" size={size} index={11} hidden />
        )}
        {wifiSpots?.length < 9 && (
          <ItemWiFi title="" size={size} index={12} hidden />
        )}
        {wifiSpots?.length < 10 && (
          <ItemWiFi title="" size={size} index={13} hidden />
        )}
        {wifiSpots?.length < 11 && (
          <ItemWiFi title="" size={size} index={14} hidden />
        )}
        {wifiSpots?.length < 12 && (
          <ItemWiFi title="" size={size} index={15} hidden />
        )}
        {/* <ItemWiFi title="MagBelinskiy_TP-Link" size={size} index={5} />
        <ItemWiFi title="RT-5GPON-2122" size={size} index={5} />
        <ItemWiFi title="RT-GPON-2122" size={size} index={6} />
        <ItemWiFi title="RT-GPON-36BD" size={size} index={7} />
        <ItemWiFi title="Telecoma-68C8" size={size} index={8} />
        <ItemWiFi title="Wi-Fi" size={size} index={8} hidden />
        <ItemWiFi title="Wi-Fi" size={size} index={9} hidden />
        <ItemWiFi title="Wi-Fi" size={size} index={10} hidden />
        <ItemWiFi title="Wi-Fi" size={size} index={11} hidden />
        <ItemWiFi title="Wi-Fi" size={size} index={12} hidden />
        <ItemWiFi title="Wi-Fi" size={size} index={13} hidden />
        <ItemWiFi title="Wi-Fi" size={size} index={14} hidden /> */}
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

const ConnectionsPage = ({ size, toggleTheme, setPage }) => {
  return (
    <PageWrapper
      size={size}
      toggleTheme={toggleTheme}
      title="Подключения"
      onClickBack={() => setPage('general')}
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

const GeneralPage = ({ size, toggleTheme, setPage }) => {
  const setSuit = useSetRecoilState(cardSuitAtom)
  const setMast = useSetRecoilState(cardMastAtom)
  // const mast = useRecoilValue(cardMastAtom)
  // const suit = useRecoilValue(cardSuitAtom)
  // console.log('suit :>> ', suit)
  // console.log('mast :>> ', mast)

  return (
    <PageWrapper size={size} toggleTheme={toggleTheme} title="Настройки">
      <ItemsBlock>
        <Item
          title="Алексей Белинский"
          subItems={['Samsung account']}
          size={size}
        >
          <div
            className={cn(
              'absolute p-[1px] rounded-full border border-[#2c2d2f]',
              size === 'small'
                ? 'h-[68px] w-[68px] right-5 -top-3'
                : size === 'big'
                ? 'h-[82px] w-[82px] right-5 -top-3.5'
                : 'h-[72px] w-[72px] right-5 -top-3.5'
            )}
          >
            <img
              className="w-full h-full rounded-full"
              src="img/avatar.png"
              alt="avatar"
            />
          </div>
        </Item>
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Подключения"
          Icon={WiFiIcon}
          subItems={['Wi-Fi', 'Bluetooth', 'Диспетчер SIM-карт']}
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
          title="Подключенные устройства"
          Icon={ConnectedDevicesIcon}
          subItems={['Быстрая отправка', 'Samsung DeX', 'Android Auto']}
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
          title="Режимы и сценарии"
          Icon={ScenariosIcon}
          subItems={['Режимы', 'Сценарии']}
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
          title="Звуки и вибрация"
          Icon={SoundIcon}
          subItems={['Режим звука', 'Мелодия звонка']}
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
          title="Уведомления"
          Icon={NotificationsIcon}
          subItems={['Строка состояния', 'Не беспокоить']}
          size={size}
          hiddenSwipeElementsFunc={[() => setSuit(12), () => setSuit(13)]}
          hiddenSwipeElementsNames={[suits[12], suits[13]]}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Дисплей"
          Icon={DisplayIcon}
          subItems={['Яркость', 'Комфорт для глаз', 'Навигационная панель']}
          size={size}
        />
        <Item
          title="Батарея"
          Icon={BateryIcon}
          subItems={['Энергосбережение', 'Зарядка']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Обои и стиль"
          Icon={WallpappersIcon}
          subItems={['Обои', 'Палитра цветов']}
          size={size}
        />
        <Item
          title="Темы"
          Icon={ThemesIcon}
          subItems={['Темы', 'Обои', 'Значки']}
          size={size}
        />
        <Item
          title="Экран блокировки"
          Icon={BlockScreenIcon}
          subItems={['Тип блокировки экрана', 'Always On Display']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Безопасность и конфиденциальность"
          Icon={ShildIcon}
          subItems={['Биометрические данные', 'Диспетчер разрешений']}
          size={size}
        />
        <Item
          title="Локация"
          Icon={LocationIcon}
          subItems={['Запросы на доступ к местоположению']}
          size={size}
        />
        <Item
          title="Экстренные ситуации"
          Icon={ExtraIcon}
          subItems={['Медицинские сведения', 'Экстренные оповещения']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Учетные записи и архивация"
          Icon={AccountsIcon}
          subItems={['Управление учетными записями', 'Smart Switch']}
          size={size}
        />
        <Item
          title="Google"
          Icon={GoogleIcon}
          subItems={['Службы Google']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Дополнительные функции"
          Icon={AdditionalFunctionsIcon}
          subItems={['Labs', 'S Pen', 'Боковая кнопка']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Использование устройства и родительский контроль"
          Icon={ParentsControlIcon}
          subItems={['Время использования экрана', 'Таймеры приложений']}
          size={size}
        />
        <Item
          title="Обслуживание устройства"
          Icon={CleanUpIcon}
          subItems={['Хранилище', 'Память', 'Защита приложений']}
          size={size}
        />
        <Item
          title="Приложения"
          Icon={AppsIcon}
          subItems={['Приложения по умолчанию', 'Настройки приложений']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Общие настройки"
          Icon={SettingsIcon}
          subItems={['Язык и клавиатура', 'Дата и время']}
          size={size}
        />
        <Item
          title="Специальные возможности"
          Icon={SpecialIcon}
          subItems={['Отображение', 'Слышимость', 'Подвижность']}
          size={size}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Обновление ПО"
          Icon={RefreshIcon}
          subItems={['Загрузка и установка']}
          size={size}
        />
        <Item
          title="Советы и руководство пользователя"
          Icon={DocumentationIcon}
          subItems={['Полезные советы', 'Новые функции']}
          size={size}
        />
        <Item
          title="Сведения о телефоне"
          Icon={InfoIcon}
          subItems={['Состояние', 'Юридическая информация', 'Имя телефона']}
          size={size}
        />
        <Item
          title="Параметры разработчика"
          Icon={DevIcon}
          subItems={['Параметры разработчика']}
          size={size}
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

function App() {
  const setWifiSpots = useSetRecoilState(wifiSpotsAtom)
  const wifiSpots = useRecoilValue(wifiSpotsAtom)
  const [BLEStatus, setBLEStatus] = useState('-')
  const [showConnectDeviceButton, setShowConnectDeviceButton] = useState(false)
  const hack = useRecoilValue(hackAtom)
  const [page, setPage] = useState('general')
  const [size, setSize] = useState('big')
  const [input, setInput] = useState('Escalion')
  const [isConnected, setIsConnected] = useState(false)
  const [state, setState] = useState('Устройство отключено')
  const [retrievedValue, setRetrievedValue] = useState('NaN')
  const [latestValueSent, setLatestValueSent] = useState('')
  const [timestampContainer, setTimestampContainer] = useState('')
  const connectRef = useRef(null)
  const effectRan = useRef(null)
  // const [logs, setLog] = useRecoilState(logsAtom)

  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  function isWebBluetoothEnabled() {
    if (!navigator.bluetooth) {
      console.log('Web Bluetooth API is not available in this browser!')
      setState('Web Bluetooth API is not available in this browser!')
      return false
    }
    console.log('Web Bluetooth API supported in this browser.')
    return true
  }

  function handleCharacteristicChange(event) {
    const newValueReceived = new TextDecoder().decode(event.target.value)
    console.log('Characteristic value changed: ', newValueReceived)
    // setLog((state) => [
    //   ...state,
    //   'Characteristic value changed: ' + newValueReceived,
    // ])
    setWifiSpots(newValueReceived.split('||'))
    setRetrievedValue(newValueReceived)
    setTimestampContainer(getDateTime())
  }

  function writeOnCharacteristic(value, autostart) {
    if (bleServer && bleServer.connected) {
      bleServiceFound
        .getCharacteristic(ledCharacteristic)
        .then((characteristic) => {
          console.log('Found the LED characteristic: ', characteristic.uuid)
          // console.log('test :>> ', value.split(''))
          // const data = new Uint8Array(value.split(''))

          // const data =
          //   typeof value === 'number'
          //     ? new Uint32Array([value])
          //     : Uint32Array.from(value.split('').map((x) => x.charCodeAt()))
          // // // console.log('data :>> ', data)
          // return characteristic.writeValue(data)
          return characteristic.writeValue(
            new TextEncoder().encode(
              !value || value === ' '
                ? ' '
                : (localStorage.minutesBeforeStop || '3') +
                    (localStorage.dot === 'true' ? '.' : '') +
                    value
            )
          )
        })
        .then(() => {
          // setLatestValueSent(value)
          console.log('Value written to LEDcharacteristic:', value)
        })
        .catch((error) => {
          console.error('Error writing to the LED characteristic: ', error)
        })
    } else {
      connectToDevice(value)

      // console.error(
      //   'Bluetooth is not connected. Cannot write to characteristic.'
      // )
      // window.alert(
      //   'Bluetooth is not connected. Cannot write to characteristic. \n Connect to BLE first!'
      // )
    }
  }

  function disconnectDevice() {
    setBLEStatus('Disconnect Device.')
    console.log('Disconnect Device.')
    if (bleServer && bleServer.connected) {
      if (sensorCharacteristicFound) {
        sensorCharacteristicFound
          .stopNotifications()
          .then(() => {
            setBLEStatus('Notifications Stopped')
            console.log('Notifications Stopped')
            // setLog((state) => [...state, 'Notifications Stopped'])
            return bleServer.disconnect()
          })
          .then(() => {
            setBLEStatus('Устройство отключено')
            console.log('Устройство отключено')
            // setLog((state) => [...state, 'Устройство отключено'])
            setState('Устройство отключено')
            setIsConnected(false)
          })
          .catch((error) => {
            setBLEStatus('An error occurred:', error)
            console.log('An error occurred:', error)
            // setLog((state) => [...state, 'An error occurred:' + error])
          })
      } else {
        setBLEStatus('No characteristic found to disconnect.')
        console.log('No characteristic found to disconnect.')
        // setLog((state) => [...state, 'No characteristic found to disconnect.'])
      }
    } else {
      // Throw an error if Bluetooth is not connected
      setBLEStatus('Bluetooth is not connected.')
      console.error('Bluetooth is not connected.')
      window.alert('Bluetooth is not connected.')
      // setLog((state) => [...state, 'Bluetooth is not connected.'])
    }
  }

  const afterConnectDevice = (promise, autostartName = false) =>
    promise
      .then((gattServer) => {
        bleServer = gattServer
        setBLEStatus('Connected to GATT Server')
        console.log('Connected to GATT Server')
        // setLog((state) => [...state, 'Connected to GATT Server'])
        return bleServer.getPrimaryService(bleService)
      })
      .then((service) => {
        bleServiceFound = service
        // setBLEStatus('Service discovered:', service.uuid)
        console.log('Service discovered:', service.uuid)
        // setLog((state) => [...state, 'Service discovered:' + service.uuid])
        setBLEStatus('Device connected')
        setShowConnectDeviceButton(false)
        setIsConnected(true)
        if (autostartName) {
          writeOnCharacteristic(autostartName)
        }
        return service.getCharacteristic(sensorCharacteristic)
      })
      .then((characteristic) => {
        setBLEStatus('Characteristic discovered:', characteristic.uuid)
        console.log('Characteristic discovered:', characteristic.uuid)
        sensorCharacteristicFound = characteristic
        characteristic.addEventListener(
          'characteristicvaluechanged',
          handleCharacteristicChange
        )
        characteristic.startNotifications()
        console.log('Notifications Started.')
        // setLog((state) => [...state, 'Notifications Started.'])
        return characteristic.readValue()
      })
      .then((value) => {
        // setBLEStatus('Read value: ', value)
        // console.log('Read value: ', value)
        // setLog((state) => [...state, 'Read value: ' + value])
        const decodedValue = new TextDecoder().decode(value)
        setBLEStatus('Decoded value: ', decodedValue)
        console.log('Decoded value: ', decodedValue)
        // setLog((state) => [...state, 'Decoded value: ' + decodedValue])
        setWifiSpots(decodedValue.split('||'))
        setRetrievedValue(decodedValue)
        // setIsConnected(true)
        // if (autostartName) {
        //   writeOnCharacteristic(autostartName)
        // }
      })
      .catch((error) => {
        // setBLEStatus('Error: ', error)
        console.log('Error: ', error)
      })

  function autoConnectDevice() {
    navigator.bluetooth.getDevices().then((devices) => {
      console.log('devices :>> ', devices)
      // devices[0].watchAdvertisements().then((e) => {
      //   console.log('e :>> ', e)
      // })
      if (devices?.length > 0) {
        setShowConnectDeviceButton(false)
        for (var device of devices) {
          let abortController = new AbortController()
          device
            .watchAdvertisements({ signal: abortController.signal })
            .then((w) => {
              console.log('w :>> ', w)
            })
          device.addEventListener('advertisementreceived', async (evt) => {
            // Stop the scan to conserve power on mobile devices.
            abortController.abort()
            console.log('evt :>> ', evt)

            // At this point, we know that the device is in range, and we can attempt
            // to connect to it.
            afterConnectDevice(evt.device.gatt.connect())
          })
        }
      } else {
        setBLEStatus('No devices paired')
        setShowConnectDeviceButton(true)
      }
      // devices[0].gatt
      //   .connect()
      //   .then((result) => console.log('result :>> ', result))
    })
    // const test2 = navigator.bluetooth.watchAdvertisements()
    // watchAdvertisements(options)
  }

  // Connect to BLE Device and Enable Notifications
  function connectToDevice(autostartName) {
    setBLEStatus('Initializing Bluetooth...')
    console.log('Initializing Bluetooth...')
    navigator.bluetooth
      .requestDevice({
        filters: [{ name: deviceName }],
        optionalServices: [bleService],
      })
      .then((device) => {
        console.log('Device Selected:', device.name)
        setBLEStatus('Connected to device ' + device.name)
        setState('Connected to device ' + device.name)
        // bleStateContainer.style.color = '#24af37'
        device.addEventListener('gattservicedisconnected', onDisconnected)
        afterConnectDevice(device.gatt.connect(), autostartName)
      })
      // .then((gattServer) => {
      //   bleServer = gattServer
      //   console.log('Connected to GATT Server')
      //   return bleServer.getPrimaryService(bleService)
      // })
      // .then((service) => {
      //   bleServiceFound = service
      //   console.log('Service discovered:', service.uuid)
      //   return service.getCharacteristic(sensorCharacteristic)
      // })
      // .then((characteristic) => {
      //   console.log('Characteristic discovered:', characteristic.uuid)
      //   sensorCharacteristicFound = characteristic
      //   characteristic.addEventListener(
      //     'characteristicvaluechanged',
      //     handleCharacteristicChange
      //   )
      //   characteristic.startNotifications()
      //   console.log('Notifications Started.')
      //   return characteristic.readValue()
      // })
      // .then((value) => {
      //   console.log('Read value: ', value)
      //   const decodedValue = new TextDecoder().decode(value)
      //   console.log('Decoded value: ', decodedValue)
      //   setWifiSpots(decodedValue)
      //   setRetrievedValue(decodedValue)
      //   setIsConnected(true)
      //   if (autostart) {
      //     writeOnCharacteristic(localStorage.wifi)
      //   }
      // })
      .catch((error) => {
        console.log('Error: ', error)
      })
  }

  function onDisconnected(event) {
    console.log('Устройство отключено:', event.target.device.name)
    setBLEStatus('Устройство отключено')
    setState('Устройство отключено')
    setIsConnected(false)

    connectToDevice()
  }
  // const [isEnabled, setIsEnabled] = useState(true)
  // console.log('isEnabled :>> ', isEnabled)
  // useEffect(() => {
  //   navigator.bluetooth.getAvailability().then((available) => {
  //     if (available) {
  //       // NotificationManager.success('Success to access Bluetooth');
  //       setIsEnabled(true)
  //     } else {
  //       // Swal.fire({
  //       //   title: 'Sorry, Your device is not Bluetoothable.',
  //       //   icon: 'error',
  //       //   confirmButtonColor: 'rgb(200, 35, 51)'
  //       // });
  //       setIsEnabled(false)
  //     }
  //   })
  // }, [])

  // const connect = async () => {
  //   navigator.bluetooth
  //     .requestDevice(
  //       // { filters: [{ services: ['heart_rate'] }] }
  //       { acceptAllDevices: true }
  //     )
  //     .then((device) => {
  //       console.log('device :>> ', device)
  //       console.log('device.name', device.name)
  //       return device.gatt.connect()
  //     })
  //     .then((server) => {
  //       console.log('server :>> ', server)
  //       console.log('server.getPrimaryServices()', server.getPrimaryServices())
  //     })
  //     .catch((error) => {
  //       console.error(error)
  //     })
  // }

  // useEffect(() => {
  //   const onBackButtonEvent = (e) => {
  //     e.preventDefault()
  //     // window.history.pushState(
  //     //   null,
  //     //   null,
  //     //   window.location.pathname + '?' + Math.random()
  //     // )
  //     setPage((state) => (state === 'wifi' ? 'connections' : 'general'))
  //   }

  //   window.addEventListener('popstate', onBackButtonEvent)

  //   return () => {
  //     window.removeEventListener('popstate', onBackButtonEvent)
  //   }
  // }, [setPage])
  const onBackButtonEvent = (e) => {
    e.preventDefault()
    // if (!finishStatus) {
    // if (window.confirm("Do you want to go back ?")) {
    // setfinishStatus(true)
    // your logic
    // props.history.push("/");
    // } else {
    window.history.pushState(null, null, window.location.pathname)
    setPage((state) => (state === 'wifi' ? 'connections' : 'general'))
    // var currentLocation = window.location.pathname
    // window.history.push(`${currentLocation}`)
    // setfinishStatus(false)
    // }
  }

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname)
    window.addEventListener('popstate', onBackButtonEvent)
    return () => {
      window.removeEventListener('popstate', onBackButtonEvent)
    }
  }, [page])

  // useEffect(() => {
  //   // if (!effectRan.current) {
  //   window.history.pushState(
  //     null,
  //     null,
  //     window.location.pathname + '?' + Math.random()
  //   )
  //   window.history.pushState(
  //     null,
  //     null,
  //     window.location.pathname + '?' + Math.random()
  //   )
  //   // window.history.pushState(null, null, window.location.pathname)
  //   // }
  //   // return () => {
  //   // effectRan.current = true
  //   // }
  // })

  useEffect(() => {
    setTimeout(() => {
      try {
        if (isWebBluetoothEnabled()) autoConnectDevice()
      } catch (error) {
        console.log('error :>> ', error)
      }
    }, 500)
  })

  return (
    <>
      {isConnected && (
        <div className="absolute left-0 top-0 h-[2px] w-[2px] bg-gray-500" />
      )}
      {/* <div className="p-1 absolute z-50 left-0 bottom-0 max-h-[100px] h-[100px] right-0 bg-white text-black text-xs">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
      {JSON.stringify(wifiSpots)} */}
      <div className="flex px-2 py-1 bg-black">
        {/* <div> */}
        {showConnectDeviceButton && (
          <button
            className="w-full px-2 py-1 font-bold text-white border border-gray-400 rounded"
            onClick={() => {
              if (isWebBluetoothEnabled()) connectToDevice()
              // chrome://flags/#enable-web-bluetooth-new-permissions-backend
            }}
          >
            !!! Подключить устройство hacker !!!
          </button>
        )}

        {/* {!isConnected && (
        <button
          ref={connectRef}
          onClick={(event) => {
            if (isWebBluetoothEnabled()) {
              connectToDevice()
            }
          }}
        >
          Connect to BLE Device
        </button>
      )}
    </div> */}
        {/* <div className="text-white bg-black">{BLEStatus}</div> */}
      </div>

      {!page || page === 'general' ? (
        <GeneralPage size={size} toggleTheme={toggleTheme} setPage={setPage} />
      ) : page === 'connections' ? (
        <ConnectionsPage
          size={size}
          toggleTheme={toggleTheme}
          setPage={setPage}
        />
      ) : page === 'wifi' ? (
        <WiFiPage
          size={size}
          toggleTheme={toggleTheme}
          setPage={setPage}
          writeOnCharacteristic={writeOnCharacteristic}
        />
      ) : page === 'settings' ? (
        <SettingsPage size={size} toggleTheme={toggleTheme} setPage={setPage} />
      ) : null}
    </>
  )

  return (
    <>
      <h1>ESP32 Web BLE App</h1>
      <button
        onClick={(event) => {
          if (isWebBluetoothEnabled()) {
            connectToDevice()
          }
        }}
      >
        Connect to BLE Device
      </button>
      <button onClick={disconnectDevice}>Отключить устройство</button>
      <p>
        Статус:{' '}
        <strong>
          <span
            id="bleState"
            style={{
              color: state === 'Устройство отключено' ? '#d13a30' : '#24af37',
            }}
          >
            {state}
          </span>
        </strong>
      </p>
      {/* <h2>Считанные данные</h2>
      <p>
        <span id="valueContainer">{retrievedValue}</span>
      </p> */}
      <p>
        Последнее чтение: <span id="timestamp">{timestampContainer}</span>
      </p>
      <h2>Конторль</h2>
      {/* <button onClick={() => writeOnCharacteristic(1)}>LED ON</button>
      <button onClick={() => writeOnCharacteristic(0)}>LED OFF</button> */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 10,
          // justifyItems: 'center',
          // alignItems: 'center',
          // width: '100%',
          // flexDirection: 'row',
        }}
      >
        <div
          style={{
            // display: 'flex',
            // flexDirection: 'column',
            // maxWidth: 200,
            width: 200,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div>
            <button
              disabled={!input}
              onClick={() => writeOnCharacteristic(input)}
            >
              ПУСК
            </button>{' '}
            <button
              // disabled={!input}
              onClick={() => writeOnCharacteristic(0)}
            >
              СТОП
            </button>
          </div>
        </div>
      </div>
      <p>
        Последнее отправленное значение:{' '}
        <span id="valueSent">{latestValueSent}</span>
      </p>
    </>
  )
}

export default App
