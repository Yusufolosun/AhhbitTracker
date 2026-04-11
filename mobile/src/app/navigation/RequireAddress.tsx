import type { PropsWithChildren } from 'react';
import { useAddress } from '@/features/address';
import { EmptyState, Screen, SectionHeader } from '@/shared/components';

interface RequireAddressProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  message: string;
}

export function RequireAddress({
  title,
  subtitle,
  message,
  children,
}: RequireAddressProps) {
  const { activeAddress } = useAddress();

  if (!activeAddress) {
    return (
      <Screen>
        <SectionHeader title={title} subtitle={subtitle} />
        <EmptyState message={message} />
      </Screen>
    );
  }

  return <>{children}</>;
}
