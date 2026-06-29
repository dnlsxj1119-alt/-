// 로컬 시간 기준 날짜 문자열 (toISOString은 UTC라 한국에서 오전 9시 전까지 날짜 틀림)
const localStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const getToday = () => localStr(new Date())

export const getYesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return localStr(d)
}

export const isYesterday = (dateStr) => getYesterday() === dateStr

// 낮 12시 이전이면 전날을 "오늘"로 취급 (다음날 오전 기입 지원)
const LATE_CUTOFF_HOUR = 12

export const getActiveDate = () => {
  const now = new Date()
  if (now.getHours() < LATE_CUTOFF_HOUR) {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return localStr(d)
  }
  return localStr(now)
}

export const subtractDay = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  return localStr(d)
}

export const getLast30Days = () => {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(localStr(d))
  }
  return days
}

export const getLast90Days = () => {
  const days = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(localStr(d))
  }
  return days
}

export const formatMonthDay = (dateStr) => {
  if (!dateStr) return ''
  const [, m, d] = dateStr.split('-')
  return `${Number(m)}/${Number(d)}`
}

export const formatFull = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${y}년 ${Number(m)}월 ${Number(d)}일`
}
