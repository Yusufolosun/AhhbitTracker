import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppNavigation } from '@/app/navigation';
import { AppProviders } from '@/app/providers';
import { useWalletDeepLinking, useWalletInteractionSync } from '@/features/wallet';
import { useNotificationBootstrap } from '@/features/notifications';
import { flushMobileAnalytics, trackMobileEvent } from '@/analytics';

function WalletDeepLinkBootstrap() {
  useWalletDeepLinking();
  useWalletInteractionSync();

  return null;
}

function NotificationBootstrap() {
  useNotificationBootstrap();

  return null;
}

export function AppRoot() {
  const trackedAppLoadRef = useRef(false);

  useEffect(() => {
    if (trackedAppLoadRef.current) {
      return;
    }

    trackedAppLoadRef.current = true;
    trackMobileEvent('app_loaded', { source: 'mobile' });
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        void flushMobileAnalytics();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <AppProviders>
      <WalletDeepLinkBootstrap />
      <NotificationBootstrap />
      <AppNavigation />
      <StatusBar style="dark" />
    </AppProviders>
  );
}
