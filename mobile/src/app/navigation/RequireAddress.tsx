import type { PropsWithChildren } from 'react';
import { useAddressState } from '@/app/state';
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
  const { activeAddress } = useAddressState();

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
