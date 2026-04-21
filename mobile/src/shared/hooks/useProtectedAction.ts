import { useCallback } from 'react';
import { authenticateBiometricAction } from '@/shared/security/biometricAuthentication';
import type { BiometricProtectedAction } from '@/shared/security/biometrics';

export function useProtectedAction() {
  const runProtectedAction = useCallback(
    async <T>(action: BiometricProtectedAction, callback: () => Promise<T> | T): Promise<T> => {
      await authenticateBiometricAction(action);
      return callback();
    },
    [],
  );

  return { runProtectedAction };
}