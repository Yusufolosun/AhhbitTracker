import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/app/providers';
import { DashboardScreen } from '@/app/screens';

export function AppRoot() {
  return (
    <AppProviders>
      <DashboardScreen />
      <StatusBar style="dark" />
    </AppProviders>
  );
}
