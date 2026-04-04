;(() => {
  const selectEl = document.getElementById('firmware-version')
  const noteEl = document.getElementById('firmware-note')
  const installButtonEl = document.getElementById('install-button')
  const fallbackManifest = 'manifest.json'

  const setManifest = (manifestUrl) => {
    installButtonEl.setAttribute('manifest', manifestUrl || fallbackManifest)
  }

  const fillSelect = ({ versions, defaultVersion }) => {
    if (!Array.isArray(versions) || !versions.length) {
      selectEl.innerHTML = '<option>Нет доступных прошивок</option>'
      selectEl.disabled = true
      noteEl.textContent = 'В папке /firmware не найдено корректных версий.'
      setManifest(fallbackManifest)
      return
    }

    const optionsHtml = versions
      .map(
        (item) =>
          `<option value="${item.manifestUrl}" data-version="${item.id}">${item.label}</option>`,
      )
      .join('')
    selectEl.innerHTML = optionsHtml
    selectEl.disabled = false

    const selected =
      versions.find((item) => item.id === defaultVersion) ?? versions[0]
    if (selected) {
      selectEl.value = selected.manifestUrl
      setManifest(selected.manifestUrl)
      noteEl.textContent = `Выбрана версия: ${selected.label}`
    }
  }

  selectEl.addEventListener('change', () => {
    const selectedOption = selectEl.options[selectEl.selectedIndex]
    setManifest(selectEl.value)
    noteEl.textContent = `Выбрана версия: ${selectedOption.text}`
  })

  fetch('/api/firmware-manifests')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    })
    .then(fillSelect)
    .catch(() => {
      selectEl.innerHTML = '<option>Стандартная версия</option>'
      selectEl.disabled = true
      noteEl.textContent =
        'Список версий недоступен, используется стандартный manifest.json.'
      setManifest(fallbackManifest)
    })
})()

// ESP Web Tools не предоставляет публичный i18n API для install-диалога.
// Делаем мягкую локализацию текста в shadow DOM после открытия окна.
;(() => {
  const exactMap = new Map([
    ['Close', 'Закрыть'],
    ['Back', 'Назад'],
    ['Skip', 'Пропустить'],
    ['Connect', 'Подключить'],
    ['Connect to Wi-Fi', 'Подключить к Wi-Fi'],
    ['Change Wi-Fi', 'Изменить Wi-Fi'],
    ['Configure Wi-Fi', 'Настроить Wi-Fi'],
    ['Logs & Console', 'Логи и консоль'],
    ['Visit Device', 'Открыть устройство'],
    ['Add to Home Assistant', 'Добавить в Home Assistant'],
    ['Erase device', 'Стереть устройство'],
    ['Erase User Data', 'Стереть пользовательские данные'],
    ['Confirm Installation', 'Подтверждение установки'],
    ['Preparing installation', 'Подготовка установки'],
    ['Installing', 'Установка'],
    ['Installation failed', 'Ошибка установки'],
    ['Installation complete!', 'Установка завершена!'],
    ['Writing complete', 'Запись завершена'],
    ['All done!', 'Готово!'],
    ['Connecting', 'Подключение'],
    ['Download Logs', 'Скачать логи'],
    ['Terminal disconnected', 'Терминал отключен'],
    ['Device erased', 'Устройство очищено'],
    ['Erasing device...', 'Очистка устройства...'],
    ['Unable to connect', 'Не удалось подключиться'],
    ['Timeout', 'Таймаут'],
  ])

  const replaceRules = [
    [/^Install (.+)$/u, 'Установить $1'],
    [/^Update (.+)$/u, 'Обновить $1'],
    [/^Writing progress:\s*(\d+)%$/u, 'Запись: $1%'],
    [/^Initialized\. Found (.+)$/u, 'Инициализация завершена. Найдено: $1'],
    [/^Your (.+) board is not supported\.$/u, 'Плата $1 не поддерживается.'],
    [/^Downlading firmware (.+) failed: (\d+)$/u, 'Ошибка загрузки прошивки $1: $2'],
    [
      /^Failed to initialize\. Try resetting your device or holding the BOOT button while clicking INSTALL\.$/u,
      'Не удалось инициализировать. Перезагрузите устройство или удерживайте BOOT при нажатии Установить.',
    ],
    [
      /^Serial port is not readable\/writable\. Close any other application using it and try again\.$/u,
      'Последовательный порт недоступен. Закройте другие приложения, использующие порт, и повторите попытку.',
    ],
    [/^Connect your device to the network to start using it\.$/u, 'Подключите устройство к сети, чтобы начать работу.'],
  ]

  const normalize = (text) => text.replace(/\s+/g, ' ').trim()

  const localizeText = (raw) => {
    const key = normalize(raw)
    if (!key) return raw

    if (exactMap.has(key)) {
      return raw.replace(key, exactMap.get(key))
    }

    for (const [pattern, replacement] of replaceRules) {
      if (pattern.test(key)) {
        return raw.replace(key, key.replace(pattern, replacement))
      }
    }

    return raw
  }

  const translateRoot = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) {
      const next = walker.nextNode()
      const localized = localizeText(node.nodeValue || '')
      if (localized !== node.nodeValue) {
        node.nodeValue = localized
      }
      node = next
    }
  }

  const setupDialogLocalization = (dialog) => {
    if (!dialog || dialog.__ruLocalized) return
    dialog.__ruLocalized = true

    const tryAttach = () => {
      if (!dialog.shadowRoot) return false
      translateRoot(dialog.shadowRoot)
      const observer = new MutationObserver(() => {
        translateRoot(dialog.shadowRoot)
      })
      observer.observe(dialog.shadowRoot, {
        childList: true,
        subtree: true,
        characterData: true,
      })
      dialog.addEventListener(
        'closed',
        () => {
          observer.disconnect()
        },
        { once: true },
      )
      return true
    }

    if (!tryAttach()) {
      const delayed = setInterval(() => {
        if (tryAttach()) {
          clearInterval(delayed)
        }
      }, 50)
      setTimeout(() => clearInterval(delayed), 4000)
    }
  }

  const bodyObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue
        if (node.tagName === 'EWT-INSTALL-DIALOG') {
          setupDialogLocalization(node)
        }
        const nested = node.querySelector?.('ewt-install-dialog')
        if (nested) setupDialogLocalization(nested)
      }
    }
  })

  bodyObserver.observe(document.body, { childList: true, subtree: true })
})()
