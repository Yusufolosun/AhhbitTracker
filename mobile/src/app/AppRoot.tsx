import { StatusBar } from 'expo-status-bar';
import { AppNavigation } from '@/app/navigation';
import { AppProviders } from '@/app/providers';
import { useWalletDeepLinking } from '@/features/wallet/useWalletDeepLinking';

function WalletDeepLinkBootstrap() {
  useWalletDeepLinking();

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
