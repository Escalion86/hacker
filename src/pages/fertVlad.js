import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import wifiSpotsAtom from '../state/wifiSpotsAtom'
import hackAtom from '../state/hackAtom'
import { useRef, useState } from 'react'
import cardMastAtom from '../state/cardMastAtom'
import cardSuitAtom from '../state/cardSuitAtom'
import { useEffect } from 'react'
import { masts, mastsEmoji, suits } from '../constants'
import cn from 'classnames'
import SearchIcon from '../icons/SearchIcon'
import ArrowBack from '../icons/ArrowBack'
import makeId from '../helpers/makeId'
import getRandomInt from '../helpers/getRandomInt'
import { motion, useScroll, useTransform } from 'framer-motion'
import WiFiSpot from '../icons/WiFiSpot'
import VerticalDots from '../icons/VerticalDots'
import QRScanerIcon from '../icons/enkD83Js/QRScanerIcon'
import ArrowLeftIcon from '../icons/enkD83Js/ArrowLeftIcon'
import WiFiIcon from '../icons/vladFert/WiFiIcon'
import NetworkIcon from '../icons/vladFert/NetworkIcon'
import AccountIcon from '../icons/vladFert/AccountIcon'
import BTIcon from '../icons/vladFert/BTIcon'
import ConnectionsIcon from '../icons/vladFert/ConnectionsIcon'
import InfoIcon from '../icons/vladFert/InfoIcon'
import PicIcon from '../icons/vladFert/PicIcon'
import GeneralScreenIcon from '../icons/vladFert/GeneralScreenIcon'
import ScreenIcon from '../icons/vladFert/ScreenIcon'
import SoundIcon from '../icons/vladFert/SoundIcon'
import NotificationsIcon from '../icons/vladFert/NotificationsIcon'
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

  const height = useTransform(scrollY, [0, 70], [100, 45])
  const scale = useTransform(scrollY, [0, 70], [1, 0.5])
  const marginLeft = useTransform(scrollY, [0, 70], [0, -44])
  const marginTop = useTransform(scrollY, [0, 70], [-90, -30])
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
      <div className="" style={{ height: collapsedTitle ? 40 : 100 }} />
      <motion.div
        className={cn(
          'bg-[#f6f6f8] dark:bg-black z-10 sticky top-0 flex justify-between items-center',
          // size === 'small'
          //   ? 'pl-5 pr-4 pt-5 pb-3'
          //   : size === 'big'
          //   ? 'pl-6 pr-6 pt-8 pb-3.5'
          //   : 'pl-6 pr-5 pt-6 pb-3.5'
          'pr-3 pt-6'
        )}
        style={{ marginTop: collapsedTitle ? -40 : marginTop }}
        // onClick={toggleTheme}
      >
        <motion.div
          className="flex items-center justify-start overflow-visible"
          style={{ marginLeft: collapsedTitle ? -16 : marginLeft }}
        >
          {onClickBack && (
            <div
              onClick={onClickBack}
              className="button cursor-pointer ml-4 -mb-3.5 -mt-3.5 rounded-full"
            >
              <ArrowLeftIcon className="fill-[#1a1a1a] dark:fill-white" />
            </div>
          )}
          <motion.div
            className="z-50 flex items-center w-full overflow-visible font-semibold text-[36px] leading-[40px]"
            // style={{ height: 100, minHeight: 100 }}
            style={{
              height: collapsedTitle ? 45 : height,
              scrollSnapAlign: 'center',
              scale: collapsedTitle ? 0.5 : scale,
            }}
            // style={{

            //   minHeight: height,
            //   height,
            //   y: 300,
            // }}
          >
            {title}
          </motion.div>
        </motion.div>
        <div className="absolute right-0 flex items-center bottom-2">
          {icons.length > 0
            ? icons.map((Icon) => (
                <Icon className="ml-2 fill-dark dark:fill-white stroke-dark dark:stroke-white" />
              ))
            : null}
        </div>
      </motion.div>
      <div
        className={cn(
          'flex flex-col pb-4',
          size === 'small'
            ? 'gap-y-4'
            : size === 'big'
            ? 'gap-y-5'
            : 'gap-y-[18px]'
        )}
        style={{ scrollSnapAlign: 'start' }}
      >
        {children}
      </div>
    </div>
  )
}

const ItemWiFi = ({
  size,
  title,
  onClick,
  index,
  hidden,
  level,
  dontChange,
}) => {
  const hack = useRecoilValue(hackAtom)
  const [titleState, setTitleState] = useState(title)
  const [iteration, setIteration] = useState(0)
  const mast = useRecoilValue(cardMastAtom)
  const suit = useRecoilValue(cardSuitAtom)
  const mode = localStorage.mode
  const itemRef = useRef()
  const interval = useRef()

  useEffect(() => {
    if (!dontChange) {
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
    }
  }, [hack, iteration, mast, suit, mode, dontChange])

  useEffect(() => {
    if (!hack & !dontChange) setIteration(0)
  }, [hack, dontChange])

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
        'relative group first:rounded-t-2xl last:rounded-b-2xl duration-1000 transition-opacity bg-white dark:bg-[#171719]',
        hidden && iteration < index ? 'h-0 opacity-0' : 'opacity-100'
      )}
      onClick={onClick}
    >
      <div
        ref={itemRef}
        className={cn(
          'button flex items-center group-first:rounded-t-2xl group-last:rounded-b-2xl',
          'px-[13px] pb-[18px]'
        )}
      >
        <div className={cn('pointer-events-none mr-1.5', 'pt-[18px]')}>
          <WiFiSpot
            level={level}
            inactiveColor="#cecece"
            activeColor="#6c6c6c"
          />
        </div>
        <div
          className={cn(
            'flex gap-x-3 items-center justify-between flex-1',
            'pt-[18px]'
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
              {dontChange ? title : titleState}
            </div>
          </div>
        </div>
        <div className="rotate-180 mt-[18px]">
          <InfoIcon
            width={16}
            height={16}
            // className="fill-[#c1c1c1] dark:fill-white"
          />
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
  big,
  alterColor = false,
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
        'relative group first:rounded-t-xl last:rounded-b-xl',
        activeTitle
          ? 'bg-[#eeeef0] dark:bg-[#1a1a1a]'
          : 'bg-[#fcfcfe] dark:bg-[#1a1a1a]',
        className
        //font-semibold
      )}
    >
      <div
        ref={itemRef}
        onClick={onClick}
        className={cn(
          'button flex items-center group-first:rounded-t-2xl group-last:rounded-b-2xl',
          big ? 'pb-[24px] min-h-[60px]' : 'pb-[10px] min-h-[54px]',
          'px-[16px]'
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
              'rounded-full aspect-square pointer-events-none mr-4 flex justify-center items-center',
              big
                ? 'mt-[22px] max-w-[40px] max-h-[40px] min-w-[40px] min-h-[40px]'
                : 'mt-3.5 max-w-[36px] max-h-[36px] min-w-[36px] min-h-[36px]',
              alterColor ? 'bg-[#c9dae4]' : 'bg-[#009994]'
            )}
          >
            <Icon />
          </div>
        )}
        <div
          className={cn(
            'flex gap-x-3 items-center justify-between flex-1',
            big ? 'pt-[26px]' : 'pt-[10px]'
          )}
        >
          <div
            className={cn(
              'flex-1 pointer-events-none gap-x-2 flex-col items-start'
            )}
          >
            <div
              className={cn(
                'text-left -mt-0.5', //font-semibold
                activeTitle ? 'text-[#578ffe]' : '',
                'text-[14px] leading-[18px]'
              )}
            >
              {title}
            </div>
            {subItems && (
              <div className="mt-2 text-left text-[#767676] text-[11px] leading-[13px]">
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
                className="switch_2"
                checked={isChecked}
                onChange={(e) => {
                  // e.stopPropagation()
                  setIsChecked(!isChecked)
                }}
              />
            </div>
          )}
          {textRight && (
            <div className="text-[12px] leading-[15px] text-secondary">
              {textRight}
            </div>
          )}
          {arrow && (
            <div className="rotate-180">
              <ArrowBack width={18} height={18} className="fill-[#767676]" />
            </div>
          )}
        </div>
      </div>
      <div className="pointer-events-none">{children}</div>
    </div>
  )
}

const ItemsBlock = ({ title, rightTitle, children, className }) => {
  return (
    <div className={className}>
      {(title || rightTitle) && (
        <div className="flex justify-between mx-5 mb-2.5">
          {title && (
            <div className="font-bold text-[#999999] text-[12px]">{title}</div>
          )}
          {rightTitle && (
            <div className="ont-bold text-[#099594] text-[12px]">
              {rightTitle}
            </div>
          )}
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
      toggleTheme={toggleTheme}
      title="Wi-Fi"
      onClickBack={() => setPage('general')}
      className={className}
      icons={[
        () => QRScanerIcon({ className: 'fill-[#1a1a1a] dark:fill-white' }),
        VerticalDots,
      ]}
      collapsedTitle
    >
      <ItemsBlock className="mt-2">
        <Item
          title="Wi-Fi"
          arrow={false}
          // big
          // activeTitle={true}
          // subItems={['Wi-Fi', 'Bluetooth', 'Диспетчер SIM-карт']}
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
        <Item title="Помощник по Wi-Fi" />
      </ItemsBlock>
      <ItemsBlock title="Сохраненные сети">
        <ItemWiFi title="DIREZABLe" dontChange />
        <ItemWiFi title="DIREZABLe-5G" dontChange />
      </ItemsBlock>
      <ItemsBlock title="Доступные сети" rightTitle="Обновить">
        {wifiSpots.map((title, index) => {
          if (title.trim() === '') return null
          return (
            <ItemWiFi
              key={title}
              title={title}
              index={index + 5}
              level={wiFiSpotsLevels[index] ?? 4}
            />
          )
        })}
        {hack && wifiSpots?.length < 1 && (
          <ItemWiFi title="" index={5} level={wiFiSpotsLevels[0]} />
        )}
        {hack && wifiSpots?.length < 2 && (
          <ItemWiFi title="" index={5} hidden level={wiFiSpotsLevels[1]} />
        )}
        {hack && wifiSpots?.length < 3 && (
          <ItemWiFi title="" index={6} hidden level={wiFiSpotsLevels[2]} />
        )}
        {hack && wifiSpots?.length < 4 && (
          <ItemWiFi title="" index={7} hidden level={wiFiSpotsLevels[3]} />
        )}
        {hack && wifiSpots?.length < 5 && (
          <ItemWiFi title="" index={8} hidden level={wiFiSpotsLevels[4]} />
        )}
        {hack && wifiSpots?.length < 6 && (
          <ItemWiFi title="" index={9} hidden level={wiFiSpotsLevels[5]} />
        )}
        {hack && hack && wifiSpots?.length < 7 && (
          <ItemWiFi title="" index={10} hidden level={wiFiSpotsLevels[6]} />
        )}
        {wifiSpots?.length < 8 && (
          <ItemWiFi title="" index={11} hidden level={wiFiSpotsLevels[7]} />
        )}
        {hack && wifiSpots?.length < 9 && (
          <ItemWiFi title="" index={12} hidden level={wiFiSpotsLevels[8]} />
        )}
        {hack && wifiSpots?.length < 10 && (
          <ItemWiFi title="" index={13} hidden level={wiFiSpotsLevels[9]} />
        )}
        {hack && wifiSpots?.length < 11 && (
          <ItemWiFi title="" index={14} hidden level={wiFiSpotsLevels[10]} />
        )}
        {hack && wifiSpots?.length < 12 && (
          <ItemWiFi title="" index={15} hidden level={wiFiSpotsLevels[11]} />
        )}
      </ItemsBlock>
      {/* <ItemsBlock className="mt-2">
        <Item title="Настройки Wi-Fi" big />
        <Item title="Расширенные настройки" big />
      </ItemsBlock> */}
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

export const GeneralPage = ({ size, setPage, className, BLEStatus }) => {
  const setSuit = useSetRecoilState(cardSuitAtom)
  const setMast = useSetRecoilState(cardMastAtom)

  return (
    <PageWrapper title="Настройки" className={className}>
      {/* {BLEStatus && (
        <div className="bg-gray-600 dark:bg-gray-500 text-dark dark:text-white">
          {BLEStatus}
        </div>
      )} */}
      <div className="mb-2 rounded-3xl bg-[#f1f1f1] dark:bg-dark text-[#767676] flex px-[12px] py-[10px] items-center gap-x-3">
        <SearchIcon className="fill-[#767676]" size="md" />
        Поиск
      </div>
      <ItemsBlock>
        <Item
          title="Magfert"
          Icon={AccountIcon}
          subItems={['Enjoy exclusive benefits and services designed for you!']}
          // className="py-4"
          alterColor
          big
          arrow={false}
        />
        {/* <Item
          title="Мой телефон"
          Icon={PhoneIcon}
          textRight="TECNO POVA Neo 2"
        /> */}
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Wi-Fi"
          Icon={WiFiIcon}
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
          title="Мобильная сеть"
          Icon={NetworkIcon}
          hiddenSwipeElementsFunc={[
            () => setSuit(0),
            () => setSuit(1),
            () => setSuit(2),
            () => setSuit(3),
          ]}
          hiddenSwipeElementsNames={[suits[0], suits[1], suits[2], suits[3]]}
        />
        <Item
          title="Bluetooth"
          Icon={BTIcon}
          hiddenSwipeElementsFunc={[
            () => setSuit(4),
            () => setSuit(5),
            () => setSuit(6),
            () => setSuit(7),
          ]}
          hiddenSwipeElementsNames={[suits[4], suits[5], suits[6], suits[7]]}
          // textRight="HUAWEI WATCH GT 3-2..."
        />
        <Item
          title="Подключение и общий доступ"
          Icon={ConnectionsIcon}
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
          title="Обои и стили"
          Icon={PicIcon}
          hiddenSwipeElementsFunc={[() => setSuit(12), () => setSuit(13)]}
          hiddenSwipeElementsNames={[suits[12], suits[13]]}
        />
        <Item
          title="Главный экран и экран блокировки"
          Icon={GeneralScreenIcon}
        />
        <Item title="Экран и Яркость" Icon={ScreenIcon} />
        <Item title="Звуки и вибрация" Icon={SoundIcon} />
        <Item title="Уведомления и строка состояния" Icon={NotificationsIcon} />
      </ItemsBlock>
      <ItemsBlock>
        <Item title="Приложения" Icon={NetworkIcon} />
        <Item title="Защита и конфиденциальность" Icon={NetworkIcon} />
        <Item title="Местоположение" Icon={NetworkIcon} />
        <Item title="Безопасность и экстренные случаи" Icon={NetworkIcon} />
        <Item title="Батарея" Icon={NetworkIcon} />
      </ItemsBlock>
      <ItemsBlock>
        <Item title="Специальные функции" Icon={NetworkIcon} />
        <Item
          title="Цифровое благополучие и родительский контроль"
          Icon={NetworkIcon}
        />
        <Item title="Дополнительные настройки" Icon={NetworkIcon} />
        {/* <Item title="Специальные функции" Icon={ExtraIcon} /> */}
      </ItemsBlock>
      <ItemsBlock>
        <Item title="Об устройстве" Icon={NetworkIcon} />
        <Item title="Пользователи и аккаунты" Icon={NetworkIcon} />
        <Item title="Google" Icon={NetworkIcon} />
        <Item
          title="Справка и отзывы"
          Icon={NetworkIcon}
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
