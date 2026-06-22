import { useEffect, useRef, useCallback } from 'react'

const NOTIF_TITLE = '습관 크리처 🐾'
const NOTIF_BODY  = '오늘 습관 체크할 시간이에요! 크리처가 기다리고 있어요.'

export function useNotification(settings) {
  const timerRef = useRef(null)

  const getPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported'
    if (Notification.permission === 'granted') return 'granted'
    const result = await Notification.requestPermission()
    return result
  }, [])

  const schedule = useCallback((timeStr) => {
    if (!timeStr) return
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    clearTimeout(timerRef.current)

    const [h, m] = timeStr.split(':').map(Number)
    const now    = new Date()
    const target = new Date()
    target.setHours(h, m, 0, 0)
    if (target <= now) target.setDate(target.getDate() + 1)

    const delay = target - now

    timerRef.current = setTimeout(() => {
      // Show via service worker if available (works in background), else direct
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: NOTIF_TITLE,
          body: NOTIF_BODY,
        })
      } else {
        new Notification(NOTIF_TITLE, { body: NOTIF_BODY, icon: '/icon.svg', badge: '/icon.svg', tag: 'daily-habit', renotify: true })
      }
      // Re-schedule for tomorrow
      schedule(timeStr)
    }, delay)
  }, [])

  // Auto-(re)schedule whenever settings change
  useEffect(() => {
    if (settings?.enabled && settings?.time) {
      schedule(settings.time)
    } else {
      clearTimeout(timerRef.current)
    }
    return () => clearTimeout(timerRef.current)
  }, [settings?.enabled, settings?.time, schedule])

  return { getPermission }
}
