import type { ReactNode } from 'react';

type BadgeVariant =
  | 'active'
  | 'cooldown'
  | 'urgent'
  | 'expired'
  | 'completed'
  | 'forfeited'
  | 'demo'
  | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
  dot?: boolean;
  icon?: ReactNode;
}

const variantConfig: Record<BadgeVariant, { dot: string; text: string; bg: string; defaultLabel: string }> = {
  active:    { dot: 'bg-emerald-500',  text: 'text-emerald-800 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-500/15',  defaultLabel: 'Active'         },
  cooldown:  { dot: 'bg-sky-500',      text: 'text-sky-800 dark:text-sky-300',         bg: 'bg-sky-100 dark:bg-sky-500/15',           defaultLabel: 'Cooldown'       },
  urgent:    { dot: 'bg-amber-500',    text: 'text-amber-800 dark:text-amber-300',     bg: 'bg-amber-100 dark:bg-amber-500/15',       defaultLabel: 'Expiring Soon'  },
  expired:   { dot: 'bg-red-500',      text: 'text-red-800 dark:text-red-300',         bg: 'bg-red-100 dark:bg-red-500/15',           defaultLabel: 'Window Expired' },
  completed: { dot: 'bg-blue-500',     text: 'text-blue-800 dark:text-blue-300',       bg: 'bg-blue-100 dark:bg-blue-500/15',         defaultLabel: 'Completed'      },
  forfeited: { dot: 'bg-surface-400',  text: 'text-surface-600 dark:text-surface-400', bg: 'bg-surface-100 dark:bg-surface-700',      defaultLabel: 'Forfeited'      },
  demo:      { dot: 'bg-amber-500',    text: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-500/10',        defaultLabel: 'Demo'           },
  neutral:   { dot: 'bg-surface-400',  text: 'text-surface-600 dark:text-surface-400', bg: 'bg-surface-100 dark:bg-surface-800',      defaultLabel: ''               },
};

export function Badge({ variant, label, className = '', dot = true, icon }: BadgeProps) {
  const cfg = variantConfig[variant];
  const text = label ?? cfg.defaultLabel;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        cfg.bg,
        cfg.text,
        className,
      ]
        .join(' ')
        .trim()}
    >
      {icon ? (
        <span className="w-3 h-3 flex-shrink-0">{icon}</span>
      ) : dot ? (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      ) : null}
      {text}
    </span>
  );
}
