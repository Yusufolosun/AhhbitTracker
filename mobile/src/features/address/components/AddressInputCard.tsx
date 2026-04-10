import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Card } from '@/shared/components';
import { palette, radius, spacing, typography } from '@/shared/theme';

interface AddressInputCardProps {
  initialValue: string;
  onSubmit: (value: string) => Promise<void>;
  onClear: () => Promise<void>;
}

export function AddressInputCard({
  initialValue,
  onSubmit,
  onClear,
}: AddressInputCardProps) {
  const [value, setValue] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setPending(true);
    setError(null);

    try {
      await onSubmit(value);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to save address.',
      );
    } finally {
      setPending(false);
    }
  };

  const handleClear = async () => {
    setPending(true);
    setError(null);

    try {
      await onClear();
      setValue('');
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <Text style={styles.label}>Tracked Stacks Address</Text>
      <TextInput
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!pending}
        onChangeText={setValue}
        placeholder="SP... or ST..."
        placeholderTextColor={palette.steel}
        style={styles.input}
        value={value}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          disabled={pending}
          onPress={handleSave}
          style={({ pressed }) => [
            styles.action,
            styles.primary,
            pressed && styles.pressed,
            pending && styles.disabled,
          ]}
        >
          {pending ? <ActivityIndicator color={palette.card} size="small" /> : <Text style={styles.primaryText}>Save</Text>}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={pending}
          onPress={handleClear}
          style={({ pressed }) => [
            styles.action,
            styles.secondary,
            pressed && styles.pressed,
            pending && styles.disabled,
          ]}
        >
          <Text style={styles.secondaryText}>Clear</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    color: palette.ink,
    fontSize: typography.label,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: palette.surface,
    borderColor: palette.cloud,
    borderRadius: radius.md,
    borderWidth: 1,
    color: palette.ink,
    fontSize: typography.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  error: {
    color: palette.danger,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  action: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  primary: {
    backgroundColor: palette.accent,
  },
  secondary: {
    backgroundColor: palette.surface,
    borderColor: palette.cloud,
    borderWidth: 1,
  },
  primaryText: {
    color: palette.card,
    fontWeight: '700',
  },
  secondaryText: {
    color: palette.ink,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.85,
  },
});
