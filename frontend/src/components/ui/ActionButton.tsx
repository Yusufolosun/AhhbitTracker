import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ActionVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ActionSize = 'sm' | 'md' | 'lg';

interface ActionButtonProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionVariant;
  size?: ActionSize;
  isLoading?: boolean;
}

const variantClasses: Record<ActionVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary-500 to-primary-600 text-white ' +
    'hover:from-primary-600 hover:to-primary-700 ' +
    'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/35 ' +
    'active:scale-[0.98]',
  secondary:
    'bg-surface-100 text-surface-800 border border-surface-200 ' +
    'hover:bg-surface-200 hover:border-surface-300 ' +
    'dark:bg-surface-700 dark:text-gray-200 dark:border-surface-600 dark:hover:bg-surface-600 ' +
    'shadow-sm hover:shadow-md active:scale-[0.98]',
  ghost:
    'text-surface-600 hover:bg-surface-100 hover:text-primary-500 ' +
    'dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-primary-400',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 ' +
    'shadow-sm hover:shadow-md active:scale-[0.98]',
};

const sizeClasses: Record<ActionSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-6 py-3 text-sm rounded-xl gap-2',
  lg: 'px-8 py-4 text-base rounded-2xl gap-2.5',
};

export function ActionButton({
  children,
  className = '',
  disabled,
  isLoading = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center font-semibold transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .join(' ')
        .trim()}
    >
      {isLoading ? (
        <>
          <span className="spinner" style={{ width: 16, height: 16 }} />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
