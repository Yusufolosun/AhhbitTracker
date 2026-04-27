import { describe, expect, it } from 'vitest';
import {
  buildHabitNotificationPlans,
  buildTransactionNotificationPlan,
  getHabitNotificationSummary,
  notificationPlanner,
  notificationTiming,
  toNotificationRecord,
} from '../mobile/src/features/notifications/planner';
import type { Habit } from '../mobile/src/core/types/habit';

function createHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    habitId: 42,
    owner: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
    name: 'Morning run',
    stakeAmount: 100_000,
    currentStreak: 5,
    lastCheckInBlock: 100,
    createdAtBlock: 90,
    isActive: true,
    isCompleted: false,
    bonusClaimed: false,
    ...overrides,
  };
}

describe('mobile notification planner', () => {
  it('schedules a check-in reminder before the deadline', () => {
    const habit = createHabit();
    const plans = buildHabitNotificationPlans({
      address: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      habit,
      currentBlock: 110,
      now: new Date('2026-04-20T12:00:00.000Z').getTime(),
    });

    expect(plans.upcomingReminders).toHaveLength(1);
    expect(plans.immediateNotifications).toHaveLength(0);
    expect(plans.upcomingReminders[0]).toMatchObject({
      key: notificationPlanner.buildHabitReminderKey(
        'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
        habit.habitId,
        habit.lastCheckInBlock,
      ),
      kind: 'habit-check-in-reminder',
      tone: 'warning',
      routePath: '/habits/42',
      habitId: 42,
    });
    expect(plans.upcomingReminders[0].deliverAt?.getTime()).toBeGreaterThan(new Date('2026-04-20T12:00:00.000Z').getTime());
  });

  it('emits urgent and withdrawal-ready alerts when the habit is in the final window', () => {
    const habit = createHabit({ currentStreak: 7 });
    const plans = buildHabitNotificationPlans({
      address: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      habit,
      currentBlock: 235,
      now: new Date('2026-04-20T12:00:00.000Z').getTime(),
    });

    expect(plans.upcomingReminders).toHaveLength(0);
    expect(plans.immediateNotifications.map((plan) => plan.kind)).toEqual(
      expect.arrayContaining(['habit-check-in-urgent', 'habit-withdrawal-ready']),
    );
  });

  it('emits an expired alert once the window is missed', () => {
    const habit = createHabit({ currentStreak: 5 });
    const plans = buildHabitNotificationPlans({
      address: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      habit,
      currentBlock: 250,
      now: new Date('2026-04-20T12:00:00.000Z').getTime(),
    });

    expect(plans.immediateNotifications).toHaveLength(1);
    expect(plans.immediateNotifications[0]).toMatchObject({
      kind: 'habit-check-in-expired',
      tone: 'danger',
      routePath: '/habits/42',
    });
  });

  it('builds transaction-specific confirmation copy', () => {
    const plan = buildTransactionNotificationPlan({
      txId: '0xtx-confirmed',
      functionName: 'check-in',
      status: 'confirmed',
    });

    expect(plan).toMatchObject({
      key: 'tx:0xtx-confirmed:confirmed',
      kind: 'transaction-confirmed',
      tone: 'success',
      title: 'Check-in confirmed',
      body: 'Your habit check-in was confirmed on chain.',
      routePath: '/preview',
      txId: '0xtx-confirmed',
    });
  });

  it('builds transaction failure copy even when the function is unknown', () => {
    const plan = buildTransactionNotificationPlan({
      txId: '0xtx-failed',
      functionName: null,
      status: 'failed',
    });

    expect(plan).toMatchObject({
      key: 'tx:0xtx-failed:failed',
      kind: 'transaction-failed',
      tone: 'danger',
      title: 'Transaction failed',
      body: 'A wallet transaction failed on chain.',
      routePath: '/preview',
      txId: '0xtx-failed',
    });
  });

  it('skips reminder generation when address is missing or habit is inactive', () => {
    const noAddressPlans = buildHabitNotificationPlans({
      address: null,
      habit: createHabit(),
      currentBlock: 120,
    });

    const inactivePlans = buildHabitNotificationPlans({
      address: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
      habit: createHabit({ isActive: false }),
      currentBlock: 120,
    });

    expect(noAddressPlans).toEqual({
      upcomingReminders: [],
      immediateNotifications: [],
    });
    expect(inactivePlans).toEqual({
      upcomingReminders: [],
      immediateNotifications: [],
    });
  });

  it('creates serializable notification records from plans', () => {
    const plan = buildTransactionNotificationPlan({
      txId: '0xtx-confirmed-2',
      functionName: 'create-habit',
      status: 'confirmed',
    });

    const record = toNotificationRecord(plan, 'record-1', new Date('2026-04-27T09:30:00.000Z'));

    expect(record).toMatchObject({
      id: 'record-1',
      kind: 'transaction-confirmed',
      txId: '0xtx-confirmed-2',
      routePath: '/preview',
      createdAt: '2026-04-27T09:30:00.000Z',
    });
  });

  it('returns notification summaries and timing constants for UI surfaces', () => {
    const habit = createHabit({ currentStreak: 7, lastCheckInBlock: 100 });

    expect(getHabitNotificationSummary(habit, null)).toBe('Waiting for block height');
    expect(getHabitNotificationSummary(habit, 235)).toBe('Check-in is urgent');
    expect(getHabitNotificationSummary(createHabit({ currentStreak: 7 }), 220)).toBe(
      'Withdrawal unlocked after 7 days',
    );

    expect(notificationTiming.approxBlockDurationMs).toBe(600_000);
    expect(notificationTiming.reminderLeadMs).toBeGreaterThan(0);
  });
});