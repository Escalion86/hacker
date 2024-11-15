// import logo from './logo.svg'
import './App.css'
// import * as Bluetooth from 'react-bluetooth'
import { useCallback, useEffect, useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import wifiSpotsAtom from './state/wifiSpotsAtom'
import accessCodes from './accessCodes'
import Button from './components/Button'
import SettingsPage from './pages/SettingsPage'
import FirstStartPage from './pages/FirstStartPage'
import hackAtom from './state/hackAtom'
import cn from 'classnames'

//Define BLE Device Specs
const deviceName = 'Hacker'
const bleService = '19b10000-e8f2-537e-4f6c-d104768a1214'
const wifiSpotsListCharacteristic = '19b10001-e8f2-537e-4f6c-d104768a1214'
const spotNameCharacteristic = '19b10002-e8f2-537e-4f6c-d104768a1214'
const deviceStatusCharacteristic = '19b10003-e8f2-537e-4f6c-d104768a1214'

//Global Variables to Handle Bluetooth
var bleDevice
var bleServer
var bleServiceFound
var wifiSpotsListCharacteristicFound
var deviceStatusCharacteristicFound

async function exponentialBackoff(max, delay, toTry, success, fail) {
  try {
    const result = await toTry()
    success(result)
  } catch (error) {
    if (max === 0) {
      return fail()
    }
    time('Retrying in ' + delay + 's... (' + max + ' tries left)')
    setTimeout(function () {
      exponentialBackoff(--max, delay * 2, toTry, success, fail)
    }, delay * 1000)
  }
}

function time(text) {
  console.log('[' + new Date().toJSON().substr(11, 8) + '] ' + text)
}

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

// var interval
var deviceStatusInterval
// var reconnectFunc
var hack

function App() {
  const setWifiSpots = useSetRecoilState(wifiSpotsAtom)
  // const wifiSpots = useRecoilValue(wifiSpotsAtom)
  const [BLEStatus, setBLEStatus] = useState('-')
  const [showConnectDeviceButton, setShowConnectDeviceButton] = useState(false)
  const hackStatus = useRecoilValue(hackAtom)
  hack = hackStatus
  const [showLogs, setShowLogs] = useState(true)
  const [log, setLog] = useState([])
  const [page, setPage] = useState(localStorage.startPage ?? 'settings')
  const [size, setSize] = useState('big')
  // const [input, setInput] = useState('K♥')
  const [isConnected, setIsConnected] = useState(false)
  const [accessCode, setAccessCode] = useState(localStorage.accessCode || '')
  const [deviceStatus, setDeviceStatus] = useState('Отключено')
  // const [state, setState] = useState('Устройство отключено')
  // const [retrievedValue, setRetrievedValue] = useState('NaN')
  // const [latestValueSent, setLatestValueSent] = useState('')
  // const [timestampContainer, setTimestampContainer] = useState('')
  // const connectRef = useRef(null)
  // const effectRan = useRef(null)
  // const [logs, setLog] = useRecoilState(logsAtom)
  const addLog = (newLog) => {
    console.log(newLog)
    setBLEStatus(newLog)
    setLog((state) => [...state, newLog])
  }

  const toggleShowLogs = () => setShowLogs((state) => !state)

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
      addLog('Web Bluetooth API is not available in this browser!')
      // setState('Web Bluetooth API is not available in this browser!')
      return false
    }
    addLog('Web Bluetooth API supported in this browser.')
    return true
  }, [])

  const handleDeviceStatusCharacteristicChange = useCallback(
    (event) => {
      console.log('event.target.value :>> ', event.target.value)
      const newValueReceived = new TextDecoder().decode(event.target.value)
      console.log(
        '"Device Status" characteristic value changed: ',
        newValueReceived
      )
      setDeviceStatus(newValueReceived)
    },
    [setDeviceStatus]
  )

  function handleWiFiSpotsListCharacteristicChange(event) {
    const newValueReceived = new TextDecoder().decode(event.target.value)
    addLog(
      '"Wifi Spots List" characteristic value changed: ' + newValueReceived
    )
    // setLog((state) => [
    //   ...state,
    //   'Characteristic value changed: ' + newValueReceived,
    // ])
    setWifiSpots(newValueReceived.split('||'))
    // setRetrievedValue(newValueReceived)
    // setTimestampContainer(getDateTime())
  }

  const disconnectDevice = useCallback(async () => {
    addLog('Disconnect Device.')
    if (deviceStatusInterval) clearInterval(deviceStatusInterval)
    // if (interval) clearInterval(interval)
    setDeviceStatus('Отключено')
    setIsConnected(false)
    if (!bleDevice) {
      return
    }
    console.log('Disconnecting from Bluetooth Device...')
    if (bleDevice.gatt.connected) {
      bleDevice.gatt.unwatchAdvertisements()
      bleDevice.gatt.disconnect()
    } else {
      console.log('> Bluetooth Device is already disconnected')
    }
    // if (reconnectFunc) {
    //   console.log('запускаем попытки переподключения')
    //   try {
    //     await reconnectFunc()
    //   } catch (eeee) {
    //     console.log('eeee', eeee)
    //   }
    //   interval = setInterval(async () => await reconnectFunc(), 5000)
    //   return
    // }

    if (bleServer && bleServer.connected) {
      if (wifiSpotsListCharacteristicFound) {
        wifiSpotsListCharacteristicFound
          .stopNotifications()
          .then(() => {
            addLog('Notifications "Wifi Spots List" Stopped')
            // setLog((state) => [...state, 'Notifications Stopped'])
            return bleServer.disconnect()
          })
          .then(() => {
            addLog('Устройство отключено')
            // setLog((state) => [...state, 'Устройство отключено'])
            // setState('Устройство отключено')
          })
          .catch((error) => {
            addLog('An error occurred:', error)
            // setLog((state) => [...state, 'An error occurred:' + error])
          })
      }
      //  else {
      //   setBLEStatus('No characteristic found to disconnect.')
      //   console.log('No characteristic found to disconnect.')
      //   // setLog((state) => [...state, 'No characteristic found to disconnect.'])
      // }
      if (deviceStatusCharacteristicFound) {
        deviceStatusCharacteristicFound
          .stopNotifications()
          .then(() => {
            addLog('Notifications "Device Status" Stopped')
            // setLog((state) => [...state, 'Notifications Stopped'])
            return bleServer.disconnect()
          })
          .then(() => {
            addLog('Устройство отключено')
            // setLog((state) => [...state, 'Устройство отключено'])
            // setState('Устройство отключено')
          })
          .catch((error) => {
            addLog('An error occurred:', error)
            // setLog((state) => [...state, 'An error occurred:' + error])
          })
      }
    } else {
      // Throw an error if Bluetooth is not connected
      addLog('Bluetooth is not connected.')
      window.alert('Bluetooth is not connected.')
      // setLog((state) => [...state, 'Bluetooth is not connected.'])
    }
  }, [])

  const afterConnectDevice = useCallback(
    (promise, onConnected) =>
      promise
        .then((gattServer) => {
          bleServer = gattServer
          addLog('Connected to GATT Server')
          // setLog((state) => [...state, 'Connected to GATT Server'])
          return bleServer.getPrimaryService(bleService)
        })
        .then((service) => {
          bleServiceFound = service
          // setBLEStatus('Service discovered:', service.uuid)
          addLog('Service discovered: ' + service.uuid)
          // setLog((state) => [...state, 'Service discovered:' + service.uuid])
          // addLog('Device connected')
          setShowConnectDeviceButton(false)
          setIsConnected(true)
          if (onConnected) onConnected(service)
          // if (autostartName) {
          //   writeOnCharacteristic(autostartName)
          // }
          return service.getCharacteristic(wifiSpotsListCharacteristic)
          // const wifiSpotsListCharacteristicFromService =
          //   await service.getCharacteristic(wifiSpotsListCharacteristic)
        })
        .then((characteristic) => {
          // if (characteristic) {
          addLog('Characteristic discovered: ' + characteristic.uuid)
          wifiSpotsListCharacteristicFound = characteristic
          characteristic.addEventListener(
            'characteristicvaluechanged',
            handleWiFiSpotsListCharacteristicChange
          )
          characteristic.startNotifications()
          // addLog('Notifications Started.')
          // const value =
          // return characteristic.readValue()
          // if (value) {
          //   const decodedValue = new TextDecoder().decode(value)
          //   setBLEStatus('Decoded value: ', decodedValue)
          //   console.log('Decoded value: ', decodedValue)
          //   // setLog((state) => [...state, 'Decoded value: ' + decodedValue])
          //   setWifiSpots(decodedValue.split('||'))
          // }
          // }

          // const deviceStatusCharacteristicFromService =
          //   await service.getCharacteristic(deviceStatusCharacteristic)
          // addLog(
          //   'deviceStatusCharacteristicFromService = ' +
          //     deviceStatusCharacteristicFromService
          // )
          // if (deviceStatusCharacteristicFromService) {
          //   addLog(
          //     'Characteristic discovered: ' +
          //       deviceStatusCharacteristicFromService.uuid
          //   )
          //   wifiSpotsListCharacteristicFound =
          //     deviceStatusCharacteristicFromService
          //   deviceStatusCharacteristicFromService.addEventListener(
          //     'characteristicvaluechanged',
          //     handleDeviceStatusCharacteristicChange
          //   )
          //   deviceStatusCharacteristicFromService.startNotifications()
          //   addLog('Notifications Started.')

          //   // await deviceStatusCharacteristicFromService.readValue()

          //   // addLog('Readed value')

          //   // if (deviceStatusInterval) clearInterval(deviceStatusInterval)

          //   // addLog('Start interval')

          //   // deviceStatusInterval = setInterval(async () => {
          //   //   try {
          //   //     if (!hack) {
          //   //       console.log('Check device status')
          //   //       await deviceStatusCharacteristicFromService.readValue()
          //   //     }
          //   //   } catch (eee) {
          //   //     console.log('eee :>> ', eee)
          //   //     await disconnectDevice()
          //   //     await autoConnectDevice()
          //   //     // if (deviceStatusInterval) clearInterval(deviceStatusInterval)
          //   //     // if (interval) clearInterval(interval)
          //   //   }
          //   // }, 5000)

          //   // if (value) {
          //   //   const decodedValue = new TextDecoder().decode(value)
          //   //   setBLEStatus('Decoded value: ', decodedValue)
          //   //   console.log('Decoded value: ', decodedValue)
          //   //   // setLog((state) => [...state, 'Decoded value: ' + decodedValue])
          //   //   setWifiSpots(decodedValue.split('||'))
          //   // }
          // }
        })
        // .then((value) => {
        //   const newValueReceived = new TextDecoder().decode(value)
        //   addLog(
        //     '"Wifi Spots List" characteristic value changed: ' +
        //       newValueReceived
        //   )
        //   // setLog((state) => [
        //   //   ...state,
        //   //   'Characteristic value changed: ' + newValueReceived,
        //   // ])
        //   setWifiSpots(newValueReceived.split('||'))
        //   // setRetrievedValue(newValueReceived)
        //   // setTimestampContainer(getDateTime())
        // })
        // .then((characteristic) => {
        //   setBLEStatus('Characteristic discovered:', characteristic.uuid)
        //   console.log('Characteristic discovered:', characteristic.uuid)
        //   wifiSpotsListCharacteristicFound = characteristic
        //   characteristic.addEventListener(
        //     'wifispotscharacteristicchanged',
        //     handleWiFiSpotsListCharacteristicChange
        //   )
        //   characteristic.startNotifications()
        //   console.log('Notifications Started.')
        //   // setLog((state) => [...state, 'Notifications Started.'])
        //   return characteristic.readValue()
        // })
        // .then((value) => {
        //   // setBLEStatus('Read value: ', value)
        //   // console.log('Read value: ', value)
        //   // setLog((state) => [...state, 'Read value: ' + value])
        //   const decodedValue = new TextDecoder().decode(value)
        //   setBLEStatus('Decoded value: ', decodedValue)
        //   console.log('Decoded value: ', decodedValue)
        //   // setLog((state) => [...state, 'Decoded value: ' + decodedValue])
        //   setWifiSpots(decodedValue.split('||'))
        //   // setRetrievedValue(decodedValue)
        //   // setIsConnected(true)
        //   // if (autostartName) {
        //   //   writeOnCharacteristic(autostartName)
        //   // }
        // })
        .catch(async (error) => {
          addLog('Error: ' + error)
          await disconnectDevice()
          await autoConnectDevice()
        }),
    [
      // handleWiFiSpotsListCharacteristicChange,
      handleDeviceStatusCharacteristicChange,
    ]
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

  async function connect() {
    exponentialBackoff(
      3 /* max retries */,
      2 /* seconds delay */,
      async function toTry() {
        time('Connecting to Bluetooth Device... ')
        await bleDevice.connect()
      },
      function success() {
        console.log('> Bluetooth Device connected. Try disconnect it now.')
      },
      function fail() {
        time('Failed to reconnect.')
      }
    )
  }

  // Connect to BLE Device and Enable Notifications
  const connectToDevice = useCallback(
    (autostartName) => {
      addLog('Initializing Bluetooth...')
      navigator.bluetooth
        .requestDevice({
          filters: [{ name: deviceName }],
          optionalServices: [bleService],
        })
        .then((device) => {
          addLog('Connected to device ' + device.name)
          bleDevice = device
          // setState('Connected to device ' + device.name)
          // bleStateContainer.style.color = '#24af37'
          bleDevice.addEventListener(
            'gattservicedisconnected',
            async (event) => {
              addLog('Устройство отключено: ' + event.target.device.name)
              // setState('Устройство отключено')
              setIsConnected(false)
              await connect()
              // connectToDevice()
            }
          )

          afterConnectDevice(device.gatt.connect(), () => {
            const value = autostartName
            if (bleServer && bleServer.connected) {
              bleServiceFound
                .getCharacteristic(spotNameCharacteristic)
                .then((characteristic) => {
                  console.log(
                    'Found the "Wifi Spot Name" characteristic: ',
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
                  console.log('Value written to spotNameCharacteristic:', value)
                })
                .catch((error) => {
                  console.error(
                    'Error writing to the "Wifi Spot Name" characteristic: ',
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
        //   return service.getCharacteristic(wifiSpotsListCharacteristic)
        // })
        // .then((characteristic) => {
        //   console.log('Characteristic discovered:', characteristic.uuid)
        //   wifiSpotsListCharacteristicFound = characteristic
        //   characteristic.addEventListener(
        //     'characteristicvaluechanged',
        //     handleWiFiSpotsListCharacteristicChange
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
          .getCharacteristic(spotNameCharacteristic)
          .then((characteristic) => {
            console.log(
              'Found the "Wifi Spot Name" characteristic: ',
              characteristic.uuid
            )
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
            console.log('Value written to spotNameCharacteristic:', value)
          })
          .catch((error) => {
            console.error(
              'Error writing to the "Wifi Spot Name" characteristic: ',
              error
            )
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

  const autoConnectDevice = useCallback(async () => {
    // if (interval) clearInterval(interval)
    // if (reconnectFunc) return await reconnectFunc()
    // console.log('interval seted')
    // interval = setInterval(() => {
    navigator.bluetooth.getDevices().then((devices) => {
      // console.log('devices :>> ', devices)
      addLog('Devices found: ' + devices?.length)
      // devices[0].watchAdvertisements().then((e) => {
      //   console.log('e :>> ', e)
      // })
      if (devices?.length > 0) {
        setShowConnectDeviceButton(false)
        for (var device of devices) {
          let abortController = new AbortController()
          // device.gatt.connect()
          // console.log('device :>> ', device)\

          try {
            // device
            //   ?.watchAdvertisements({ signal: abortController.signal })
            //   .then((w) => {
            //     console.log('w :>> ', w)
            //   })
            //   .catch((e) => {
            //     console.error(e)
            //     setShowConnectDeviceButton(true)
            //   })
            // device.gatt.connect().then((r) => console.log('r :>> ', r))

            device?.addEventListener(
              'gattservicedisconnected',
              async (event) => {
                addLog('Устройство отключено: ' + event.target.device.name)
                // setState('Устройство отключено')
                setIsConnected(false)
                await connect()
                // connectToDevice()
              }
            )

            device?.addEventListener(
              'advertisementreceived',
              async (event) => {
                // Stop the scan to conserve power on mobile devices.
                abortController.abort()
                console.log('Advertisement received.')
                console.log('  Device Name: ' + event.device.name)
                console.log('  Device ID: ' + event.device.id)
                console.log('  RSSI: ' + event.rssi)
                console.log('  TX Power: ' + event.txPower)
                console.log('  UUIDs: ' + event.uuids)
                // clearInterval(interval)
                // console.log('interval cleared')

                // At this point, we know that the device is in range, and we can attempt
                // to connect to it.
                afterConnectDevice(event.device.gatt.connect())
                // reconnectFunc = () => event.device.gatt.connect()
              },
              { once: true }
            )

            // console.log('Watching advertisements from "' + device.name + '"...')
            addLog('Watching advertisements from "' + device.name + '"...')
            device
              .watchAdvertisements({ signal: abortController.signal })
              // .then((w) => {
              //   addLog('w :>> ' + w)
              // })
              .catch((error) => {
                console.log('Argh watchAdvertisements! ' + error)
              })
          } catch (e) {
            console.log('e :>> ', e)
          }
        }
      } else {
        // if (interval) clearInterval(interval)
        addLog('No devices paired')
        setShowConnectDeviceButton(true)
      }
      // devices[0].gatt
      //   .connect()
      //   .then((result) => console.log('result :>> ', result))
    })
    // }, 5000)
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
    setTimeout(async () => {
      try {
        if (isWebBluetoothEnabled()) await autoConnectDevice()
        else addLog('WebBluetooth Disabled!')
      } catch (error) {
        addLog('ERROR: ' + error)
        // console.log('error :>> ', error)
      }
    }, 500)
  }, [setBLEStatus, autoConnectDevice, isWebBluetoothEnabled])

  const Page = accessCodes[accessCode]?.pages[page] || null

  return (
    <>
      {isConnected && (
        <div
          className={cn(
            'absolute z-50 left-0 top-0 h-[20px] w-[20px]',
            deviceStatus.substring(0, 15) === 'Идет трансляция'
              ? 'bg-green-700'
              : 'bg-gray-600 dark:bg-gray-500'
          )}
        />
      )}
      <div
        className={cn(
          'absolute z-50 left-10 top-0 h-[20px] w-[20px]',
          'bg-Blue-700'
        )}
      />
      {/* <div className="p-1 absolute z-50 left-0 bottom-0 max-h-[100px] h-[100px] right-0 bg-white text-black text-xs">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
      {JSON.stringify(wifiSpots)} */}
      {showConnectDeviceButton &&
        typeof accessIndex === 'number' &&
        page !== 'firstStartPage' && (
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
          </div>
        )}
      <div className="text-blue-300 bg-black" onClick={toggleShowLogs}>
        {BLEStatus}
      </div>
      {/* <button onClick={disconnectDevice}>Отключить устройство</button> */}
      {
        showLogs ? (
          <div className="text-white bg-black">
            {log.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        ) : !accessIndex || page === 'firstStartPage' ? (
          <FirstStartPage setPage={setPage} setAccessCode={setAccessCode} />
        ) : !page || page === 'settings' ? (
          <SettingsPage
            size={size}
            toggleTheme={toggleTheme}
            setPage={setPage}
            connectToDevice={connectToDevice}
            disconnectDevice={disconnectDevice}
            isConnected={isConnected}
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
