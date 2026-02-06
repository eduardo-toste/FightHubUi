import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number | string
  subtitle?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
  variant?: 'default' | 'outline'
}

const colorMap = {
  blue: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 text-blue-700 border-blue-300/50 dark:from-blue-500/20 dark:to-blue-600/20 dark:text-blue-400 dark:border-blue-500/50',
  green: 'bg-gradient-to-br from-green-500/10 to-green-600/10 text-green-700 border-green-300/50 dark:from-green-500/20 dark:to-green-600/20 dark:text-green-400 dark:border-green-500/50',
  purple: 'bg-gradient-to-br from-purple-500/10 to-purple-600/10 text-purple-700 border-purple-300/50 dark:from-purple-500/20 dark:to-purple-600/20 dark:text-purple-400 dark:border-purple-500/50',
  orange: 'bg-gradient-to-br from-orange-500/10 to-orange-600/10 text-orange-700 border-orange-300/50 dark:from-orange-500/20 dark:to-orange-600/20 dark:text-orange-400 dark:border-orange-500/50',
  red: 'bg-gradient-to-br from-red-500/10 to-red-600/10 text-red-700 border-red-300/50 dark:from-red-500/20 dark:to-red-600/20 dark:text-red-400 dark:border-red-500/50',
  indigo: 'bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 text-indigo-700 border-indigo-300/50 dark:from-indigo-500/20 dark:to-indigo-600/20 dark:text-indigo-400 dark:border-indigo-500/50'
}

const iconBgMap = {
  blue: 'bg-blue-500/10 dark:bg-blue-500/20',
  green: 'bg-green-500/10 dark:bg-green-500/20',
  purple: 'bg-purple-500/10 dark:bg-purple-500/20',
  orange: 'bg-orange-500/10 dark:bg-orange-500/20',
  red: 'bg-red-500/10 dark:bg-red-500/20',
  indigo: 'bg-indigo-500/10 dark:bg-indigo-500/20'
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  subtitle,
  color = 'blue',
  variant = 'default'
}) => {
  const baseClasses = 'rounded-lg p-6 border'
  const colorClasses = colorMap[color]
  const iconBgClass = iconBgMap[color]

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
        </div>
        <div className={`${iconBgClass} p-3 rounded-lg ml-4`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}
