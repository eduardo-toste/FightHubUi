import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  const getIcon = () => {
    if (theme === 'light') return <Sun className="w-6 h-6 text-yellow-500" />
    if (theme === 'dark') return <Moon className="w-6 h-6 text-blue-400" />
    return <Monitor className="w-6 h-6 text-gray-500 dark:text-gray-400" />
  }

  const getLabel = () => {
    if (theme === 'light') return 'Modo claro (clique para escuro)'
    if (theme === 'dark') return 'Modo escuro (clique para seguir sistema)'
    return 'Seguindo sistema (clique para modo claro)'
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      aria-label="Alternar tema"
      title={getLabel()}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {getIcon()}
      </div>
    </button>
  )
}
