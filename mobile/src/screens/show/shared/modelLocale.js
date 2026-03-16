const DEFAULT_MODEL_LOCALES = {
  samsungOneUi8: 'en',
  onePlus: 'en',
  huawei: 'en',
}

export const SHOW_LOCALE_OPTIONS = ['ru', 'de', 'en']

function normalizeLocale(locale) {
  return String(locale || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
}

export function resolveModelLocale(settings, modelId, fallback = 'en') {
  const explicitLocale = normalizeLocale(
    settings?.showLocale || settings?.showLanguage || settings?.uiLocale,
  )
  if (explicitLocale) return explicitLocale
  return DEFAULT_MODEL_LOCALES[modelId] || fallback
}

export function pickLocalizedCopy(copyMap, locale, fallback = 'en') {
  const normalized = normalizeLocale(locale)
  if (!normalized) return copyMap[fallback] || {}

  if (copyMap[normalized]) return copyMap[normalized]

  const baseLocale = normalized.split('-')[0]
  if (copyMap[baseLocale]) return copyMap[baseLocale]

  return copyMap[fallback] || {}
}
