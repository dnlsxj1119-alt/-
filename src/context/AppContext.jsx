import { createContext, useContext } from 'react'
import { useAppStore } from '../hooks/useAppStore'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const store = useAppStore()
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
