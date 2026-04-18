import * as Clipboard from 'expo-clipboard';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { buildWalletPreviewLink, buildWalletReturnLink } from '../linking';
import type { WalletInteractionState } from '../types';
import type { ContractCallPreview } from '@/core/types';
import { ActionButton, Card } from '@/shared/components';
import { palette, radius, spacing, typography } from '@/shared/theme';

interface WalletInteractionCardProps {
  preview: ContractCallPreview | null;
  walletInteraction: WalletInteractionState | null;
}

function CopyButton({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    setCopyState('copying');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      await Clipboard.setStringAsync(value);
      setCopyState('copied');

      timeoutRef.current = setTimeout(() => {
        setCopyState('idle');
      }, 1200);
    } catch {
      setCopyState('error');

      timeoutRef.current = setTimeout(() => {
        setCopyState('idle');
      }, 1800);
    }
  };

  return (
    <ActionButton
      label={
        copyState === 'copied'
          ? 'Copied'
          : copyState === 'error'
            ? 'Copy failed'
            : label
      }
      onPress={handleCopy}
      loading={copyState === 'copying'}
      loadingLabel="Copying"
      variant="ghost"
      style={styles.copyButton}
      textStyle={styles.copyButtonText}
    />
  );
}

export function WalletInteractionCard({ preview, walletInteraction }: WalletInteractionCardProps) {
  const previewLink = useMemo(() => {
    if (walletInteraction?.previewLink) {
      return walletInteraction.previewLink;
    }

    if (preview) {
      return buildWalletPreviewLink(preview);
    }

    return null;
  }, [preview, walletInteraction?.previewLink]);

  const functionName = walletInteraction?.functionName ?? preview?.functionName ?? undefined;

  const returnLink = useMemo(() => {
    if (!walletInteraction?.txId || !walletInteraction.status) {
      return null;
    }

    if (walletInteraction.returnLink) {
      return walletInteraction.returnLink;
    }

    return buildWalletReturnLink(walletInteraction.txId, walletInteraction.status, functionName);
  }, [functionName, walletInteraction]);

  if (!previewLink && !returnLink) {
    return null;
  }

  return (
    <Card style={styles.card} tone="inverse">
      <Text style={styles.label}>Wallet deep links</Text>
      {walletInteraction?.txId && walletInteraction.status ? (
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Wallet result</Text>
          <Text style={styles.summaryText}>
            {walletInteraction.status} · {walletInteraction.txId}
          </Text>
        </View>
      ) : null}
      {previewLink ? (
        <View style={styles.block}>
          <Text style={styles.blockLabel}>Preview link</Text>
          <Text style={styles.linkText}>{previewLink}</Text>
          <CopyButton label="Copy preview link" value={previewLink} />
        </View>
      ) : null}
      {returnLink ? (
        <View style={styles.block}>
          <Text style={styles.blockLabel}>Return link</Text>
          <Text style={styles.linkText}>{returnLink}</Text>
          <CopyButton label="Copy return link" value={returnLink} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  label: {
    color: palette.cloud,
    fontSize: typography.label,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  block: {
    marginTop: spacing.sm,
  },
  summary: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  summaryLabel: {
    color: '#D8E1F0',
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: 2,
  },
  summaryText: {
    color: '#9DB0CC',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  blockLabel: {
    color: '#D8E1F0',
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  linkText: {
    color: '#9DB0CC',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  copyButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
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
