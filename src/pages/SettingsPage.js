import { useState } from 'react'
import Switch from '../components/Switch'
import Button from '../components/Button'
import PageWrapper from './PageWrapper'
import cn from 'classnames'

const SettingsPage = ({
  size,
  toggleTheme,
  setPage,
  connectToDevice,
  disconnectDevice,
  isConnected,
  showLogs,
  setShowLogs,
}) => {
  const [mode, setMode] = useState(localStorage.mode || 'word')
  const [learn, setLearn] = useState(localStorage.learn)
  const [theme, setTheme] = useState(localStorage.theme || 'light')
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
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center text-sm gap-x-1">
          <div>Текущий статус устройства:</div>
          <div
            className={cn(
              'text-sm',
              isConnected ? 'text-[#25b35d]' : 'text-[#f00]'
            )}
            id="text-[#25b35d]"
          >
            {isConnected ? 'Подключено' : 'Отключено'}
          </div>
        </div>
        <div className="flex items-center text-sm gap-x-1">
          <Button onClick={isConnected ? disconnectDevice : connectToDevice}>
            {isConnected ? 'Отключить' : 'Подключить'} устройство
          </Button>
        </div>
      </div>
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
          <option value="word">Слово</option>
          <option value="card">Карта</option>
        </select>
      </div>
      {mode === 'word' && (
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
      <Switch
        id="logs"
        label="Показывать логи"
        checked={showLogs}
        onChange={setShowLogs((state) => !state)}
      />
      <Button onClick={() => setPage('firstStartPage')}>
        Сменить учетную запись
        <br />
        (ввести другой код доступа)
      </Button>
    </PageWrapper>
  )
}

export default SettingsPage
