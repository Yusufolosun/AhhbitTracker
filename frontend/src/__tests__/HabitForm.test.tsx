import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HabitForm } from '../components/HabitForm';
import { MAX_HABIT_NAME_LENGTH, MAX_STAKE_AMOUNT, MIN_STAKE_AMOUNT } from '../utils/constants';

const createHabit = vi.fn().mockResolvedValue('tx-create');
const showToast = vi.fn();

vi.mock('../hooks/useHabits', () => ({
  useHabits: () => ({
    createHabit,
    isCreatingHabit: false,
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    showToast,
  }),
}));

describe('HabitForm', () => {
  beforeEach(() => {
    createHabit.mockClear();
    showToast.mockClear();
  });

  it('starts with the contract minimum stake', () => {
    render(<HabitForm />);

    expect(screen.getByLabelText('Stake Amount (STX)')).toHaveValue(MIN_STAKE_AMOUNT / 1_000_000);
    expect(
      screen.getByText(
        `Min ${(MIN_STAKE_AMOUNT / 1_000_000).toFixed(2)} STX · Max ${(MAX_STAKE_AMOUNT / 1_000_000).toFixed(0)} STX`,
      ),
    ).toBeDefined();
  });

  it('caps habit names at the contract limit', () => {
    render(<HabitForm />);

    expect(screen.getByLabelText('Habit Name')).toHaveAttribute(
      'maxlength',
      MAX_HABIT_NAME_LENGTH.toString(),
    );
  });

  it('submits a trimmed habit name and microSTX stake', async () => {
    render(<HabitForm />);

    fireEvent.change(screen.getByLabelText('Habit Name'), {
      target: { value: '  Daily Exercise  ' },
    });
    fireEvent.change(screen.getByLabelText('Stake Amount (STX)'), {
      target: { value: '0.5' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Habit' }));

    await waitFor(() => expect(createHabit).toHaveBeenCalledTimes(1));
    expect(createHabit).toHaveBeenCalledWith({
      name: 'Daily Exercise',
      stakeAmount: 500000,
    });
    expect(showToast).toHaveBeenCalledWith(
      'Transaction signed! Your habit will appear once confirmed on-chain.',
      'success',
    );
  });

  it('rejects a stake above the contract maximum', async () => {
    render(<HabitForm />);

    fireEvent.change(screen.getByLabelText('Habit Name'), {
      target: { value: 'Daily Exercise' },
    });
    fireEvent.change(screen.getByLabelText('Stake Amount (STX)'), {
      target: { value: '101' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Create Habit' }).closest('form'));

    expect(await screen.findByText('Maximum stake is 100 STX')).toBeDefined();
    expect(createHabit).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });

  it('locks the form after signing and unlocks after the cooldown', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    render(<HabitForm />);

    fireEvent.change(screen.getByLabelText('Habit Name'), {
      target: { value: 'Daily Exercise' },
    });
    fireEvent.change(screen.getByLabelText('Stake Amount (STX)'), {
      target: { value: '0.5' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Habit' }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(createHabit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Waiting for confirmation/ })).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(45_000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole('button', { name: 'Create Habit' })).toBeEnabled();

    vi.useRealTimers();
  });
});