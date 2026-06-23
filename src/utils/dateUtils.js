export const getToday = () => new Date().toISOString().split('T')[0]

export const getYesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export const isYesterday = (dateStr) => getYesterday() === dateStr

// 새벽 4시 이전이면 전날을 "오늘"로 취급 (자정 이후 기입 지원)
const LATE_CUTOFF_HOUR = 4

export const getActiveDate = () => {
  const now = new Date()
  if (now.getHours() < LATE_CUTOFF_HOUR) {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  }
  return now.toISOString().split('T')[0]
}

export const subtractDay = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export const getLast30Days = () => {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export const getLast90Days = () => {
  const days = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
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
