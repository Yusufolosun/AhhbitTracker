import type { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { ROUTE_PATHS } from '@/core/navigation';
import type { RootStackParamList } from './types';

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'ahhbittracker://'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Overview: ROUTE_PATHS.overview,
          Habits: ROUTE_PATHS.habits,
          Notifications: ROUTE_PATHS.notifications,
          Preview: {
            path: ROUTE_PATHS.preview,
            parse: {
              payload: String,
              result: String,
            },
            stringify: {
              payload: String,
              result: String,
            },
          },
          Account: ROUTE_PATHS.account,
        },
      },
      HabitDetails: {
        path: ROUTE_PATHS.habitDetails,
        parse: {
          habitId: Number,
        },
      },
      CreateHabit: ROUTE_PATHS.createHabit,
    },
  },
};
