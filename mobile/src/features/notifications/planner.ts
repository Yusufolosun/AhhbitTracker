import { CHECK_IN_WINDOW_BLOCKS } from '../../core/config/constants';
import type { Habit } from '../../core/types/habit';
import type { MobileTxType } from '../../core/types/transaction';
import { formatStreakDays } from '../../shared/utils/formatting';
import { canWithdrawHabit } from '../../shared/utils/withdrawal';
import { getMobileCheckInWindowState } from '../../shared/utils/checkInWindow';
import type { NotificationPlan, NotificationRecord } from './types';

const APPROX_BLOCK_DURATION_MS = 10 * 60 * 1000;
const CHECK_IN_REMINDER_LEAD_BLOCKS = CHECK_IN_WINDOW_BLOCKS - 132;
const CHECK_IN_REMINDER_LEAD_MS = CHECK_IN_REMINDER_LEAD_BLOCKS * APPROX_BLOCK_DURATION_MS;

function normalizeAddress(address: string): string {
  return address.trim().toUpperCase();
}

function buildHabitRoute(habitId: number): string {
  return `/habits/${habitId}`;
}

function buildPreviewRoute(): string {
  return '/preview';
}

function buildHabitReminderKey(
  address: string,
  habitId: number,
  lastCheckInBlock: number,
): string {
  return `habit:${normalizeAddress(address)}:${habitId}:${lastCheckInBlock}:reminder`;
}

function buildHabitEventKey(
  address: string,
  habitId: number,
  lastCheckInBlock: number,
  kind: 'urgent' | 'expired' | 'withdrawal-ready',
): string {
  return `habit:${normalizeAddress(address)}:${habitId}:${lastCheckInBlock}:${kind}`;
}

function buildTransactionEventKey(txId: string, status: 'confirmed' | 'failed'): string {
  return `tx:${txId}:${status}`;
}

function createPlan(partial: Omit<NotificationPlan, 'routePath'> & { routePath?: string }): NotificationPlan {
  return {
    ...partial,
    routePath: partial.routePath ?? buildPreviewRoute(),
  };
}

export interface HabitNotificationPlanSet {
  upcomingReminders: NotificationPlan[];
  immediateNotifications: NotificationPlan[];
}

export function buildHabitNotificationPlans(params: {
  address: string | null;
  habit: Habit;
  currentBlock: number | null;
  now?: number;
}): HabitNotificationPlanSet {
  const { address, habit, currentBlock, now = Date.now() } = params;
  const upcomingReminders: NotificationPlan[] = [];
  const immediateNotifications: NotificationPlan[] = [];

  if (!address || currentBlock === null || !habit.isActive || habit.isCompleted) {
    return { upcomingReminders, immediateNotifications };
  }

  const reminderBlock = habit.lastCheckInBlock + CHECK_IN_WINDOW_BLOCKS - CHECK_IN_REMINDER_LEAD_BLOCKS;
  const reminderBlockDistance = reminderBlock - currentBlock;

  if (reminderBlockDistance > 0) {
    const reminderDeliverAt = new Date(now + reminderBlockDistance * APPROX_BLOCK_DURATION_MS);
    upcomingReminders.push(
      createPlan({
        key: buildHabitReminderKey(address, habit.habitId, habit.lastCheckInBlock),
        kind: 'habit-check-in-reminder',
        tone: 'warning',
        title: 'Check-in reminder',
        body: `${habit.name} will need a check-in in about 2 hours.`,
        routePath: buildHabitRoute(habit.habitId),
        habitId: habit.habitId,
        deliverAt: reminderDeliverAt,
      }),
    );
  }

  const checkInWindowState = getMobileCheckInWindowState(habit, currentBlock);

  if (checkInWindowState === 'urgent') {
    immediateNotifications.push(
      createPlan({
        key: buildHabitEventKey(address, habit.habitId, habit.lastCheckInBlock, 'urgent'),
        kind: 'habit-check-in-urgent',
        tone: 'warning',
        title: 'Check-in is urgent',
        body: `${habit.name} is inside the final 2-hour check-in window.`,
        routePath: buildHabitRoute(habit.habitId),
        habitId: habit.habitId,
      }),
    );
  }

  if (checkInWindowState === 'expired') {
    immediateNotifications.push(
      createPlan({
        key: buildHabitEventKey(address, habit.habitId, habit.lastCheckInBlock, 'expired'),
        kind: 'habit-check-in-expired',
        tone: 'danger',
        title: 'Check-in window missed',
        body: `${habit.name} missed the 24-hour check-in window.`,
        routePath: buildHabitRoute(habit.habitId),
        habitId: habit.habitId,
      }),
    );
  }

  if (canWithdrawHabit(habit)) {
    immediateNotifications.push(
      createPlan({
        key: buildHabitEventKey(address, habit.habitId, habit.lastCheckInBlock, 'withdrawal-ready'),
        kind: 'habit-withdrawal-ready',
        tone: 'success',
        title: 'Withdrawal unlocked',
        body: `${habit.name} reached ${formatStreakDays(habit.currentStreak)} and can withdraw its stake.`,
        routePath: buildHabitRoute(habit.habitId),
        habitId: habit.habitId,
      }),
    );
  }

  return { upcomingReminders, immediateNotifications };
}

export function buildTransactionNotificationPlan(params: {
  txId: string;
  functionName: MobileTxType | null;
  status: 'confirmed' | 'failed';
}): NotificationPlan {
  const { txId, functionName, status } = params;

  if (status === 'confirmed') {
    const details: Record<MobileTxType, { title: string; body: string }> = {
      'create-habit': {
        title: 'Habit created',
        body: 'Your new habit transaction was confirmed on chain.',
      },
      'check-in': {
        title: 'Check-in confirmed',
        body: 'Your habit check-in was confirmed on chain.',
      },
      'withdraw-stake': {
        title: 'Stake withdrawal confirmed',
        body: 'Your stake withdrawal was confirmed on chain.',
      },
      'claim-bonus': {
        title: 'Bonus claim confirmed',
        body: 'Your bonus claim was confirmed on chain.',
      },
    };

    const resolved = functionName ? details[functionName] : null;

    return createPlan({
      key: buildTransactionEventKey(txId, 'confirmed'),
      kind: 'transaction-confirmed',
      tone: 'success',
      title: resolved?.title ?? 'Transaction confirmed',
      body: resolved?.body ?? 'A wallet transaction was confirmed on chain.',
      routePath: buildPreviewRoute(),
      txId,
    });
  }

  return createPlan({
    key: buildTransactionEventKey(txId, 'failed'),
    kind: 'transaction-failed',
    tone: 'danger',
    title: 'Transaction failed',
    body: functionName
      ? `The ${functionName.replace('-', ' ')} transaction failed on chain.`
      : 'A wallet transaction failed on chain.',
    routePath: buildPreviewRoute(),
    txId,
  });
}

export function toNotificationRecord(plan: NotificationPlan, id: string, createdAt = new Date()): NotificationRecord {
  return {
    id,
    kind: plan.kind,
    tone: plan.tone,
    title: plan.title,
    body: plan.body,
    routePath: plan.routePath,
    createdAt: createdAt.toISOString(),
    habitId: plan.habitId,
    txId: plan.txId,
  };
}

export function getHabitNotificationSummary(habit: Habit, currentBlock: number | null): string {
  if (currentBlock === null) {
    return 'Waiting for block height';
  }

  const state = getMobileCheckInWindowState(habit, currentBlock);

  if (state === 'urgent') {
    return 'Check-in is urgent';
  }

  if (state === 'expired') {
    return 'Check-in window missed';
  }

  if (canWithdrawHabit(habit)) {
    return `Withdrawal unlocked after ${formatStreakDays(habit.currentStreak)}`;
  }

  return 'Reminder scheduled';
}

export const notificationPlanner = {
  buildHabitReminderKey,
  buildHabitEventKey,
  buildTransactionEventKey,
};

export const notificationTiming = {
  approxBlockDurationMs: APPROX_BLOCK_DURATION_MS,
  reminderLeadBlocks: CHECK_IN_REMINDER_LEAD_BLOCKS,
  reminderLeadMs: CHECK_IN_REMINDER_LEAD_MS,
};