import { StatusBar } from 'expo-status-bar';
import { AppNavigation } from '@/app/navigation';
import { AppProviders } from '@/app/providers';
import { useWalletDeepLinking, useWalletInteractionSync } from '@/features/wallet';

function WalletDeepLinkBootstrap() {
  useWalletDeepLinking();
  useWalletInteractionSync();

  return null;
}

export function AppRoot() {
  return (
    <AppProviders>
      <WalletDeepLinkBootstrap />
      <AppNavigation />
      <StatusBar style="dark" />
    </AppProviders>
  );
}
