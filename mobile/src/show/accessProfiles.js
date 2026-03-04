export const ACCESS_PROFILES = {
  escalion: {
    name: 'Алексей Белинский',
    hasConnections: true,
  },
  denjoker: {
    name: 'Денис Паршиков',
    hasConnections: true,
  },
  enkD83Js: {
    name: 'Владислав',
    hasConnections: false,
  },
  fertVlad: {
    name: 'Владимир Ферт',
    hasConnections: false,
  },
  fertvlad: {
    name: 'Владимир Ферт',
    hasConnections: false,
  },
  mihRogin: {
    name: 'Михаил Рожин',
    hasConnections: false,
  },
  ShmidtVL: {
    name: 'Владимир Шмидт',
    hasConnections: true,
  },
};

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'JOKER'];
export const MASTS = ['S', 'H', 'C', 'D'];

export function resolveProfile(accessCode) {
  if (!accessCode) return null;
  return ACCESS_PROFILES[accessCode] || ACCESS_PROFILES[String(accessCode).trim()] || ACCESS_PROFILES[String(accessCode).trim().toLowerCase()] || null;
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
