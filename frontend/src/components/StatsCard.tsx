import React from 'react';

/**
 * A card component displaying a statistic with optional icon and trend indicator.
 */
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-surface-600 dark:text-surface-400',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className={`text-xs mt-1 ${trend ? trendColors[trend] : 'text-surface-500 dark:text-surface-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-500/10 rounded-xl flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
