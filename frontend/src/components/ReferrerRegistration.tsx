import { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { useToast } from '../context/ToastContext';
import { ActionButton, SurfaceCard } from './ui';
import { trackEvent } from '../analytics';

export function ReferrerRegistration() {
  const [referrer, setReferrer] = useState('');
  const { registerReferrer, isRegisteringReferrer, referrer: existingReferrer } = useHabits();
  const { showToast } = useToast();

  if (existingReferrer) {
    return null;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedReferrer = referrer.trim();
    if (!trimmedReferrer) return;

    try {
      trackEvent('referrer_registration_clicked', { referrer: trimmedReferrer });
      await registerReferrer(trimmedReferrer);
      showToast('Referrer registration signed! It will be active once confirmed.', 'success');
      setReferrer('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      trackEvent('referrer_registration_failed', { error: message });
      showToast(message, 'error');
    }
  };

  return (
    <SurfaceCard className="bg-primary-50/30 border-primary-100 dark:bg-primary-500/5 dark:border-primary-500/10">
      <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
        Referral Program
      </h3>
      <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
        Register a referrer to support the community and boost your own rewards. This is a one-time
        setup.
      </p>

      <form onSubmit={handleRegister} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          className="input flex-1"
          placeholder="Enter referrer Stacks address"
          value={referrer}
          onChange={(e) => setReferrer(e.target.value)}
          disabled={isRegisteringReferrer}
          required
        />
        <ActionButton
          type="submit"
          disabled={isRegisteringReferrer || !referrer.trim()}
          className="whitespace-nowrap"
        >
          {isRegisteringReferrer ? 'Registering...' : 'Register Referrer'}
        </ActionButton>
      </form>
    </SurfaceCard>
  );
}
