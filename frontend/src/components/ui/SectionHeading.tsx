import type { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeading({ title, subtitle, action }: SectionHeadingProps) {
  return (
    <div className="mb-2 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-surface-600 dark:text-surface-400">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}