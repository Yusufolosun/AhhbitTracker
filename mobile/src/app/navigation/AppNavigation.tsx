import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './RootNavigator';
import { linkingConfig } from './linking';
import { navigationTheme } from './theme';

export function AppNavigation() {
  return (
    <NavigationContainer linking={linkingConfig} theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
