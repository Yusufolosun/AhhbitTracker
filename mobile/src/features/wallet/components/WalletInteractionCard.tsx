import * as Clipboard from 'expo-clipboard';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { buildWalletPreviewLink, buildWalletReturnLink } from '../linking';
import type { WalletInteractionState } from '../types';
import type { ContractCallPreview } from '@/core/types';
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
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(value);
    setCopied(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  return (
    <Pressable
      onPress={handleCopy}
      style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
    >
      <Text style={styles.copyButtonText}>{copied ? 'Copied' : label}</Text>
    </Pressable>
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

  const returnLink = useMemo(() => {
    if (!walletInteraction?.txId || !walletInteraction.status) {
      return null;
    }

    if (walletInteraction.returnLink) {
      return walletInteraction.returnLink;
    }

    return buildWalletReturnLink(walletInteraction.txId, walletInteraction.status);
  }, [walletInteraction]);

  if (!previewLink && !returnLink) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Wallet deep links</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A1020',
    borderRadius: radius.lg,
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
    backgroundColor: '#1E293B',
    borderRadius: radius.md,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  copyButtonText: {
    color: palette.card,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
});
