import type { NavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import { MAIN_TAB_ROUTES, ROOT_ROUTES } from './types';
import type { MainTabParamList, RootStackParamList } from './types';

type RootNavigation = Pick<NavigationProp<RootStackParamList>, 'navigate'>;

export function navigateToMainTab(
  navigation: RootNavigation,
  tab: 'Overview',
): void;
export function navigateToMainTab(
  navigation: RootNavigation,
  tab: 'Habits',
): void;
export function navigateToMainTab(
  navigation: RootNavigation,
  tab: 'Notifications',
): void;
export function navigateToMainTab(
  navigation: RootNavigation,
  tab: 'Preview',
  params?: MainTabParamList['Preview'],
): void;
export function navigateToMainTab(
  navigation: RootNavigation,
  tab: 'Account',
): void;
export function navigateToMainTab(
  navigation: RootNavigation,
  tab: keyof MainTabParamList,
  params?: MainTabParamList[keyof MainTabParamList],
): void {
  const payload = (params === undefined
    ? { screen: tab }
    : { screen: tab, params }) as NavigatorScreenParams<MainTabParamList>;

  navigation.navigate(ROOT_ROUTES.MainTabs, payload);
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
