import type { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { palette, spacing } from '@/shared/theme';

interface ScreenProps extends PropsWithChildren {
  contentContainerStyle?: ViewStyle;
}

export function Screen({ children, contentContainerStyle }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, contentContainerStyle]}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.surface,
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});
