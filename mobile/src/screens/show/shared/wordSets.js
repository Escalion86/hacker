export const MAX_WORD_SET_WORDS = 16

function asTrimmedString(value) {
  return String(value || '').trim()
}

function normalizeWords(rawWords) {
  if (!Array.isArray(rawWords)) return []
  const seen = []
  for (let i = 0; i < rawWords.length; i += 1) {
    const next = asTrimmedString(rawWords[i])
    if (!next) continue
    seen.push(next)
    if (seen.length >= MAX_WORD_SET_WORDS) break
  }
  return seen
}

function normalizeSet(rawSet, fallbackIndex) {
  const id = asTrimmedString(rawSet?.id) || `set_${fallbackIndex + 1}`
  const words = normalizeWords(rawSet?.words)
  const name = asTrimmedString(rawSet?.name) || `List ${fallbackIndex + 1}`
  return { id, name, words }
}

export function normalizeWordSets(rawSets) {
  if (!Array.isArray(rawSets)) return []
  const unique = new Set()
  const normalized = []
  for (let i = 0; i < rawSets.length; i += 1) {
    const next = normalizeSet(rawSets[i], normalized.length)
    if (unique.has(next.id)) continue
    unique.add(next.id)
    normalized.push(next)
  }
  return normalized
}

export function getWordSetWords(wordSet) {
  return normalizeWords(wordSet?.words)
}

export function resolveActiveWordSet(settings) {
  const sets = normalizeWordSets(settings?.wordSets)
  if (sets.length === 0) return null
  const selectedId = asTrimmedString(settings?.selectedWordSetId)
  const selected =
    sets.find((item) => item.id === selectedId) ||
    sets[0]
  return selected || null
}

export function resolveActiveWordSetWords(settings) {
  return getWordSetWords(resolveActiveWordSet(settings))
}

export function resolveWordFromActiveSet(settings, rawIndex) {
  const words = resolveActiveWordSetWords(settings)
  if (words.length === 0) {
    return {
      words,
      selectedIndex: 0,
      word: '',
    }
  }

  const parsedIndex = Number(rawIndex)
  const safeIndex = Number.isFinite(parsedIndex)
    ? Math.max(0, Math.min(words.length - 1, Math.floor(parsedIndex)))
    : 0

  return {
    words,
    selectedIndex: safeIndex,
    word: words[safeIndex] || '',
  }
}

export function buildWordSetLearnLabels(words, baseIndex, count) {
  const out = []
  const safeCount = Math.max(0, Math.floor(Number(count) || 0))
  for (let i = 0; i < safeCount; i += 1) {
    const next = asTrimmedString(words?.[baseIndex + i])
    out.push(next || '...')
  }
  return out
}
