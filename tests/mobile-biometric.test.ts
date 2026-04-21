import { describe, expect, it } from 'vitest';
import {
  getBiometricPromptMessage,
  isBiometricAuthSupported,
  mapBiometricError,
} from '../mobile/src/shared/security/biometrics';

describe('mobile biometric helpers', () => {
  it('maps protected actions to prompt copy', () => {
    expect(getBiometricPromptMessage('create-habit')).toBe('Approve this create-habit preview.');
    expect(getBiometricPromptMessage('check-in')).toBe('Approve this check-in preview.');
    expect(getBiometricPromptMessage('withdraw-stake')).toBe('Approve this withdrawal preview.');
    expect(getBiometricPromptMessage('claim-bonus')).toBe('Approve this bonus claim preview.');
    expect(getBiometricPromptMessage('save-address')).toBe('Approve saving this tracked address.');
    expect(getBiometricPromptMessage('clear-address')).toBe('Approve clearing this tracked address.');
  });

  it('treats web as unsupported and native enrolled hardware as supported', () => {
    expect(isBiometricAuthSupported('web', true, true)).toBe(false);
    expect(isBiometricAuthSupported('ios', true, true)).toBe(true);
    expect(isBiometricAuthSupported('android', true, false)).toBe(false);
  });

  it('maps biometric errors to user-facing copy', () => {
    expect(mapBiometricError('not_enrolled')).toContain('Face ID');
    expect(mapBiometricError('passcode_not_set')).toContain('device passcode');
    expect(mapBiometricError('lockout')).toContain('locked');
    expect(mapBiometricError('user_cancel')).toBe('Biometric authentication was cancelled.');
    expect(mapBiometricError('not_available')).toBe('Biometric authentication is not available on this device.');
    expect(mapBiometricError(undefined)).toBe('Biometric authentication failed.');
  });
});
