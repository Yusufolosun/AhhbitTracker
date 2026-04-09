import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LongestStreakBanner } from '../components/LongestStreakBanner';

describe('LongestStreakBanner', () => {
  it('shows loading skeleton when loading', () => {
    const { container } = render(
      <LongestStreakBanner longestStreak={0} hasHabits={false} isLoading={true} />
    );

    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('shows empty-state copy when user has no habits', () => {
    render(<LongestStreakBanner longestStreak={0} hasHabits={false} isLoading={false} />);

    expect(screen.getByText('Longest Streak')).toBeDefined();
    expect(screen.getByText('0 days')).toBeDefined();
    expect(screen.getByText(/create your first habit/i)).toBeDefined();
  });

  it('shows best habit name when habits exist', () => {
    render(
      <LongestStreakBanner
        longestStreak={17}
        habitName="Morning Run"
        hasHabits={true}
        isLoading={false}
      />
    );

    expect(screen.getByText('17 days')).toBeDefined();
    expect(screen.getByText('Best run: Morning Run')).toBeDefined();
  });
});