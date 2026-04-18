import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton, Card } from '@/shared/components';
import { palette, radius, spacing, typography } from '@/shared/theme';
import { MAX_HABIT_NAME_LENGTH, MAX_STAKE_AMOUNT, MIN_STAKE_AMOUNT } from '@/core/config';
import { validateHabitName, validateHabitStake } from '@/shared/utils';

interface CreateHabitPreviewCardProps {
  onPreview: (name: string, stakeAmountStx: number) => Promise<void> | void;
}

function normalizeStake(value: string): number {
  if (!value.trim()) {
    return Number.NaN;
  }

  return Number.parseFloat(value);
}

export function CreateHabitPreviewCard({ onPreview }: CreateHabitPreviewCardProps) {
  const minStakeStx = MIN_STAKE_AMOUNT / 1_000_000;
  const maxStakeStx = MAX_STAKE_AMOUNT / 1_000_000;
  const [habitName, setHabitName] = useState('');
  const [stake, setStake] = useState('0.02');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isDisabled = useMemo(
    () => !habitName.trim() || !stake.trim() || isGenerating,
    [habitName, isGenerating, stake],
  );

  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [habitName, stake]);

  const handlePreview = async () => {
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

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      await onPreview(normalizedName, stakeAmount);
      setSuccess('Create-habit preview generated.');
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : 'Unable to generate create-habit preview.',
      );
      setSuccess(null);
    } finally {
      setIsGenerating(false);
    }
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
        maxLength={MAX_HABIT_NAME_LENGTH}
      />
      <TextInput
        keyboardType="decimal-pad"
        onChangeText={setStake}
        placeholder="Stake in STX"
        placeholderTextColor={palette.steel}
        style={styles.input}
        value={stake}
      />
      <Text style={styles.hint}>
        Min {minStakeStx} STX · Max {maxStakeStx} STX · Up to {MAX_HABIT_NAME_LENGTH} characters
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <ActionButton
        fullWidth
        label="Generate create-habit preview"
        disabled={isDisabled}
        loading={isGenerating}
        loadingLabel="Generating"
        onPress={handlePreview}
        style={styles.previewButton}
      />
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
  success: {
    color: palette.success,
    marginBottom: spacing.sm,
  },
  hint: {
    color: palette.steel,
    fontSize: typography.label,
    marginBottom: spacing.sm,
  },
  previewButton: {
    marginTop: spacing.sm,
  },
});
