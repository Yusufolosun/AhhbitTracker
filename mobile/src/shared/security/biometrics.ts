export type BiometricProtectedAction =
  | 'create-habit'
  | 'check-in'
  | 'withdraw-stake'
  | 'claim-bonus'
  | 'save-address'
  | 'clear-address';

const BIOMETRIC_PROMPTS: Record<BiometricProtectedAction, string> = {
  'create-habit': 'Approve this create-habit preview.',
  'check-in': 'Approve this check-in preview.',
  'withdraw-stake': 'Approve this withdrawal preview.',
  'claim-bonus': 'Approve this bonus claim preview.',
  'save-address': 'Approve saving this tracked address.',
  'clear-address': 'Approve clearing this tracked address.',
};

export function getBiometricPromptMessage(action: BiometricProtectedAction): string {
  return BIOMETRIC_PROMPTS[action];
}

export function isBiometricAuthSupported(
  platform: string,
  hasHardware: boolean,
  isEnrolled: boolean,
): boolean {
  return platform !== 'web' && hasHardware && isEnrolled;
}

export function mapBiometricError(error: string | undefined): string {
  switch (error) {
    case 'not_enrolled':
      return 'Set up Face ID, Touch ID, or fingerprint authentication on this device to continue.';
    case 'passcode_not_set':
      return 'Set a device passcode or biometric lock to continue.';
    case 'lockout':
      return 'Biometric authentication is locked. Try again later.';
    case 'user_cancel':
    case 'app_cancel':
    case 'system_cancel':
    case 'user_fallback':
      return 'Biometric authentication was cancelled.';
    case 'not_available':
      return 'Biometric authentication is not available on this device.';
    default:
      return 'Biometric authentication failed.';
  }
}