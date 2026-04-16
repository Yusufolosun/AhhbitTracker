import type { PropsWithChildren } from 'react';

type SurfaceTone = 'default' | 'accent' | 'success' | 'warning' | 'danger';
type SurfacePadding = 'none' | 'sm' | 'md' | 'lg';

interface SurfaceCardProps extends PropsWithChildren {
  tone?: SurfaceTone;
  padding?: SurfacePadding;
  className?: string;
}

const toneClasses: Record<SurfaceTone, string> = {
  default: 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700',
  accent: 'bg-primary-50 border-primary-200 dark:bg-primary-500/10 dark:border-primary-500/20',
  success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20',
  danger: 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20',
};

const paddingClasses: Record<SurfacePadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function SurfaceCard({
  children,
  tone = 'default',
  padding = 'md',
  className = '',
}: SurfaceCardProps) {
  return (
    <div className={`card ${toneClasses[tone]} ${paddingClasses[padding]} ${className}`.trim()}>
      {children}
    </div>
  );
}