'use client'

import { createContext, useContext, type ReactNode } from 'react'

interface ThemeConfig {
  primary: string
  secondary: string
  background: string
  surface: string
  border: string
}

const defaultTheme: ThemeConfig = {
  primary: '#FFD100',
  secondary: '#1A1A1A',
  background: '#F8F8F6',
  surface: '#FFFFFF',
  border: '#E8E8E8',
}

const ThemeContext = createContext<ThemeConfig>(defaultTheme)

export function ThemeProvider({
  children,
  theme = defaultTheme,
}: {
  children: ReactNode
  theme?: ThemeConfig
}) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
