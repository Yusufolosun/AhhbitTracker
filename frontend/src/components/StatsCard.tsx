import type { ReactNode } from 'react';
import { SurfaceCard } from './ui';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  accentColor?: 'primary' | 'green' | 'yellow' | 'orange' | 'purple' | 'blue';
}

const accentBg: Record<string, string> = {
  primary: 'bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-500/20 dark:to-primary-500/10',
  green:   'bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10',
  yellow:  'bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-500/20 dark:to-yellow-500/10',
  orange:  'bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-500/20 dark:to-orange-500/10',
  purple:  'bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-500/20 dark:to-purple-500/10',
  blue:    'bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-500/20 dark:to-blue-500/10',
};

const trendIcons: Record<string, ReactNode> = {
  up:      <span className="text-emerald-500 text-xs font-bold">↑</span>,
  down:    <span className="text-red-500 text-xs font-bold">↓</span>,
  neutral: <span className="text-surface-400 text-xs">—</span>,
};

const trendColors: Record<string, string> = {
  up:      'text-emerald-600 dark:text-emerald-400',
  down:    'text-red-600 dark:text-red-400',
  neutral: 'text-surface-500 dark:text-surface-400',
};

export function StatsCard({ title, value, subtitle, icon, trend, accentColor = 'primary' }: StatsCardProps) {
  return (
    <SurfaceCard className="group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
      {/* Subtle top-border accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-widest mb-2">
            {title}
          </p>
          <p className="text-2xl font-black text-surface-900 dark:text-white truncate">
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs mt-1.5 flex items-center gap-1 ${trend ? trendColors[trend] : 'text-surface-500 dark:text-surface-400'}`}>
              {trend && trendIcons[trend]}
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 ${accentBg[accentColor]} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}
