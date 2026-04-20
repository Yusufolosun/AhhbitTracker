import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  AccountScreen,
  HabitsScreen,
  OverviewScreen,
  NotificationsScreen,
  PreviewScreen,
} from '@/app/screens';
import { mainTabScreenOptions } from './options';
import { MAIN_TAB_ROUTES, type MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabsNavigator() {
  return (
    <Tab.Navigator screenOptions={mainTabScreenOptions}>
      <Tab.Screen
        name={MAIN_TAB_ROUTES.Overview}
        component={OverviewScreen}
        options={{
          title: 'Overview',
        }}
      />
      <Tab.Screen
        name={MAIN_TAB_ROUTES.Habits}
        component={HabitsScreen}
        options={{
          title: 'Habits',
        }}
      />
      <Tab.Screen
        name={MAIN_TAB_ROUTES.Notifications}
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />
      <Tab.Screen
        name={MAIN_TAB_ROUTES.Preview}
        component={PreviewScreen}
        options={{
          title: 'Preview',
        }}
      />
      <Tab.Screen
        name={MAIN_TAB_ROUTES.Account}
        component={AccountScreen}
        options={{
          title: 'Account',
        }}
      />
    </Tab.Navigator>
  );
}
