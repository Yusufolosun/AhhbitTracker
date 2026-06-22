import { useState } from 'react';
import { SurfaceCard } from './ui';

const PENALTY_RATE = 0.1;
const STREAK_GOAL  = 7;

function calcReturn(stakeStx: number, missedDays: number) {
  let balance = stakeStx;
  for (let i = 0; i < missedDays; i++) {
    balance -= balance * PENALTY_RATE;
  }
  return balance;
}

export function StakeCalculator() {
  const [stakeInput, setStakeInput] = useState('1');
  const [missedDays, setMissedDays] = useState(0);

  const stake      = Math.max(0, parseFloat(stakeInput) || 0);
  const returnAmt  = calcReturn(stake, missedDays);
  const penaltyAmt = stake - returnAmt;
  const pct        = stake > 0 ? Math.round((returnAmt / stake) * 100) : 100;

  return (
    <SurfaceCard className="relative overflow-hidden">
      {/* Subtle top-left glow */}
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">Stake Simulator</h3>
          <span className="text-sm">🧮</span>
        </div>
        <p className="text-xs text-surface-500 dark:text-surface-400 mb-5">
          See how much you'd get back after missed check-ins
        </p>

        <div className="space-y-4 mb-5">
          {/* Stake input */}
          <div>
            <label htmlFor="calc-stake" className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Stake Amount
            </label>
            <div className="relative">
              <input
                id="calc-stake"
                type="number"
                className="input pr-14"
                value={stakeInput}
                onChange={(e) => setStakeInput(e.target.value)}
                min="0"
                step="0.5"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="text-sm font-semibold text-surface-400">STX</span>
              </div>
            </div>
          </div>

          {/* Missed days slider */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label htmlFor="calc-missed" className="text-xs font-medium text-surface-700 dark:text-surface-300">
                Missed Days
              </label>
              <span className="text-xs font-bold tabular-nums text-surface-600 dark:text-surface-400">
                {missedDays} / {STREAK_GOAL}
              </span>
            </div>
            <input
              id="calc-missed"
              type="range"
              min={0}
              max={STREAK_GOAL}
              value={missedDays}
              onChange={(e) => setMissedDays(Number(e.target.value))}
              className="w-full h-2 appearance-none rounded-full bg-surface-200 dark:bg-surface-700 accent-primary-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Result panel */}
        <div className={[
          'rounded-xl p-4 border space-y-3 transition-colors duration-300',
          missedDays === 0
            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20'
            : missedDays <= 2
              ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'
              : 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20',
        ].join(' ')}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-surface-600 dark:text-surface-400">
              {missedDays === 0 ? '✅ Full stake returned' : `⚠ After ${missedDays} missed day${missedDays > 1 ? 's' : ''}`}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              missedDays === 0
                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20'
                : 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-500/20'
            }`}>
              {pct}% returned
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xxs text-surface-500 dark:text-surface-400 uppercase tracking-widest mb-0.5">You Get Back</p>
              <p className="text-2xl font-black text-surface-900 dark:text-white">
                {returnAmt.toFixed(3)}
              </p>
              <p className="text-xxs text-surface-400">STX</p>
            </div>
            <div>
              <p className="text-xxs text-surface-500 dark:text-surface-400 uppercase tracking-widest mb-0.5">Penalty Lost</p>
              <p className={`text-2xl font-black ${penaltyAmt > 0 ? 'text-red-600 dark:text-red-400' : 'text-surface-300 dark:text-surface-600'}`}>
                {penaltyAmt.toFixed(3)}
              </p>
              <p className="text-xxs text-surface-400">STX</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                missedDays === 0 ? 'bg-emerald-500' : missedDays <= 2 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {missedDays === 0 && stake > 0 && (
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              Zero missed days = zero penalties. Plus you earn a share of the community pool!
            </p>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}
