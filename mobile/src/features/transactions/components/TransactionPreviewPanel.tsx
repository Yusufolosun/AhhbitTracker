import * as Clipboard from 'expo-clipboard';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ContractCallPreview } from '@/core/types';
import { palette, radius, spacing, typography } from '@/shared/theme';

interface TransactionPreviewPanelProps {
  preview: ContractCallPreview | null;
}

export function TransactionPreviewPanel({ preview }: TransactionPreviewPanelProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
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
    await Clipboard.setStringAsync(payloadText);
    setCopyState('copied');

    if (copyResetTimeoutRef.current) {
      clearTimeout(copyResetTimeoutRef.current);
    }

    copyResetTimeoutRef.current = setTimeout(() => {
      setCopyState('idle');
    }, 1500);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Transaction Preview</Text>
        <Pressable onPress={handleCopy} style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}>
          <Text style={styles.copyButtonText}>{copyState === 'copied' ? 'Copied' : 'Copy'}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator style={styles.payloadScroll}>
        <Text style={styles.payloadText}>{payloadText}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A1020',
    borderRadius: radius.lg,
    marginTop: spacing.md,
    padding: spacing.md,
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
    backgroundColor: '#1E293B',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  copyButtonText: {
    color: palette.card,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
