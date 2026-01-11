import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const getSystemTheme = (): 'light' | 'dark' => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('fh-theme')
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored
    }
    // Padrão: seguir sistema
    return 'system'
  })

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('fh-theme')
    if (stored === 'dark') return 'dark'
    if (stored === 'light') return 'light'
    return getSystemTheme()
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    const updateTheme = () => {
      const resolvedTheme = theme === 'system' ? getSystemTheme() : theme
      setActualTheme(resolvedTheme)
      
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)
    }

    updateTheme()
    localStorage.setItem('fh-theme', theme)

    // Listener para mudanças na preferência do sistema
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light'
        setActualTheme(newTheme)
        root.classList.remove('light', 'dark')
        root.classList.add(newTheme)
      }

      // Usar addEventListener (mais moderno) ou addListener (fallback)
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange)
        return () => mediaQuery.removeListener(handleChange)
      }
    }
  }, [theme])

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'system'
      return 'light'
    })
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
