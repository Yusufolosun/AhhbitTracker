import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HabitForm } from '../components/HabitForm';

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

    expect(screen.getByLabelText('Stake Amount (STX)')).toHaveValue(0.02);
    expect(screen.getByText('Min 0.02 STX · Max 100 STX')).toBeDefined();
  });

  it('caps habit names at the contract limit', () => {
    render(<HabitForm />);

    expect(screen.getByLabelText('Habit Name')).toHaveAttribute('maxlength', '50');
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
    fireEvent.click(screen.getByRole('button', { name: 'Create Habit' }));

    expect(await screen.findByText('Maximum stake is 100 STX')).toBeDefined();
    expect(createHabit).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });
});