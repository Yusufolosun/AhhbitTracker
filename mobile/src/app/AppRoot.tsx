import { StatusBar } from 'expo-status-bar';
import { AppNavigation } from '@/app/navigation';
import { AppProviders } from '@/app/providers';

export function AppRoot() {
  return (
    <AppProviders>
      <AppNavigation />
      <StatusBar style="dark" />
    </AppProviders>
  );
}
