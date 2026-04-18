import * as Clipboard from 'expo-clipboard';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ContractCallPreview } from '@/core/types';
import { ActionButton, Card } from '@/shared/components';
import { palette, radius, spacing, typography } from '@/shared/theme';

interface TransactionPreviewPanelProps {
  preview: ContractCallPreview | null;
}

export function TransactionPreviewPanel({ preview }: TransactionPreviewPanelProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
  const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  const payloadText = useMemo(() => {
    if (!preview) {
      return '';
    }

    return JSON.stringify(preview, null, 2);
  }, [preview]);

  if (!preview) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Transaction Preview</Text>
        <Text style={styles.placeholder}>Select an action to generate a contract call payload.</Text>
      </View>
    );
  }

  const handleCopy = async () => {
    setCopyState('copying');

    if (copyResetTimeoutRef.current) {
      clearTimeout(copyResetTimeoutRef.current);
    }

    try {
      await Clipboard.setStringAsync(payloadText);
      setCopyState('copied');

      copyResetTimeoutRef.current = setTimeout(() => {
        setCopyState('idle');
      }, 1500);
    } catch {
      setCopyState('error');

      copyResetTimeoutRef.current = setTimeout(() => {
        setCopyState('idle');
      }, 1800);
    }
  };

  return (
    <Card style={styles.card} tone="inverse">
      <View style={styles.headerRow}>
        <Text style={styles.label}>Transaction Preview</Text>
        <ActionButton
          label={
            copyState === 'copied'
              ? 'Copied'
              : copyState === 'error'
                ? 'Copy failed'
                : 'Copy'
          }
          onPress={handleCopy}
          loading={copyState === 'copying'}
          loadingLabel="Copying"
          variant="ghost"
          style={styles.copyButton}
          textStyle={styles.copyButtonText}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator style={styles.payloadScroll}>
        <Text style={styles.payloadText}>{payloadText}</Text>
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: palette.cloud,
    fontSize: typography.label,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  payloadScroll: {
    marginTop: spacing.sm,
    maxHeight: 180,
  },
  payloadText: {
    color: '#D8E1F0',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  placeholder: {
    color: '#9DB0CC',
    marginTop: spacing.sm,
  },
  copyButton: {
    minHeight: 34,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  copyButtonText: {
    color: palette.card,
    fontSize: typography.label,
    fontWeight: '700',
  },
});
