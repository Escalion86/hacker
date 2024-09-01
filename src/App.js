// import logo from './logo.svg'
import './App.css'
// import * as Bluetooth from 'react-bluetooth'
import { useCallback, useEffect, useState } from 'react'
import cn from 'classnames'
import SearchIcon from './icons/SearchIcon'
import ArrowBack from './icons/ArrowBack'
import { useSetRecoilState } from 'recoil'
import wifiSpotsAtom from './state/wifiSpotsAtom'
import accessCodes from './accessCodes'
import Switch from './components/Switch'
import Button from './components/Button'
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

function toggleTheme(theme) {
  let htmlClasses = document.querySelector('html').classList
  if (theme) {
    if (theme === 'dark') {
      htmlClasses.add('dark')
      localStorage.theme = 'dark'
    } else {
      htmlClasses.remove('dark')
      localStorage.theme = 'light'
    }
  } else {
    if (
      localStorage.theme === 'dark'
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
}

const PageWrapper = ({
  title,
  size,
  children,
  onClickBack,
  activeTitle,
  noSearchIcon,
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
          <ArrowBack size={size} className="fill-black dark:fill-white" />
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
      {!noSearchIcon && (
        <SearchIcon size={size} className="fill-black dark:fill-white" />
      )}
    </div>
    {children}
  </div>
)

const SettingsPage = ({ size, toggleTheme, setPage }) => {
  const [mode, setMode] = useState(localStorage.mode)
  const [learn, setLearn] = useState(localStorage.learn)
  const [theme, setTheme] = useState(localStorage.theme)
  const [dot, setDot] = useState(localStorage.dot)
  const [startOnSetWiFiPage, setStartOnSetWiFiPage] = useState(
    localStorage.startOnSetWiFiPage
  )

  return (
    <PageWrapper
      size={size}
      title="Настройка Hacker"
      onClickBack={() => {
        localStorage.startPage = 'general'
        setPage('general')
      }}
      noSearchIcon
    >
      <Switch
        id="theme"
        label="Тёмная тема"
        checked={theme === 'dark'}
        onChange={(e) => {
          const newValue = !theme || theme === 'light' ? 'dark' : 'light'
          // localStorage.theme = newValue
          setTheme(newValue)
          toggleTheme(newValue)
        }}
      />
      <div className="flex flex-wrap items-center px-5 gap-x-1">
        <label htmlFor="mode">Режим:</label>
        <select
          id="mode"
          defaultValue={mode}
          className="px-2 py-1 bg-gray-200 rounded dark:text-white text-dark dark:bg-dark"
          onChange={(e) => {
            localStorage.mode = e.target.value
            setMode(e.target.value)
          }}
        >
          <option
            value="wifi"
            // className="bg-gray-200 text-dark"
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
            className="px-2 py-1 bg-gray-200 rounded dark:text-white text-dark dark:bg-dark"
            defaultValue={localStorage.wifi || 'Hacked'}
            onChange={(e) => {
              localStorage.wifi = e.target.value
            }}
          />
        </div>
      )}
      <Switch
        id="learn"
        label="Стартовать при переходе в меню Wi-Fi"
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
      <div className="flex flex-wrap items-center px-5 gap-x-1">
        <label htmlFor="delay">
          Задержка в секундах до старта анимации и трансляции спама
        </label>
        <input
          id="delay"
          type="number"
          className="px-2 py-1 bg-gray-200 rounded dark:text-white text-dark dark:bg-dark"
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
          className="px-2 py-1 bg-gray-200 rounded dark:text-white text-dark dark:bg-dark"
          defaultValue={localStorage.minutesBeforeStop || 3}
          onChange={(e) => {
            localStorage.minutesBeforeStop = e.target.value
          }}
        />
      </div>
      <Switch
        id="dot"
        label={`Добавить "." в начале названия точки (чтобы wi-fi точки были вверху
          списка)`}
        checked={dot === 'true'}
        onChange={(e) => {
          const newValue =
            !localStorage.dot || localStorage.dot === 'false' ? 'true' : 'false'
          localStorage.dot = newValue
          setDot(newValue)
        }}
      />
      <Switch
        id="learn"
        label="Режим обучения"
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
      <Button onClick={() => setPage('firstStartPage')}>
        Сменить учетную запись
        <br />
        (ввести другой код доступа)
      </Button>
    </PageWrapper>
  )
}

const FirstStartPage = ({ size, setPage, setAccessCode }) => {
  const [accessCodeInput, setAccessCodeInput] = useState(
    localStorage.accessCode || ''
  )
  const [wrongCode, setWrongCode] = useState(false)
  return (
    <PageWrapper size={size} title="Первый запуск" noSearchIcon>
      <div className="flex flex-wrap items-center px-5 gap-x-1">
        <label htmlFor="accessCode">Введите Ваш код доступа</label>
        <input
          id="accessCode"
          className="px-2 py-1 text-white bg-dark"
          defaultValue={accessCodeInput}
          onChange={(e) => {
            setAccessCodeInput(e.target.value)
            if (wrongCode) setWrongCode(false)
          }}
        />
      </div>
      <Button
        onClick={() => {
          if (accessCodes[accessCodeInput]) {
            localStorage.accessCode = accessCodeInput
            setAccessCode(accessCodeInput)
            setPage('general')
          } else setWrongCode(true)
        }}
      >
        Ввести код
      </Button>
      {wrongCode && <div className="font-bold text-red-500">Код не верен</div>}
    </PageWrapper>
  )
}

function App() {
  const setWifiSpots = useSetRecoilState(wifiSpotsAtom)
  // const wifiSpots = useRecoilValue(wifiSpotsAtom)
  const [BLEStatus, setBLEStatus] = useState('-')
  const [showConnectDeviceButton, setShowConnectDeviceButton] = useState(false)
  // const hack = useRecoilValue(hackAtom)
  const [page, setPage] = useState(localStorage.startPage ?? 'settings')
  const [size, setSize] = useState('big')
  // const [input, setInput] = useState('K♥')
  const [isConnected, setIsConnected] = useState(false)
  const [accessCode, setAccessCode] = useState(localStorage.accessCode || '')
  // const [state, setState] = useState('Устройство отключено')
  // const [retrievedValue, setRetrievedValue] = useState('NaN')
  // const [latestValueSent, setLatestValueSent] = useState('')
  // const [timestampContainer, setTimestampContainer] = useState('')
  // const connectRef = useRef(null)
  // const effectRan = useRef(null)
  // const [logs, setLog] = useRecoilState(logsAtom)

  const accessIndex = accessCodes[accessCode]?.index || 0

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

  const isWebBluetoothEnabled = useCallback(() => {
    if (!navigator.bluetooth) {
      console.log('Web Bluetooth API is not available in this browser!')
      setBLEStatus('Web Bluetooth API is not available in this browser!')
      // setState('Web Bluetooth API is not available in this browser!')
      return false
    }
    console.log('Web Bluetooth API supported in this browser.')
    setBLEStatus('Web Bluetooth API supported in this browser.')
    return true
  }, [])

  const handleCharacteristicChange = useCallback(
    (event) => {
      const newValueReceived = new TextDecoder().decode(event.target.value)
      console.log('Characteristic value changed: ', newValueReceived)
      // setLog((state) => [
      //   ...state,
      //   'Characteristic value changed: ' + newValueReceived,
      // ])
      setWifiSpots(newValueReceived.split('||'))
      // setRetrievedValue(newValueReceived)
      // setTimestampContainer(getDateTime())
    },
    [setWifiSpots]
  )

  const disconnectDevice = useCallback(() => {
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
            // setState('Устройство отключено')
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
  }, [])

  const afterConnectDevice = useCallback(
    (promise, onConnected) =>
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
          console.log('Device connected')
          setShowConnectDeviceButton(false)
          setIsConnected(true)
          if (onConnected) onConnected(service)
          // if (autostartName) {
          //   writeOnCharacteristic(autostartName)
          // }
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
          // setRetrievedValue(decodedValue)
          // setIsConnected(true)
          // if (autostartName) {
          //   writeOnCharacteristic(autostartName)
          // }
        })
        .catch((error) => {
          // setBLEStatus('Error: ', error)
          console.log('Error: ', error)
        }),
    [handleCharacteristicChange, setWifiSpots]
  )

  // const onDisconnected = useCallback(
  //   (event) => {
  //     console.log('Устройство отключено:', event.target.device.name)
  //     setBLEStatus('Устройство отключено')
  //     // setState('Устройство отключено')
  //     setIsConnected(false)

  //     connectToDevice()
  //   },
  //   [connectToDevice]
  // )

  // Connect to BLE Device and Enable Notifications
  const connectToDevice = useCallback(
    (autostartName) => {
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
          // setState('Connected to device ' + device.name)
          // bleStateContainer.style.color = '#24af37'
          device.addEventListener('gattservicedisconnected', (event) => {
            console.log('Устройство отключено:', event.target.device.name)
            setBLEStatus('Устройство отключено')
            // setState('Устройство отключено')
            setIsConnected(false)

            connectToDevice()
          })

          afterConnectDevice(device.gatt.connect(), () => {
            const value = autostartName
            if (bleServer && bleServer.connected) {
              bleServiceFound
                .getCharacteristic(ledCharacteristic)
                .then((characteristic) => {
                  console.log(
                    'Found the LED characteristic: ',
                    characteristic.uuid
                  )
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
                  console.log('Value written to LEDcharacteristic:', value)
                })
                .catch((error) => {
                  console.error(
                    'Error writing to the LED characteristic: ',
                    error
                  )
                })
            } else {
              connectToDevice(value)
            }
          })
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
    },
    // eslint-disable-next-line no-use-before-define
    [afterConnectDevice]
  )

  const writeOnCharacteristic = useCallback(
    (value, autostart) => {
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
    },
    [connectToDevice]
  )

  const autoConnectDevice = useCallback(() => {
    navigator.bluetooth.getDevices().then((devices) => {
      // console.log('devices :>> ', devices)
      setBLEStatus('Devices found: ' + devices?.length)
      // devices[0].watchAdvertisements().then((e) => {
      //   console.log('e :>> ', e)
      // })
      if (devices?.length > 0) {
        setShowConnectDeviceButton(false)
        for (var device of devices) {
          let abortController = new AbortController()
          // console.log('device :>> ', device)
          try {
            device?.watchAdvertisements({ signal: abortController.signal })
            // .then((w) => {
            //   console.log('w :>> ', w)
            // })
            device?.addEventListener('advertisementreceived', async (event) => {
              // Stop the scan to conserve power on mobile devices.
              abortController.abort()
              console.log('Advertisement received.')
              console.log('  Device Name: ' + event.device.name)
              console.log('  Device ID: ' + event.device.id)
              console.log('  RSSI: ' + event.rssi)
              console.log('  TX Power: ' + event.txPower)
              console.log('  UUIDs: ' + event.uuids)

              // At this point, we know that the device is in range, and we can attempt
              // to connect to it.
              afterConnectDevice(event.device.gatt.connect())
            })
          } catch (e) {
            console.log('e :>> ', e)
          }
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
  }, [afterConnectDevice])

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
        else setBLEStatus('WebBluetooth Disabled!')
      } catch (error) {
        setBLEStatus('ERROR')
        console.log('error :>> ', error)
      }
    }, 500)
  }, [setBLEStatus, autoConnectDevice, isWebBluetoothEnabled])

  const Page = accessCodes[accessCode]?.pages[page] || null

  return (
    <>
      {isConnected && (
        <div className="absolute z-50 left-0 top-0 h-[3px] w-[3px] bg-gray-600 dark:bg-gray-500" />
      )}
      {/* <div className="p-1 absolute z-50 left-0 bottom-0 max-h-[100px] h-[100px] right-0 bg-white text-black text-xs">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
      {JSON.stringify(wifiSpots)} */}
      {showConnectDeviceButton && (
        <div className="flex px-2 py-1">
          {/* <div> */}

          <Button
            onClick={() => {
              if (isWebBluetoothEnabled()) connectToDevice()
              // chrome://flags/#enable-web-bluetooth-new-permissions-backend
            }}
          >
            !!! Подключить устройство hacker !!!
          </Button>

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
      )}

      {
        !accessIndex || page === 'firstStartPage' ? (
          <FirstStartPage setPage={setPage} setAccessCode={setAccessCode} />
        ) : !page || page === 'settings' ? (
          <SettingsPage
            size={size}
            toggleTheme={toggleTheme}
            setPage={setPage}
          />
        ) : (
          <Page
            size={size}
            toggleTheme={toggleTheme}
            setPage={setPage}
            writeOnCharacteristic={writeOnCharacteristic}
            BLEStatus={BLEStatus}
          />
        )
        // page === 'general' ? (
        //   <GeneralPage size={size} toggleTheme={toggleTheme} setPage={setPage} />
        // ) : page === 'connections' ? (
        //   <ConnectionsPage
        //     size={size}
        //     toggleTheme={toggleTheme}
        //     setPage={setPage}
        //   />
        // ) : page === 'wifi' ? (
        //   <WiFiPage
        //     size={size}
        //     toggleTheme={toggleTheme}
        //     setPage={setPage}
        //     writeOnCharacteristic={writeOnCharacteristic}
        //   />
        // ) : null
      }
    </>
  )

  // return (
  //   <>
  //     <h1>ESP32 Web BLE App</h1>
  //     <button
  //       onClick={(event) => {
  //         if (isWebBluetoothEnabled()) {
  //           connectToDevice()
  //         }
  //       }}
  //     >
  //       Connect to BLE Device
  //     </button>
  //     <button onClick={disconnectDevice}>Отключить устройство</button>
  //     <p>
  //       Статус:{' '}
  //       <strong>
  //         <span
  //           id="bleState"
  //           style={{
  //             color: state === 'Устройство отключено' ? '#d13a30' : '#24af37',
  //           }}
  //         >
  //           {state}
  //         </span>
  //       </strong>
  //     </p>
  //     {/* <h2>Считанные данные</h2>
  //     <p>
  //       <span id="valueContainer">{retrievedValue}</span>
  //     </p> */}
  //     <p>
  //       Последнее чтение: <span id="timestamp">{timestampContainer}</span>
  //     </p>
  //     <h2>Конторль</h2>
  //     {/* <button onClick={() => writeOnCharacteristic(1)}>LED ON</button>
  //     <button onClick={() => writeOnCharacteristic(0)}>LED OFF</button> */}
  //     <div
  //       style={{
  //         display: 'flex',
  //         justifyContent: 'center',
  //         marginTop: 10,
  //         // justifyItems: 'center',
  //         // alignItems: 'center',
  //         // width: '100%',
  //         // flexDirection: 'row',
  //       }}
  //     >
  //       <div
  //         style={{
  //           // display: 'flex',
  //           // flexDirection: 'column',
  //           // maxWidth: 200,
  //           width: 200,
  //         }}
  //       >
  //         <input
  //           type="text"
  //           value={input}
  //           onChange={(e) => setInput(e.target.value)}
  //         />
  //         <div>
  //           <button
  //             disabled={!input}
  //             onClick={() => writeOnCharacteristic(input)}
  //           >
  //             ПУСК
  //           </button>{' '}
  //           <button
  //             // disabled={!input}
  //             onClick={() => writeOnCharacteristic(0)}
  //           >
  //             СТОП
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //     <p>
  //       Последнее отправленное значение:{' '}
  //       <span id="valueSent">{latestValueSent}</span>
  //     </p>
  //   </>
  // )
}

export default App
