import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreateHabitScreen, HabitDetailsScreen } from '@/app/screens';
import { MainTabsNavigator } from './MainTabsNavigator';
import { stackScreenOptions } from './options';
import { ROOT_ROUTES, type RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name={ROOT_ROUTES.MainTabs}
        component={MainTabsNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ROOT_ROUTES.HabitDetails}
        component={HabitDetailsScreen}
        options={{
          title: 'Habit details',
        }}
      />
      <Stack.Screen
        name={ROOT_ROUTES.CreateHabit}
        component={CreateHabitScreen}
        options={{
          title: 'Create habit',
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
}
