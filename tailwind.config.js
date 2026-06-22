/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        /* Creature states */
        'happy-bounce': 'happyBounce 0.7s ease-in-out infinite',
        droop:          'droop 2.5s ease-in-out infinite',
        float:          'float 3s ease-in-out infinite',

        /* Evolution */
        evolve:         'evolve 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'evolve-glow':  'evolveGlow 1.8s ease-out forwards',
        'evolve-bg':    'evolveBg 2.2s ease-out forwards',

        /* Confetti */
        'confetti-fall': 'confettiFall var(--dur,2.5s) var(--delay,0s) ease-in both',

        /* UI */
        'slide-up':  'slideUp 0.3s ease-out',
        'check-pop': 'checkPop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'fade-in':   'fadeIn 0.2s ease-out',
        'pulse-ring':'pulseRing 1.5s ease-out infinite',
      },
      keyframes: {
        /* ── Creature ── */
        happyBounce: {
          '0%,100%': { transform: 'translateY(0) scale(1)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
          '30%':     { transform: 'translateY(-20px) scale(1.08) rotate(-4deg)', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
          '60%':     { transform: 'translateY(-8px) scale(1.04) rotate(3deg)' },
        },
        droop: {
          '0%,100%': { transform: 'rotate(-6deg) translateY(3px)', filter: 'grayscale(30%)' },
          '50%':     { transform: 'rotate(4deg) translateY(0px)',   filter: 'grayscale(20%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-6px)' },
        },

        /* ── Evolution ── */
        evolve: {
          '0%':   { transform: 'scale(0.3) rotate(-15deg)', opacity: '0',   filter: 'brightness(5)' },
          '40%':  { transform: 'scale(1.6) rotate(5deg)',   opacity: '1',   filter: 'brightness(2.5) drop-shadow(0 0 40px rgba(167,139,250,1))' },
          '70%':  { transform: 'scale(0.9) rotate(-3deg)',  filter: 'brightness(1.4) drop-shadow(0 0 20px rgba(167,139,250,0.7))' },
          '100%': { transform: 'scale(1) rotate(0deg)',     filter: 'brightness(1) drop-shadow(0 0 8px rgba(167,139,250,0.3))' },
        },
        evolveGlow: {
          '0%':    { boxShadow: '0 0 0 0 rgba(139,92,246,0)', opacity: '1' },
          '30%':   { boxShadow: '0 0 80px 40px rgba(139,92,246,0.8)' },
          '100%':  { boxShadow: '0 0 0 0 rgba(139,92,246,0)', opacity: '0' },
        },
        evolveBg: {
          '0%':   { opacity: '0' },
          '15%':  { opacity: '0.9' },
          '70%':  { opacity: '0.7' },
          '100%': { opacity: '0' },
        },

        /* ── Confetti ── */
        confettiFall: {
          '0%':   { transform: 'translateY(-20px) rotate(0deg)   scale(1)',   opacity: '1' },
          '15%':  { opacity: '1' },
          '85%':  { opacity: '0.9' },
          '100%': { transform: 'translateY(105vh) rotate(800deg) scale(0.4)', opacity: '0' },
        },

        /* ── UI ── */
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to:   { transform: 'translateY(0)',     opacity: '1' },
        },
        checkPop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(0.9)', opacity: '0.7' },
          '50%':  { transform: 'scale(1.1)', opacity: '0.3' },
          '100%': { transform: 'scale(0.9)', opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
