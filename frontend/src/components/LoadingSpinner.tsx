

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
      <div className={`spinner ${sizeClasses[size]}`} aria-hidden="true"></div>
      {text ? (
        <p className="mt-4 text-sm text-gray-600">{text}</p>
      ) : (
        <span className="sr-only">Loading…</span>
      )}
    </div>
  );
}
