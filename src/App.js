import logo from './logo.svg'
import './App.css'
// import * as Bluetooth from 'react-bluetooth'
import { useEffect, useState } from 'react'

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

function App() {
  const [input, setInput] = useState('Escalion')
  const [state, setState] = useState('Устройство отключено')
  const [retrievedValue, setRetrievedValue] = useState('NaN')
  const [latestValueSent, setLatestValueSent] = useState('')
  const [timestampContainer, setTimestampContainer] = useState('')
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
    <div className="App">
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
      {/* <p>
        <a href="https://randomnerdtutorials.com/">
          Created by RandomNerdTutorials.com
        </a>
      </p>
      <p>
        <a href="https://RandomNerdTutorials.com/esp32-web-bluetooth/">
          Read the full project here.
        </a>
      </p> */}
    </div>
  )
}

export default App
