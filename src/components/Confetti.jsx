import { useEffect, useState } from 'react'

const COLORS = ['#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#f97316','#06b6d4']
const COUNT  = 70

// Pre-compute piece data so it's stable across renders
const PIECES = Array.from({ length: COUNT }, (_, i) => ({
  id:       i,
  color:    COLORS[i % COLORS.length],
  left:     `${(i / COUNT) * 100 + Math.sin(i * 1.9) * 2.5}%`,
  dur:      `${2.0 + (i % 6) * 0.35}s`,
  delay:    `${(i % 14) * 0.09}s`,
  size:     5 + (i % 5) * 3,
  radius:   i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
  initRot:  i * 41,
}))

export default function Confetti({ show }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) return
    setVisible(true)
    // Auto-hide after longest piece finishes (~14 * 0.09 + 2 + 5 * 0.35 ≈ 5s)
    const t = setTimeout(() => setVisible(false), 5200)
    return () => clearTimeout(t)
  }, [show])

  if (!visible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden" aria-hidden>
      {PIECES.map(p => (
        <div
          key={p.id}
          className="absolute confetti-piece"
          style={{
            left:           p.left,
            top:            '-16px',
            width:          p.size,
            height:         p.size,
            backgroundColor: p.color,
            borderRadius:   p.radius,
            transform:      `rotate(${p.initRot}deg)`,
            '--dur':        p.dur,
            '--delay':      p.delay,
          }}
        />
      ))}
    </div>
  )
}
