import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ActionButton, Card } from '@/shared/components';
import { useProtectedAction } from '@/shared/hooks/useProtectedAction';
import { validateStacksAddress } from '@/shared/utils';
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
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { runProtectedAction } = useProtectedAction();

  const pending = isSaving || isClearing;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    const normalizedValue = value.trim();
    const validationError = validateStacksAddress(normalizedValue);

    if (validationError) {
      setError(validationError);
      setSuccess(null);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await runProtectedAction('save-address', () => onSubmit(normalizedValue));
      setSuccess('Address saved successfully.');
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to save address.',
      );
      setSuccess(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    setError(null);
    setSuccess(null);

    try {
      await runProtectedAction('clear-address', () => onClear());
      setValue('');
      setSuccess('Address cleared.');
    } catch (clearError) {
      setError(
        clearError instanceof Error
          ? clearError.message
          : 'Unable to clear address.',
      );
      setSuccess(null);
    } finally {
      setIsClearing(false);
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
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <View style={styles.row}>
        <ActionButton
          fullWidth
          label="Save"
          disabled={isClearing}
          loading={isSaving}
          loadingLabel="Saving"
          onPress={handleSave}
          style={styles.action}
        />
        <ActionButton
          fullWidth
          label="Clear"
          disabled={isSaving}
          loading={isClearing}
          loadingLabel="Clearing"
          onPress={handleClear}
          variant="secondary"
          style={styles.action}
        />
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
  success: {
    color: palette.success,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  action: {
    flex: 1,
  },
});
