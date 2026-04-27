import { beforeEach, describe, expect, it, vi } from 'vitest';

const hasHardwareAsync = vi.fn();
const isEnrolledAsync = vi.fn();
const authenticateAsync = vi.fn();

const platform = { OS: 'ios' };

vi.mock('react-native', () => ({
  Platform: platform,
}));

vi.mock('expo-local-authentication', () => ({
  hasHardwareAsync,
  isEnrolledAsync,
  authenticateAsync,
}));

beforeEach(() => {
  vi.clearAllMocks();
  platform.OS = 'ios';
  hasHardwareAsync.mockResolvedValue(true);
  isEnrolledAsync.mockResolvedValue(true);
  authenticateAsync.mockResolvedValue({ success: true });
});

async function loadAuthModule() {
  vi.resetModules();
  return import('../mobile/src/shared/security/biometricAuthentication');
}

describe('mobile biometric authentication', () => {
  it('skips biometric prompt on web', async () => {
    platform.OS = 'web';
    const { authenticateBiometricAction } = await loadAuthModule();

    await expect(authenticateBiometricAction('check-in')).resolves.toBeUndefined();
    expect(hasHardwareAsync).not.toHaveBeenCalled();
    expect(authenticateAsync).not.toHaveBeenCalled();
  });

  it('skips biometric prompt when hardware is unavailable', async () => {
    hasHardwareAsync.mockResolvedValueOnce(false);
    const { authenticateBiometricAction } = await loadAuthModule();

    await expect(authenticateBiometricAction('save-address')).resolves.toBeUndefined();
    expect(authenticateAsync).not.toHaveBeenCalled();
  });

  it('resolves when authentication succeeds', async () => {
    const { authenticateBiometricAction } = await loadAuthModule();

    await expect(authenticateBiometricAction('withdraw-stake')).resolves.toBeUndefined();
    expect(authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        promptMessage: 'Approve this withdrawal preview.',
        fallbackLabel: 'Use passcode',
        requireConfirmation: true,
      }),
    );
  });

  it('throws a mapped error when authentication fails', async () => {
    authenticateAsync.mockResolvedValueOnce({ success: false, error: 'not_enrolled' });
    const { authenticateBiometricAction } = await loadAuthModule();

    await expect(authenticateBiometricAction('clear-address')).rejects.toThrow(
      'Set up Face ID, Touch ID, or fingerprint authentication on this device to continue.',
    );
  });
});
