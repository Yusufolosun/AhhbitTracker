export const AndroidImportance = {
  HIGH: 'high',
};

export const SchedulableTriggerInputTypes = {
  DATE: 'date',
};

export async function getPermissionsAsync() {
  return { status: 'undetermined', granted: false };
}

export async function requestPermissionsAsync() {
  return { status: 'granted', granted: true };
}

export function setNotificationHandler(_handler: unknown): void {
  return;
}

export async function setNotificationChannelAsync(_id: string, _config: unknown): Promise<void> {
  return;
}

export async function scheduleNotificationAsync(_input: unknown): Promise<string> {
  return 'notification-id';
}

export async function cancelScheduledNotificationAsync(_identifier: string): Promise<void> {
  return;
}

export function addNotificationResponseReceivedListener(
  _listener: (response: { notification: { request: { content: { data: Record<string, unknown> } } } }) => void,
) {
  return {
    remove: () => undefined,
  };
}

export async function getLastNotificationResponseAsync() {
  return null;
}
