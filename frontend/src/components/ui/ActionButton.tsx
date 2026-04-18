import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ActionVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ActionButtonProps
  extends PropsWithChildren,
    ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionVariant;
  isLoading?: boolean;
}

const variantClasses: Record<ActionVariant, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow-md',
  secondary:
    'bg-surface-200 text-surface-800 hover:bg-surface-300 dark:bg-surface-700 dark:text-gray-200 dark:hover:bg-surface-600 shadow-sm',
  ghost:
    'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md',
};

export function ActionButton({
  children,
  className = '',
  disabled,
  isLoading = false,
  type = 'button',
  variant = 'primary',
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`.trim()}
    >
      {isLoading ? 'Loading…' : children}
    </button>
  );
}