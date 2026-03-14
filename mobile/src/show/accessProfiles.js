export const ACCESS_PROFILES = {
  escalion: {
    name: 'Алексей Белинский',
    hasConnections: true,
    phoneModel: 'samsungOneUi8',
  },
  denjoker: {
    name: 'Денис Паршиков',
    hasConnections: true,
    phoneModel: 'samsungOneUi8',
  },
  enkD83Js: {
    name: 'Владислав',
    hasConnections: false,
    phoneModel: 'onePlus',
  },
  fertVlad: {
    name: 'Владимир Ферт',
    hasConnections: false,
    phoneModel: 'onePlus',
  },
  fertvlad: {
    name: 'Владимир Ферт',
    hasConnections: false,
    phoneModel: 'onePlus',
  },
  mihRogin: {
    name: 'Михаил Рожин',
    hasConnections: false,
    phoneModel: 'onePlus',
  },
  ShmidtVL: {
    name: 'Владимир Шмидт',
    hasConnections: true,
    phoneModel: 'samsungOneUi8',
  },
};

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'JOKER'];
export const MASTS = ['S', 'H', 'C', 'D'];

export function resolveProfile(accessCode) {
  if (!accessCode) return null;
  return ACCESS_PROFILES[accessCode] || ACCESS_PROFILES[String(accessCode).trim()] || ACCESS_PROFILES[String(accessCode).trim().toLowerCase()] || null;
}

export function resolvePhoneModelByAccessCode(accessCode) {
  return resolveProfile(accessCode)?.phoneModel || '';
}

const TEMPLATE_ID_TO_PHONE_MODEL = {
  escalion: 'samsungOneUi8',
  oneui: 'samsungOneUi8',
  oneui8: 'samsungOneUi8',
  samsungoneui8: 'samsungOneUi8',
  fertvlad: 'onePlus',
  fertVlad: 'onePlus',
  oneplus: 'onePlus',
  one_plus: 'onePlus',
  huawei: 'huawei',
  huaweiemui: 'huawei',
  emui: 'huawei',
};

export function resolvePhoneModelByTemplateId(templateId) {
  if (!templateId) return '';
  const key = String(templateId).trim();
  return (
    TEMPLATE_ID_TO_PHONE_MODEL[key] ||
    TEMPLATE_ID_TO_PHONE_MODEL[key.toLowerCase()] ||
    ''
  );
}

export function buildCardCode(rankIndex, mastIndex) {
  const safeRank = Number.isFinite(rankIndex) ? Math.max(0, Math.min(RANKS.length - 1, rankIndex)) : 0;
  const safeMast = Number.isFinite(mastIndex) ? Math.max(0, Math.min(MASTS.length - 1, mastIndex)) : 0;
  const rank = RANKS[safeRank];
  if (rank === 'JOKER') {
    return rank;
  }
  return `${rank}${MASTS[safeMast]}`;
}
