import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActionButton } from '../components/ui/ActionButton';
import { CalloutCard } from '../components/ui/CalloutCard';
import { EmptyStateCard } from '../components/ui/EmptyStateCard';
import { SurfaceCard } from '../components/ui/SurfaceCard';

describe('SurfaceCard', () => {
  it('applies the accent tone classes', () => {
    const { container } = render(<SurfaceCard tone="accent">Content</SurfaceCard>);

    expect(container.firstChild).toHaveClass('bg-primary-50');
    expect(screen.getByText('Content')).toBeDefined();
  });
});

describe('ActionButton', () => {
  it('renders loading copy and disables interaction', () => {
    render(<ActionButton label="Save" loading loadingLabel="Saving" />);

    const button = screen.getByRole('button');
    expect(button).toHaveProperty('disabled', true);
    expect(screen.getByText('Saving')).toBeDefined();
  });
});

describe('CalloutCard', () => {
  it('renders title and description', () => {
    render(<CalloutCard title="Notice" tone="warning" description="Try again later" />);

    expect(screen.getByText('Notice')).toBeDefined();
    expect(screen.getByText('Try again later')).toBeDefined();
  });
});

describe('EmptyStateCard', () => {
  it('renders an action button when provided', () => {
    const onAction = vi.fn();

    render(
      <EmptyStateCard
        title="No habits"
        description="Create your first habit"
        actionLabel="Create habit"
        onAction={onAction}
      />
    );

    expect(screen.getByText('No habits')).toBeDefined();
    expect(screen.getByText('Create habit')).toBeDefined();
  });
});