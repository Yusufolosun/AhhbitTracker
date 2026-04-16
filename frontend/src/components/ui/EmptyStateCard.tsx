import type { PropsWithChildren, ReactNode } from 'react';
import { SurfaceCard } from './SurfaceCard';
import { ActionButton } from './ActionButton';

interface EmptyStateCardProps extends PropsWithChildren {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyStateCard({
  children,
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateCardProps) {
  return (
    <SurfaceCard className="text-center" padding="lg">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/10">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-surface-800 dark:text-white">{title}</h3>
      <p className="mx-auto max-w-md text-surface-500 dark:text-surface-400">{description}</p>
      {children ? <div className="mt-4 text-sm text-surface-600 dark:text-surface-400">{children}</div> : null}
      {actionLabel && onAction ? (
        <ActionButton className="mt-6" onClick={onAction}>
          {actionLabel}
        </ActionButton>
      ) : null}
    </SurfaceCard>
  );
}