import type { NavigationProp } from '@react-navigation/native';
import { MAIN_TAB_ROUTES, ROOT_ROUTES } from './types';
import type { MainTabParamList, RootStackParamList } from './types';

type RootNavigation = Pick<NavigationProp<RootStackParamList>, 'navigate'>;

export function navigateToMainTab<RouteName extends keyof MainTabParamList>(
  navigation: RootNavigation,
  tab: RouteName,
  params?: MainTabParamList[RouteName],
): void {
  navigation.navigate(ROOT_ROUTES.MainTabs, { screen: tab, params });
}

export function navigateToPreview(
  navigation: RootNavigation,
  params?: MainTabParamList['Preview'],
): void {
  navigateToMainTab(navigation, MAIN_TAB_ROUTES.Preview, params);
}

export function navigateToHabitDetails(navigation: RootNavigation, habitId: number): void {
  navigation.navigate(ROOT_ROUTES.HabitDetails, { habitId });
}

export function navigateToCreateHabit(navigation: RootNavigation): void {
  navigation.navigate(ROOT_ROUTES.CreateHabit);
}
