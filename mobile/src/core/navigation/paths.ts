export const ROUTE_PATHS = {
  overview: 'overview',
  habits: 'habits',
  notifications: 'notifications',
  preview: 'preview',
  account: 'account',
  habitDetails: 'habits/:habitId',
  createHabit: 'habits/create',
} as const;

export function buildPreviewPath(): string {
  return `/${ROUTE_PATHS.preview}`;
}

export function buildHabitDetailsPath(habitId: number): string {
  return `/${ROUTE_PATHS.habitDetails.replace(':habitId', String(habitId))}`;
}
