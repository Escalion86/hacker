import logo from './logo.svg'
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

// const btReq = async () => {
//   try {
//     const result = await Bluetooth.requestDeviceAsync()

//     if (result.type === 'cancel') {
//       return
//     }

//     const device = result.device
//     console.log('device :>> ', device)
//   } catch ({ message, code }) {
//     console.log('Error:', message, code)
//   }
// }

// const connectButton = document.getElementById('connectBleButton')
// const disconnectButton = document.getElementById('disconnectBleButton')
// const onButton = document.getElementById('onButton')
// const offButton = document.getElementById('offButton')
// const retrievedValue = document.getElementById('valueContainer')
// const latestValueSent = document.getElementById('valueSent')
// const bleStateContainer = document.getElementById('bleState')
// const timestampContainer = document.getElementById('timestamp')

//Define BLE Device Specs
var deviceName = 'ESP32'
var bleService = '19b10000-e8f2-537e-4f6c-d104768a1214'
var ledCharacteristic = '19b10002-e8f2-537e-4f6c-d104768a1214'
var sensorCharacteristic = '19b10001-e8f2-537e-4f6c-d104768a1214'

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
  if (localStorage.AppName === 'hacker') {
    localStorage.removeItem('AppName')
    htmlClasses.remove('dark')
    localStorage.theme = 'light'
  } else {
    localStorage.AppName = 'hacker'
    htmlClasses.add('dark')
    localStorage.theme = 'dark'
  }
}

const ItemsBlock = ({ children }) => (
  <div className="flex flex-col items-stretch">{children}</div>
)

const Item = ({ title, Icon, subItems, children }) => {
  const itemRef = useRef()
  useEffect(() => {
    // let button = document.getElementById('button')

    itemRef.current.addEventListener('mousedown', (e) => {
      var rect = e.target.getBoundingClientRect()
      var x = e.clientX - rect.left //x position within the element.
      var y = e.clientY - rect.top

      // let x = e.x
      // let y = e.y
      // console.log('y :>> ', y)
      itemRef.current.style.setProperty('--mouse-x', x + 'px')
      itemRef.current.style.setProperty('--mouse-y', y + 'px')
    })
    return itemRef.current.removeEventListener('mousedown', () => 123)
  }, [])

  return (
    <div className="relative group first:rounded-t-3xl last:rounded-b-3xl bg-dark">
      <div
        ref={itemRef}
        id="button"
        className={cn(
          'button flex gap-x-3 px-4 pb-3 items-center group-first:rounded-t-3xl group-last:rounded-b-3xl'
        )}
      >
        {Icon && (
          <div className="pt-3 pointer-events-none">
            <Icon />
          </div>
        )}
        <div className="flex-1 pointer-events-none pt-3 gap-x-2 flex-col items-start group-first:border-none border-t border-[#3a3a3c]">
          <div className="text-left -mt-0.5">{title}</div>
          <div className="text-left text-secondary text-xs">
            {subItems.map((item, index) => (
              <div key={item} className="inline">
                <span>{item}</span>
                {index !== subItems.length - 1 && (
                  <span className="text-secondary mx-2">{`\u{2022}`}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pointer-events-none">{children}</div>
    </div>
  )
}

function App() {
  const [input, setInput] = useState('Escalion')
  const [state, setState] = useState('Устройство отключено')
  const [retrievedValue, setRetrievedValue] = useState('NaN')
  const [latestValueSent, setLatestValueSent] = useState('')
  const [timestampContainer, setTimestampContainer] = useState('')

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
    setRetrievedValue(newValueReceived)
    setTimestampContainer(getDateTime())
  }

  function writeOnCharacteristic(value) {
    if (bleServer && bleServer.connected) {
      bleServiceFound
        .getCharacteristic(ledCharacteristic)
        .then((characteristic) => {
          console.log('Found the LED characteristic: ', characteristic.uuid)
          // console.log('test :>> ', value.split(''))
          // const data = new Uint8Array(value.split(''))
          const data =
            typeof value === 'number'
              ? new Uint8Array([value])
              : Uint8Array.from(value.split('').map((x) => x.charCodeAt()))
          // console.log('data :>> ', data)
          return characteristic.writeValue(data)
        })
        .then(() => {
          setLatestValueSent(value)
          console.log('Value written to LEDcharacteristic:', value)
        })
        .catch((error) => {
          console.error('Error writing to the LED characteristic: ', error)
        })
    } else {
      console.error(
        'Bluetooth is not connected. Cannot write to characteristic.'
      )
      window.alert(
        'Bluetooth is not connected. Cannot write to characteristic. \n Connect to BLE first!'
      )
    }
  }

  function disconnectDevice() {
    console.log('Disconnect Device.')
    if (bleServer && bleServer.connected) {
      if (sensorCharacteristicFound) {
        sensorCharacteristicFound
          .stopNotifications()
          .then(() => {
            console.log('Notifications Stopped')
            return bleServer.disconnect()
          })
          .then(() => {
            console.log('Устройство отключено')
            setState('Устройство отключено')
          })
          .catch((error) => {
            console.log('An error occurred:', error)
          })
      } else {
        console.log('No characteristic found to disconnect.')
      }
    } else {
      // Throw an error if Bluetooth is not connected
      console.error('Bluetooth is not connected.')
      window.alert('Bluetooth is not connected.')
    }
  }

  // Connect to BLE Device and Enable Notifications
  function connectToDevice() {
    console.log('Initializing Bluetooth...')
    navigator.bluetooth
      .requestDevice({
        filters: [{ name: deviceName }],
        optionalServices: [bleService],
      })
      .then((device) => {
        console.log('Device Selected:', device.name)
        setState('Connected to device ' + device.name)
        // bleStateContainer.style.color = '#24af37'
        device.addEventListener('gattservicedisconnected', onDisconnected)
        return device.gatt.connect()
      })
      .then((gattServer) => {
        bleServer = gattServer
        console.log('Connected to GATT Server')
        return bleServer.getPrimaryService(bleService)
      })
      .then((service) => {
        bleServiceFound = service
        console.log('Service discovered:', service.uuid)
        return service.getCharacteristic(sensorCharacteristic)
      })
      .then((characteristic) => {
        console.log('Characteristic discovered:', characteristic.uuid)
        sensorCharacteristicFound = characteristic
        characteristic.addEventListener(
          'characteristicvaluechanged',
          handleCharacteristicChange
        )
        characteristic.startNotifications()
        console.log('Notifications Started.')
        return characteristic.readValue()
      })
      .then((value) => {
        console.log('Read value: ', value)
        const decodedValue = new TextDecoder().decode(value)
        console.log('Decoded value: ', decodedValue)
        setRetrievedValue(decodedValue)
      })
      .catch((error) => {
        console.log('Error: ', error)
      })
  }

  function onDisconnected(event) {
    console.log('Устройство отключено:', event.target.device.name)
    setState('Устройство отключено')

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

  return (
    <div className="select-none px-2 dark:text-white text-black bg-white dark:bg-black max-h-screen min-h-screen flex flex-col gap-x-2 gap-y-4 overflow-y-scroll">
      <div
        className="bg-white dark:bg-black z-10 pl-5 pr-4 sticky top-0 font-bold pt-3 pb-2 flex justify-between items-center"
        onClick={toggleTheme}
      >
        <div className="text-lg">Настройки</div>
        <SearchIcon />
      </div>
      <ItemsBlock>
        <Item title="Алексей Белинский" subItems={['Samsung account']}>
          <div className="absolute right-5 -top-3 p-[1px] rounded-full border border-[#2c2d2f] h-[68px] w-[68px]">
            <img
              className="rounded-full h-full w-full"
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
        />
        <Item
          title="Подключенные устройства"
          Icon={ConnectedDevicesIcon}
          subItems={['Быстрая отправка', 'Samsung DeX', 'Android Auto']}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Режимы и сценарии"
          Icon={ScenariosIcon}
          subItems={['Режимы', 'Сценарии']}
        />
        <Item
          title="Звуки и вибрация"
          Icon={SoundIcon}
          subItems={['Режим звука', 'Мелодия звонка']}
        />
        <Item
          title="Уведомления"
          Icon={NotificationsIcon}
          subItems={['Строка состояния', 'Не беспокоить']}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Дисплей"
          Icon={DisplayIcon}
          subItems={['Яркость', 'Комфорт для глаз', 'Навигационная панель']}
        />
        <Item
          title="Батарея"
          Icon={BateryIcon}
          subItems={['Энергосбережение', 'Зарядка']}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Обои и стиль"
          Icon={WallpappersIcon}
          subItems={['Обои', 'Палитра цветов']}
        />
        <Item
          title="Темы"
          Icon={ThemesIcon}
          subItems={['Темы', 'Обои', 'Значки']}
        />
        <Item
          title="Экран блокировки"
          Icon={BlockScreenIcon}
          subItems={['Тип блокировки экрана', 'Always On Display']}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Безопасность и конфиденциальность"
          Icon={ShildIcon}
          subItems={['Биометрические данные', 'Диспетчер разрешений']}
        />
        <Item
          title="Локация"
          Icon={LocationIcon}
          subItems={['Запросы на доступ к местоположению']}
        />
        <Item
          title="Экстренные ситуации"
          Icon={ExtraIcon}
          subItems={['Медицинские сведения', 'Экстренные оповещения']}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Учетные записи и архивация"
          Icon={WallpappersIcon}
          subItems={['Управление учетными записями', 'Smart Switch']}
        />
        <Item title="Google" Icon={ThemesIcon} subItems={['Службы Google']} />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Дополнительные функции"
          Icon={WallpappersIcon}
          subItems={['Labs', 'S Pen', 'Боковая кнопка']}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Использование устройства и родительский контроль"
          Icon={WallpappersIcon}
          subItems={['Время использования экрана', 'Таймеры приложений']}
        />
        <Item
          title="Обслуживание устройства"
          Icon={ThemesIcon}
          subItems={['Хранилище', 'Память', 'Защита приложений']}
        />
        <Item
          title="Приложения"
          Icon={BlockScreenIcon}
          subItems={['Приложения по умолчанию', 'Настройки приложений']}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Общие настройки"
          Icon={WallpappersIcon}
          subItems={['Язык и клавиатура', 'Дата и время']}
        />
        <Item
          title="Специальные возможности"
          Icon={ThemesIcon}
          subItems={['Отображение', 'Слышимость', 'Подвижность']}
        />
      </ItemsBlock>
      <ItemsBlock>
        <Item
          title="Обновление ПО"
          Icon={WallpappersIcon}
          subItems={['Загрузка и установка']}
        />
        <Item
          title="Советы и руководство пользователя"
          Icon={ThemesIcon}
          subItems={['Полезные советы', 'Новые функции']}
        />
        <Item
          title="Сведения о телефоне"
          Icon={WallpappersIcon}
          subItems={['Состояние', 'Юридическая информация', 'Имя телефона']}
        />
        <Item
          title="Параметры разработчика"
          Icon={WallpappersIcon}
          subItems={['Параметры разработчика']}
        />
      </ItemsBlock>
    </div>
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
