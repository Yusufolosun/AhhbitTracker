export type MobileAnalyticsEventName =
  | 'app_loaded'
  | 'route_viewed'
  | 'address_saved'
  | 'address_cleared'
  | 'preview_generated'
  | 'explorer_opened'
  | 'notifications_toggled'
  | 'notification_history_cleared'
  | 'wallet_tx_confirmed'
  | 'wallet_tx_failed';

export interface MobileAnalyticsPayload {
  route?: string;
  source?: string;
  walletAddressHash?: string;
  habitId?: number;
  functionName?: string | null;
  state?: string;
  errorMessage?: string;
}