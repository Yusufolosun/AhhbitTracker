import type { PropsWithChildren, ReactNode } from 'react';
import { SurfaceCard } from './SurfaceCard';

type CalloutTone = 'info' | 'success' | 'warning' | 'danger';

interface CalloutCardProps extends PropsWithChildren {
  title: string;
  tone?: CalloutTone;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const toneStyles: Record<CalloutTone, string> = {
  info: 'border-primary-200 dark:border-primary-500/20',
  success: 'border-emerald-200 dark:border-emerald-500/20',
  warning: 'border-amber-200 dark:border-amber-500/20',
  danger: 'border-red-200 dark:border-red-500/20',
};

const titleStyles: Record<CalloutTone, string> = {
  info: 'text-primary-800 dark:text-primary-300',
  success: 'text-emerald-800 dark:text-emerald-300',
  warning: 'text-amber-800 dark:text-amber-300',
  danger: 'text-red-800 dark:text-red-300',
};

const descriptionStyles: Record<CalloutTone, string> = {
  info: 'text-primary-700 dark:text-primary-400',
  success: 'text-emerald-700 dark:text-emerald-400',
  warning: 'text-amber-700 dark:text-amber-400',
  danger: 'text-red-700 dark:text-red-400',
};

export function CalloutCard({
  children,
  title,
  tone = 'info',
  description,
  icon,
  action,
}: CalloutCardProps) {
  return (
    <SurfaceCard tone={tone === 'info' ? 'accent' : tone} className={toneStyles[tone]}>
      <div className="flex items-start gap-4">
        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-surface-800/80 border border-current/10">
            {icon}
          </div>
        ) : null}

        <div className="min-w-0 flex-1 space-y-1">
          <p className={`text-sm font-semibold ${titleStyles[tone]}`}>{title}</p>
          {description ? <p className={`text-sm ${descriptionStyles[tone]}`}>{description}</p> : null}
          {children ? <div className={`text-sm ${descriptionStyles[tone]}`}>{children}</div> : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </SurfaceCard>
  );
}