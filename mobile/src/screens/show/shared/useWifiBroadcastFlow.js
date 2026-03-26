import React from 'react'
import bleService from '../../../services/ble/bleService'
import { resolveWordFromActiveSet } from './wordSets'

const MAX_ANIMATED_SPOTS = 12
const NOISE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*+-?'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function randomNoise() {
  const size = Math.max(5, Math.min(8, 5 + Math.floor(Math.random() * 4)))
  let out = ''
  for (let i = 0; i < size; i += 1) {
    out += NOISE_CHARS.charAt(Math.floor(Math.random() * NOISE_CHARS.length))
  }
  return out
}

export function randomLevel() {
  return 1 + Math.floor(Math.random() * 4)
}

const SUIT_CHAR_TO_SYMBOL = {
  S: '♠',
  H: '♥',
  C: '♣',
  D: '♦',
  '♠': '♠',
  '♥': '♥',
  '♣': '♣',
  '♦': '♦',
}

export function toSuitSymbolCode(rawCode) {
  const text = String(rawCode || '').trim()
  const match = text.match(/^(A|[2-9]|10|J|Q|K)([SHCD♠♥♣♦])$/)
  if (!match) return text
  const suitSymbol = SUIT_CHAR_TO_SYMBOL[match[2]]
  if (!suitSymbol) return text
  return `${match[1]}${suitSymbol}`
}

export function buildWordTarget(baseWord, dotEnabled) {
  const base = String(baseWord || '').trim() || 'Hacked'
  return {
    withDot: dotEnabled ? `.${base}` : base,
    withoutDot: base,
  }
}

export function useWifiBroadcastFlow({
  settings,
  cardCode,
  wifiSpots,
  wifiEnabled,
  onWifiEnabledChange,
}) {
  const mode = settings.mode
  const wifiWord = settings.wifi
  const dotEnabled = Boolean(settings.dot)
  const minutesBeforeStop = settings.minutesBeforeStop
  const startDelaySec = Math.max(0, toNumber(settings.delay, 0))
  const startOnSetWiFiPage = Boolean(settings.startOnSetWiFiPage)
  const secondWordEnabled = Boolean(settings.secondWordEnabled)
  const secondWord = String(settings.secondWord || '')
  const secondWordTrigger = settings.secondWordTrigger
  const secondWordDelaySec = Math.max(0, toNumber(settings.secondWordDelaySec, 0))

  const mountedRef = React.useRef(true)
  const startTimeoutRef = React.useRef(null)
  const secondSwitchTimeoutRef = React.useRef(null)
  const animationIntervalRef = React.useRef(null)
  const flowIdRef = React.useRef(0)
  const firstAnimationDoneRef = React.useRef(false)
  const secondSwitchDoneRef = React.useRef(false)
  const autoStartAppliedRef = React.useRef(false)

  const [waitingStart, setWaitingStart] = React.useState(false)
  const [running, setRunning] = React.useState(false)
  const [animatedSpots, setAnimatedSpots] = React.useState([])

  const clearStartTimeout = React.useCallback(() => {
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current)
      startTimeoutRef.current = null
    }
  }, [])

  const clearSecondSwitchTimeout = React.useCallback(() => {
    if (secondSwitchTimeoutRef.current) {
      clearTimeout(secondSwitchTimeoutRef.current)
      secondSwitchTimeoutRef.current = null
    }
  }, [])

  const clearAnimation = React.useCallback(() => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current)
      animationIntervalRef.current = null
    }
  }, [])

  React.useEffect(() => {
    return () => {
      mountedRef.current = false
      clearStartTimeout()
      clearSecondSwitchTimeout()
      clearAnimation()
    }
  }, [clearAnimation, clearSecondSwitchTimeout, clearStartTimeout])

  const hasSecondWordFlow = Boolean(
    secondWordEnabled && secondWord.trim(),
  )

  const primaryTarget = React.useMemo(() => {
    const wordSetState = resolveWordFromActiveSet(
      settings,
      settings.wordSetWordIndex,
    )
    const base =
      mode === 'card'
        ? toSuitSymbolCode(cardCode)
        : mode === 'wordSet'
          ? wordSetState.word || wifiWord || 'Hacked'
        : wifiWord || 'Hacked'
    return buildWordTarget(base, dotEnabled)
  }, [mode, settings, cardCode, wifiWord, dotEnabled])

  const startWifiAnimation = React.useCallback(
    (targetSsid, onComplete, options = {}) => {
      clearAnimation()
      let ticks = 0
      const rawFixedCount = Number(options.fixedCount)
      const hasFixedCount = Number.isFinite(rawFixedCount) && rawFixedCount > 0
      const fixedCount = hasFixedCount
        ? Math.max(1, Math.min(MAX_ANIMATED_SPOTS, Math.floor(rawFixedCount)))
        : 0
      const targetCount = hasFixedCount ? fixedCount : MAX_ANIMATED_SPOTS

      if (hasFixedCount) {
        setAnimatedSpots(
          Array.from({ length: fixedCount }, (_, index) => ({
            stage: 0,
            settleAt: 4 + index,
            level: randomLevel(),
            text: randomNoise(),
          })),
        )
      } else {
        setAnimatedSpots([])
      }

      animationIntervalRef.current = setInterval(() => {
        ticks += 1
        setAnimatedSpots((prev) => {
          const next = [...prev]
          if (!hasFixedCount && next.length < MAX_ANIMATED_SPOTS) {
            next.push({
              stage: 0,
              settleAt: 4 + next.length,
              level: randomLevel(),
              text: randomNoise(),
            })
          }

          for (let i = 0; i < next.length; i += 1) {
            const row = next[i]
            const nextStage = row.stage + 1
            const settled = nextStage >= row.settleAt
            next[i] = {
              ...row,
              stage: nextStage,
              text: settled ? targetSsid : randomNoise(),
            }
          }

          return next
        })

        if (ticks >= 34) {
          clearAnimation()
          setAnimatedSpots(
            Array.from({ length: targetCount }, () => ({
              stage: 999,
              settleAt: 0,
              level: randomLevel(),
              text: targetSsid,
            })),
          )
          if (onComplete) onComplete()
        }
      }, 190)
    },
    [clearAnimation],
  )

  const runSecondStart = React.useCallback(
    async (flowId) => {
      if (!hasSecondWordFlow) return
      const secondTarget = buildWordTarget(secondWord, dotEnabled)
      const existingCount =
        animatedSpots.length > 0
          ? animatedSpots.length
          : wifiSpots.filter((spot) => spot && spot.trim() !== '').length

      try {
        await bleService.sendStart({
          ssid: secondTarget.withoutDot,
          dot: dotEnabled,
          minutes: minutesBeforeStop,
        })
        if (flowId !== flowIdRef.current || !mountedRef.current) return

        secondSwitchDoneRef.current = true
        startWifiAnimation(secondTarget.withDot, null, { fixedCount: existingCount })
      } catch {}
    },
    [
      animatedSpots.length,
      hasSecondWordFlow,
      secondWord,
      dotEnabled,
      minutesBeforeStop,
      startWifiAnimation,
      wifiSpots,
    ],
  )

  const scheduleSecondSwitch = React.useCallback(
    (flowId) => {
      if (!hasSecondWordFlow || secondWordTrigger !== 'afterDelay') return

      clearSecondSwitchTimeout()
      secondSwitchTimeoutRef.current = setTimeout(() => {
        secondSwitchTimeoutRef.current = null
        if (flowId !== flowIdRef.current || !mountedRef.current) return
        runSecondStart(flowId)
      }, secondWordDelaySec * 1000)
    },
    [
      clearSecondSwitchTimeout,
      hasSecondWordFlow,
      runSecondStart,
      secondWordDelaySec,
      secondWordTrigger,
    ],
  )

  const runStart = React.useCallback(
    async (flowId) => {
      const target = primaryTarget
      try {
        if (!bleService.isConnected()) {
          await bleService.connect()
        }
        if (flowId !== flowIdRef.current || !mountedRef.current) return

        await bleService.sendStart({
          ssid: target.withoutDot,
          dot: dotEnabled,
          minutes: minutesBeforeStop,
        })
        if (flowId !== flowIdRef.current || !mountedRef.current) return

        setRunning(true)
        setWaitingStart(false)
        firstAnimationDoneRef.current = false
        startWifiAnimation(target.withDot, () => {
          firstAnimationDoneRef.current = true
          scheduleSecondSwitch(flowId)
        })
      } catch {
        if (flowId !== flowIdRef.current || !mountedRef.current) return
        setRunning(false)
        setWaitingStart(false)
        onWifiEnabledChange(false)
      }
    },
    [
      primaryTarget,
      dotEnabled,
      minutesBeforeStop,
      startWifiAnimation,
      scheduleSecondSwitch,
      onWifiEnabledChange,
    ],
  )

  const triggerStartFlow = React.useCallback(() => {
    const flowId = flowIdRef.current + 1
    flowIdRef.current = flowId
    clearStartTimeout()
    clearSecondSwitchTimeout()
    firstAnimationDoneRef.current = false
    secondSwitchDoneRef.current = false
    setWaitingStart(true)

    if (startDelaySec <= 0) {
      runStart(flowId)
      return
    }

    startTimeoutRef.current = setTimeout(() => {
      runStart(flowId)
    }, startDelaySec * 1000)
  }, [clearStartTimeout, clearSecondSwitchTimeout, runStart, startDelaySec])

  const handleDisable = React.useCallback(async () => {
    flowIdRef.current += 1
    clearStartTimeout()
    clearSecondSwitchTimeout()
    clearAnimation()
    firstAnimationDoneRef.current = false
    secondSwitchDoneRef.current = false
    setWaitingStart(false)
    setRunning(false)
    setAnimatedSpots([])
    try {
      await bleService.sendStop()
    } catch {}
  }, [clearAnimation, clearSecondSwitchTimeout, clearStartTimeout])

  React.useEffect(() => {
    if (startOnSetWiFiPage) {
      if (autoStartAppliedRef.current) return
      autoStartAppliedRef.current = true
      onWifiEnabledChange(true)
      triggerStartFlow()
      return
    }

    autoStartAppliedRef.current = false
    onWifiEnabledChange(false)
    clearStartTimeout()
    clearSecondSwitchTimeout()
    clearAnimation()
    firstAnimationDoneRef.current = false
    secondSwitchDoneRef.current = false
    setWaitingStart(false)
    setRunning(false)
    setAnimatedSpots([])
  }, [
    startOnSetWiFiPage,
    triggerStartFlow,
    clearStartTimeout,
    clearSecondSwitchTimeout,
    clearAnimation,
    onWifiEnabledChange,
  ])

  const onSwitchPress = React.useCallback(async () => {
    if (wifiEnabled) {
      onWifiEnabledChange(false)
      await handleDisable()
      return
    }

    onWifiEnabledChange(true)
    triggerStartFlow()
  }, [wifiEnabled, onWifiEnabledChange, handleDisable, triggerStartFlow])

  const handleWifiSpotPress = React.useCallback(() => {
    if (!wifiEnabled) return
    if (!hasSecondWordFlow) return
    if (secondWordTrigger !== 'tap') return
    if (!firstAnimationDoneRef.current) return
    if (secondSwitchDoneRef.current) return
    if (secondSwitchTimeoutRef.current) return

    const flowId = flowIdRef.current
    if (secondWordDelaySec <= 0) {
      runSecondStart(flowId)
      return
    }

    secondSwitchTimeoutRef.current = setTimeout(() => {
      secondSwitchTimeoutRef.current = null
      if (flowId !== flowIdRef.current || !mountedRef.current) return
      runSecondStart(flowId)
    }, secondWordDelaySec * 1000)
  }, [
    wifiEnabled,
    hasSecondWordFlow,
    secondWordTrigger,
    secondWordDelaySec,
    runSecondStart,
  ])

  return {
    waitingStart,
    running,
    animatedSpots,
    onSwitchPress,
    handleWifiSpotPress,
  }
}
