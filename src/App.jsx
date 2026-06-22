import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { useNotification } from './hooks/useNotification'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import Confetti from './components/Confetti'
import EvolutionOverlay from './components/EvolutionOverlay'
import Home from './pages/Home'
import Creature from './pages/Creature'
import Stats from './pages/Stats'
import Settings from './pages/Settings'

function AppContent() {
  const [tab, setTab] = useState('home')
  const { evolutionAlert, showConfetti, notifSettings } = useApp()

  // Activate daily notification scheduling
  useNotification(notifSettings)

  return (
    <div className="relative flex justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="w-full max-w-md relative">
        {tab === 'home'     && <Home />}
        {tab === 'creature' && <Creature />}
        {tab === 'stats'    && <Stats />}
        {tab === 'settings' && <Settings />}

        <Toast />
        <BottomNav current={tab} onChange={setTab} />

        {/* Global overlays */}
        <Confetti show={showConfetti} />
        <EvolutionOverlay event={evolutionAlert} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
