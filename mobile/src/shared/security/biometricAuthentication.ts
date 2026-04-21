import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import {
  getBiometricPromptMessage,
  isBiometricAuthSupported,
  mapBiometricError,
  type BiometricProtectedAction,
} from './biometrics';

export async function authenticateBiometricAction(action: BiometricProtectedAction): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);

  if (!isBiometricAuthSupported(Platform.OS, hasHardware, isEnrolled)) {
    return;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: getBiometricPromptMessage(action),
    promptDescription: 'Confirm this sensitive account action.',
    cancelLabel: 'Cancel',
    fallbackLabel: 'Use passcode',
    biometricsSecurityLevel: 'strong',
    disableDeviceFallback: false,
    requireConfirmation: true,
  });

  if (!result.success) {
    throw new Error(mapBiometricError(result.error));
  }
}