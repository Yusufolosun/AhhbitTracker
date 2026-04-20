import { StatusBar } from 'expo-status-bar';
import { AppNavigation } from '@/app/navigation';
import { AppProviders } from '@/app/providers';
import { useWalletDeepLinking, useWalletInteractionSync } from '@/features/wallet';
import { useNotificationBootstrap } from '@/features/notifications';

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
  return (
    <AppProviders>
      <WalletDeepLinkBootstrap />
      <NotificationBootstrap />
      <AppNavigation />
      <StatusBar style="dark" />
    </AppProviders>
  );
}
