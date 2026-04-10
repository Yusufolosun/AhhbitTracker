import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Card } from '@/shared/components';
import { palette, radius, spacing, typography } from '@/shared/theme';
import { validateHabitName, validateHabitStake } from '@/shared/utils';

interface CreateHabitPreviewCardProps {
  onPreview: (name: string, stakeAmountStx: number) => void;
}

function normalizeStake(value: string): number {
  if (!value.trim()) {
    return Number.NaN;
  }

  return Number.parseFloat(value);
}

export function CreateHabitPreviewCard({ onPreview }: CreateHabitPreviewCardProps) {
  const [habitName, setHabitName] = useState('');
  const [stake, setStake] = useState('0.02');
  const [error, setError] = useState<string | null>(null);

  const isDisabled = useMemo(() => !habitName.trim() || !stake.trim(), [habitName, stake]);

  const handlePreview = () => {
    const normalizedName = habitName.trim();
    const stakeAmount = normalizeStake(stake);

    const nameError = validateHabitName(normalizedName);
    if (nameError) {
      setError(nameError);
      return;
    }

    const stakeError = validateHabitStake(stakeAmount);
    if (stakeError) {
      setError(stakeError);
      return;
    }

    setError(null);
    onPreview(normalizedName, stakeAmount);
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Create Habit Preview</Text>
      <TextInput
        autoCorrect={false}
        onChangeText={setHabitName}
        placeholder="Habit name"
        placeholderTextColor={palette.steel}
        style={styles.input}
        value={habitName}
      />
      <TextInput
        keyboardType="decimal-pad"
        onChangeText={setStake}
        placeholder="Stake in STX"
        placeholderTextColor={palette.steel}
        style={styles.input}
        value={stake}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        onPress={handlePreview}
        style={({ pressed }) => [
          styles.previewButton,
          isDisabled && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.previewButtonText}>Generate create-habit preview</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
  },
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
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  error: {
    color: palette.danger,
    marginBottom: spacing.sm,
  },
  previewButton: {
    alignItems: 'center',
    backgroundColor: palette.accent,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 44,
  },
  previewButtonText: {
    color: palette.card,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
