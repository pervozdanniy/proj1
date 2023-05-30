export interface BaseNotificationEvent {
  type: string;
  data?: Record<string, unknown>;
}

export type NotificationEvent = PaymentAccountCreationEvent | BalanceUpdatedEvent | KYCEvent | PaymentEvent;

export interface PaymentEvent extends BaseNotificationEvent {
  type: 'payment_status_changed';
  data: {
    status: string;
  };
}

export interface PaymentAccountCreationEvent extends BaseNotificationEvent {
  type: 'payment_account_creation';
  data: {
    completed: boolean;
    reason?: string;
  };
}

export interface BalanceUpdatedEvent extends BaseNotificationEvent {
  type: 'balance_updated';
}

export interface KYCEvent extends BaseNotificationEvent {
  type: 'kyc';
  data: {
    completed: boolean;
    reason?: string;
  };
}
