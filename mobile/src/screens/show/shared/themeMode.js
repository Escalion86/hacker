export function resolveShowTheme(settings, phoneModel) {
  const mode = String(settings?.uiThemeMode || 'model').trim().toLowerCase()
  if (mode === 'light') return 'light'
  if (mode === 'dark') return 'dark'
  return phoneModel === 'huawei' ? 'light' : 'dark'
}

export function isShowThemeLight(settings, phoneModel) {
  return resolveShowTheme(settings, phoneModel) === 'light'
}
