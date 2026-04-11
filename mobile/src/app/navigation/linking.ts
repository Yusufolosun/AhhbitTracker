import type { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import type { RootStackParamList } from './types';

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'ahhbittracker://'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Overview: 'overview',
          Habits: 'habits',
          Preview: 'preview',
          Account: 'account',
        },
      },
      HabitDetails: {
        path: 'habits/:habitId',
        parse: {
          habitId: Number,
        },
      },
      CreateHabit: 'habits/create',
    },
  },
};
