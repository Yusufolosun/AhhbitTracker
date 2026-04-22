export type AnalyticsEventName =
  | 'app_loaded'
  | 'route_viewed'
  | 'wallet_connect_started'
  | 'wallet_connected'
  | 'wallet_connect_cancelled'
  | 'wallet_disconnect_clicked'
  | 'wallet_disconnected'
  | 'habit_create_submitted'
  | 'habit_create_succeeded'
  | 'habit_create_failed'
  | 'habit_check_in_clicked'
  | 'habit_check_in_succeeded'
  | 'habit_check_in_failed'
  | 'habit_withdraw_clicked'
  | 'habit_withdraw_succeeded'
  | 'habit_withdraw_failed'
  | 'habit_claim_clicked'
  | 'habit_claim_succeeded'
  | 'habit_claim_failed'
  | 'habit_finalize_clicked'
  | 'habit_finalize_succeeded'
  | 'habit_finalize_failed'
  | 'daily_check_in_started'
  | 'daily_check_in_completed';

export interface AnalyticsEventPayload {
  route?: string;
  source?: string;
  walletAddressHash?: string;
  habitId?: number;
  habitNameLength?: number;
  stakeAmountMicroStx?: number;
  functionName?: string;
  txId?: string;
  attempted?: number;
  submitted?: number;
  failed?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface AnalyticsEvent {
  event: AnalyticsEventName;
  payload?: AnalyticsEventPayload;
}