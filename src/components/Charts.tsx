import React from 'react'

interface ProgressBarProps {
  label: string
  value: number
  max: number
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  showPercentage?: boolean
}

const colorClasses = {
  blue: 'bg-blue-600 dark:bg-blue-500',
  green: 'bg-green-600 dark:bg-green-500',
  purple: 'bg-purple-600 dark:bg-purple-500',
  orange: 'bg-orange-600 dark:bg-orange-500',
  red: 'bg-red-600 dark:bg-red-500'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  max,
  color = 'blue',
  showPercentage = true
}) => {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-[var(--fh-text)]">{label}</span>
        {showPercentage && (
          <span className="text-sm font-semibold text-[var(--fh-text)]">{percentage}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200/80 dark:bg-gray-700/50 rounded-full h-2">
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-[var(--fh-muted)] mt-1">
        {value} de {max}
      </div>
    </div>
  )
}

interface SimpleBarChartProps {
  data: Array<{
    label: string
    value: number
  }>
  maxValue?: number
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  maxValue,
  color = 'blue'
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1)

  return (
    <div className="space-y-3">
      {data.map((item, idx) => (
        <div key={idx}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-[var(--fh-text)]">{item.label}</span>
            <span className="text-sm font-semibold text-[var(--fh-text)]">{item.value}</span>
          </div>
          <div className="w-full bg-gray-200/80 dark:bg-gray-700/50 rounded-full h-2">
            <div
              className={`${colorClasses[color]} h-2 rounded-full`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
