import { useState, useMemo } from 'react';

/**
 * Interactive stake simulator that lets prospective users see exactly
 * what happens when they stay consistent vs. miss check-ins.
 */
export function StakeCalculator() {
  const [stakeSTX, setStakeSTX] = useState(1);
  const [missedDays, setMissedDays] = useState(0);

  const result = useMemo(() => {
    const stakeUstx = stakeSTX * 1_000_000;
    const penaltyRate = 0.1; // 10% per missed window
    let remaining = stakeUstx;
    let totalForfeited = 0;

    for (let i = 0; i < missedDays; i++) {
      const penalty = Math.floor(remaining * penaltyRate);
      totalForfeited += penalty;
      remaining -= penalty;
      if (remaining <= 0) {
        remaining = 0;
        break;
      }
    }

    return {
      originalSTX: stakeSTX,
      remainingSTX: (remaining / 1_000_000).toFixed(4),
      forfeitedSTX: (totalForfeited / 1_000_000).toFixed(4),
      remainingPercent: stakeUstx > 0 ? Math.round((remaining / stakeUstx) * 100) : 0,
    };
  }, [stakeSTX, missedDays]);

  return (
    <div className="bg-surface-50 dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
        Stake Simulator
      </h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
        See what happens to your deposit based on missed days.
      </p>

      <div className="space-y-5">
        {/* Stake input */}
        <div>
          <label htmlFor="calc-stake" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Your Deposit (STX)
          </label>
          <input
            id="calc-stake"
            type="range"
            min={0.02}
            max={10}
            step={0.01}
            value={stakeSTX}
            onChange={(e) => setStakeSTX(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs text-surface-400 mt-1">
            <span>0.02 STX</span>
            <span className="font-semibold text-primary-500">{stakeSTX.toFixed(2)} STX</span>
            <span>10 STX</span>
          </div>
        </div>

        {/* Missed days input */}
        <div>
          <label htmlFor="calc-missed" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Missed Check-In Windows
          </label>
          <input
            id="calc-missed"
            type="range"
            min={0}
            max={10}
            step={1}
            value={missedDays}
            onChange={(e) => setMissedDays(Number(e.target.value))}
            className="w-full accent-red-500"
          />
          <div className="flex justify-between text-xs text-surface-400 mt-1">
            <span>0 missed</span>
            <span className={`font-semibold ${missedDays > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{missedDays} missed</span>
            <span>10 missed</span>
          </div>
        </div>

        {/* Visual result */}
        <div className="rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-surface-600 dark:text-surface-400">Remaining Deposit</span>
            <span className="text-lg font-bold text-surface-900 dark:text-white">{result.remainingSTX} STX</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="h-3 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${result.remainingPercent}%`,
                background: result.remainingPercent > 70
                  ? 'linear-gradient(90deg, #10B981, #34D399)'
                  : result.remainingPercent > 30
                    ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                    : 'linear-gradient(90deg, #EF4444, #F87171)',
              }}
            />
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {result.remainingPercent}% kept
            </span>
            <span className="text-red-500 font-medium">
              {result.forfeitedSTX} STX forfeited
            </span>
          </div>

          {missedDays === 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 text-center font-medium">
              Stay consistent and you keep everything + earn from the reward pool!
            </p>
          )}

          {missedDays > 0 && missedDays < 5 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 text-center">
              Each missed window costs 10% of your remaining deposit.
            </p>
          )}

          {missedDays >= 5 && (
            <p className="text-xs text-red-500 mt-3 text-center">
              After {missedDays} missed windows, over half your deposit could be forfeited!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
