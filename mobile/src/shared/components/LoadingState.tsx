import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { palette } from '@/shared/theme';

export function LoadingState() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={palette.accent} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
});
