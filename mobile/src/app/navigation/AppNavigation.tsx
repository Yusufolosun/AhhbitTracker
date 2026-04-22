import { useRef } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { RootNavigator } from './RootNavigator';
import { linkingConfig } from './linking';
import { navigationTheme } from './theme';
import type { RootStackParamList } from './types';
import { trackMobileEvent } from '@/analytics';

export function AppNavigation() {
  const previousRouteRef = useRef<string | undefined>(undefined);
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linkingConfig}
      theme={navigationTheme}
      onReady={() => {
        const currentRoute = navigationRef.getCurrentRoute()?.name;
        previousRouteRef.current = currentRoute;
        trackMobileEvent('route_viewed', { route: currentRoute, source: 'navigation_ready' });
      }}
      onStateChange={() => {
        const nextRoute = navigationRef.getCurrentRoute()?.name;

        if (nextRoute && nextRoute !== previousRouteRef.current) {
          trackMobileEvent('route_viewed', { route: nextRoute, source: 'navigation_change' });
          previousRouteRef.current = nextRoute;
        }
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}
