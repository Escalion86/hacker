const commonWifiRows = [
  { title: 'Wi-Fi', subtitle: 'Включено', toggleHack: true, icon: 'wifi', iconColor: '#2b8cff', highlight: true },
  { title: 'Помощник по Wi-Fi', icon: 'magic' },
];

const commonSavedRows = [
  { title: 'DIREZABLe' },
  { title: 'DIREZABLe-5G' },
];

export const SHOW_TEMPLATES = {
  onePlus: {
    generalTitle: 'Настройки',
    ui: {
      titleSize: 34,
      headerGap: 3,
      search: true,
      blockRadius: 14,
      rowMinHeight: 54,
      rowPaddingY: 8,
      rowTitleSize: 14,
      rowSubtitleSize: 11,
      blockSpacing: 8,
      pageBg: '#0f1117',
      cardBg: '#171a22',
      rowHighlightBg: '#1b2130',
      searchBg: '#141925',
    },
    pages: {
      general: {
        hint: 'Свайп по "Wi-Fi" меняет масть. Тапы по следующим строкам задают номинал.',
        sections: [
          {
            rows: [{ title: 'Magfert', subtitle: 'Enjoy exclusive benefits and services designed for you!', icon: 'account', iconColor: '#9aa6c0' }],
          },
          {
            rows: [
              { title: 'Wi-Fi', subtitle: 'Открыть Wi-Fi', nav: 'wifi', mastSelector: true, segmented: true, icon: 'wifi', iconColor: '#2b8cff' },
              { title: 'Мобильная сеть', suitBase: 0, segmented: true, icon: 'sim', iconColor: '#17a58a' },
              { title: 'Bluetooth', suitBase: 4, segmented: true, icon: 'bluetooth', iconColor: '#3b86ff' },
              { title: 'Подключение и общий доступ', suitBase: 8, segmented: true, icon: 'share', iconColor: '#6e7a91' },
            ],
          },
          {
            rows: [
              { title: 'Обои и стили', suitBase: 12, segmented: true, icon: 'palette', iconColor: '#8a7cff' },
              { title: 'Главный экран и экран блокировки', icon: 'home', iconColor: '#5b6b7c' },
              { title: 'Экран и Яркость', icon: 'brightness', iconColor: '#ea9d34' },
              { title: 'Звуки и вибрация', icon: 'sound', iconColor: '#f1605a' },
              { title: 'Уведомления и строка состояния', icon: 'notifications', iconColor: '#6e7a91' },
            ],
          },
        ],
      },
      wifi: {
        title: 'Wi-Fi',
        hint: 'Откройте Control и нажмите Старт для трансляции выбранной карты.',
        sections: [
          { rows: commonWifiRows },
          { title: 'Сохраненные сети', rows: commonSavedRows },
        ],
      },
    },
  },
  samsungOneUi8: {
    generalTitle: 'Настройки',
    ui: {
      titleSize: 36,
      headerGap: 5,
      search: true,
      blockRadius: 20,
      rowMinHeight: 62,
      rowPaddingY: 10,
      rowTitleSize: 17,
      rowSubtitleSize: 13,
      blockSpacing: 10,
      pageBg: '#0b0c11',
      cardBg: '#161922',
      rowHighlightBg: '#20283a',
      searchBg: '#1a2231',
    },
    pages: {
      general: {
        hint: 'Свайп по "Подключения" меняет масть. Тапы по выделенным строкам меняют номинал.',
        sections: [
          { rows: [{ title: 'Алексей Белинский', subtitle: 'Samsung account', icon: 'A', iconColor: '#8a9db8' }] },
          {
            rows: [
              { title: 'Подключения', subtitle: 'Wi-Fi, Bluetooth, Диспетчер SIM-карт', nav: 'connections', mastSelector: true, segmented: true, icon: 'connections', iconColor: '#2b8cff' },
              { title: 'Подключенные устройства', subtitle: 'Быстрая отправка, Samsung DeX', suitBase: 0, segmented: true, icon: 'devices', iconColor: '#1ca278' },
            ],
          },
          {
            rows: [
              { title: 'Режимы и сценарии', suitBase: 4, segmented: true, icon: 'modes', iconColor: '#6f56d8' },
              { title: 'Звуки и вибрация', suitBase: 8, segmented: true, icon: 'sound', iconColor: '#f1605a' },
              { title: 'Уведомления', suitBase: 12, segmented: true, icon: 'notifications', iconColor: '#6b7280' },
            ],
          },
        ],
      },
      connections: {
        title: 'Подключения',
        hint: 'Перейдите в Wi-Fi для финального шага.',
        sections: [
          {
            rows: [
              { title: 'Wi-Fi', nav: 'wifi', icon: 'wifi', iconColor: '#2b8cff' },
              { title: 'Вызовы по Wi-Fi', icon: 'call' },
              { title: 'Bluetooth', icon: 'bluetooth' },
              { title: 'NFC и бесконтактные платежи', icon: 'nfc' },
              { title: 'Сверхширокая полоса (UWB)', icon: 'radar' },
            ],
          },
        ],
      },
      wifi: {
        title: 'Wi-Fi',
        hint: 'Включите трансляцию на Control, затем вернитесь сюда для показа.',
        sections: [
          { rows: [{ title: 'Включено', toggleHack: true, icon: 'wifi', iconColor: '#2b8cff', highlight: true }] },
          { title: 'Доступные сети', rows: [] },
        ],
      },
    },
  },
  denjoker: {
    extends: 'samsungOneUi8',
  },
  ShmidtVL: {
    extends: 'samsungOneUi8',
  },
  enkD83Js: {
    extends: 'onePlus',
  },
  mihRogin: {
    extends: 'onePlus',
  },
  huawei: {
    extends: 'onePlus',
  },
};

function resolveExtendedTemplate(key) {
  const base = SHOW_TEMPLATES[key];
  if (!base) return null;
  if (!base.extends) return base;
  const parent = SHOW_TEMPLATES[base.extends];
  if (!parent) return null;
  return { ...parent, ...base, pages: parent.pages, ui: parent.ui };
}

export function resolveTemplate(accessCode) {
  if (!accessCode) return null;
  const key = String(accessCode).trim();
  const lowered = key.toLowerCase();
  if (SHOW_TEMPLATES[key]) return resolveExtendedTemplate(key);
  if (SHOW_TEMPLATES[lowered]) return resolveExtendedTemplate(lowered);

  // Backward compatibility with old user-driven keys.
  if (lowered === 'escalion' || lowered === 'denjoker' || lowered === 'shmidtvl') {
    return resolveExtendedTemplate('samsungOneUi8');
  }
  if (lowered === 'fertvlad' || lowered === 'enkd83js' || lowered === 'mihrogin') {
    return resolveExtendedTemplate('onePlus');
  }
  if (lowered === 'huawei' || lowered === 'huaweiemui' || lowered === 'emui') {
    return resolveExtendedTemplate('huawei');
  }
  return null;
}
