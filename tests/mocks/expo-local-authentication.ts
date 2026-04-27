export async function hasHardwareAsync(): Promise<boolean> {
  return true;
}

export async function isEnrolledAsync(): Promise<boolean> {
  return true;
}

export async function authenticateAsync(): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}
