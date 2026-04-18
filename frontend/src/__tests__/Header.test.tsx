import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../components/Header';

const mocks = vi.hoisted(() => ({
  useWallet: vi.fn(),
  useToast: vi.fn(),
  useHashRoute: vi.fn(),
}));

vi.mock('../context/WalletContext', () => ({
  useWallet: mocks.useWallet,
}));

vi.mock('../context/ToastContext', () => ({
  useToast: mocks.useToast,
}));

vi.mock('../hooks/useHashRoute', () => ({
  useHashRoute: mocks.useHashRoute,
}));

vi.mock('../components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe('Header wallet interactions', () => {
  const disconnect = vi.fn();
  const connect = vi.fn();
  const showToast = vi.fn();

  beforeEach(() => {
    disconnect.mockReset();
    connect.mockReset();
    showToast.mockReset();

    mocks.useHashRoute.mockReturnValue({ route: 'dashboard' });
    mocks.useToast.mockReturnValue({ showToast });
  });

  it('disables disconnect while operation is in-flight', () => {
    mocks.useWallet.mockReturnValue({
      walletState: {
        isConnected: true,
        address: 'SP1234567890ABCDEFGHJKLMNPQRSTUVWXYZ1234',
        balance: 0,
      },
      connect,
      disconnect,
      refreshBalance: vi.fn(),
      isLoading: false,
      isBalanceLoading: false,
      isDisconnecting: true,
    });

    render(<Header />);

    const disconnectButton = screen.getByRole('button', { name: 'Disconnect wallet' });
    expect(disconnectButton).toBeDisabled();
    expect(screen.getByText('Loading…')).toBeDefined();
  });

  it('shows success toast after disconnect completes', async () => {
    disconnect.mockResolvedValue(undefined);

    mocks.useWallet.mockReturnValue({
      walletState: {
        isConnected: true,
        address: 'SP1234567890ABCDEFGHJKLMNPQRSTUVWXYZ1234',
        balance: 0,
      },
      connect,
      disconnect,
      refreshBalance: vi.fn(),
      isLoading: false,
      isBalanceLoading: false,
      isDisconnecting: false,
    });

    render(<Header />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Disconnect wallet' }));

    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith('Wallet disconnected.', 'success');
  });

  it('shows error toast when disconnect fails', async () => {
    disconnect.mockRejectedValue(new Error('Disconnect failed'));

    mocks.useWallet.mockReturnValue({
      walletState: {
        isConnected: true,
        address: 'SP1234567890ABCDEFGHJKLMNPQRSTUVWXYZ1234',
        balance: 0,
      },
      connect,
      disconnect,
      refreshBalance: vi.fn(),
      isLoading: false,
      isBalanceLoading: false,
      isDisconnecting: false,
    });

    render(<Header />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Disconnect wallet' }));

    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith('Disconnect failed', 'error');
  });
});
