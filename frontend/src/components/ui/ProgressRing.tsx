interface ProgressRingProps {
  /** Current value */
  value: number;
  /** Maximum value */
  max: number;
  /** Ring diameter in px (default 56) */
  size?: number;
  /** Stroke width in px (default 5) */
  strokeWidth?: number;
  /** Tailwind stroke color class — used via CSS variable trick */
  color?: 'primary' | 'emerald' | 'amber' | 'red' | 'sky';
  /** Show percentage text in center (default true) */
  showLabel?: boolean;
  /** Override center label */
  label?: string;
  /** Extra class on the outer wrapper */
  className?: string;
}

const STROKE_COLORS: Record<string, string> = {
  primary: '#F15A22',
  emerald: '#10B981',
  amber:   '#F59E0B',
  red:     '#EF4444',
  sky:     '#0EA5E9',
};

const TRACK_COLORS: Record<string, string> = {
  primary: 'rgba(241,90,34,0.12)',
  emerald: 'rgba(16,185,129,0.12)',
  amber:   'rgba(245,158,11,0.12)',
  red:     'rgba(239,68,68,0.12)',
  sky:     'rgba(14,165,233,0.12)',
};

export function ProgressRing({
  value,
  max,
  size = 56,
  strokeWidth = 5,
  color = 'primary',
  showLabel = true,
  label,
  className = '',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(value, 0), max);
  const progress = max > 0 ? clamped / max : 0;
  const offset = circumference * (1 - progress);

  const stroke = STROKE_COLORS[color] ?? STROKE_COLORS.primary;
  const track = TRACK_COLORS[color] ?? TRACK_COLORS.primary;

  const center = size / 2;
  const displayLabel = label ?? `${clamped}/${max}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Progress: ${clamped} of ${max}`}
      role="img"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
          style={{ color: stroke }}
        >
          {displayLabel}
        </span>
      )}
    </div>
  );
}
