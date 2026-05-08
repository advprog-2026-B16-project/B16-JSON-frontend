export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  orderId: string;

  type: TransactionType;

  status: TransactionStatus;

  amount: number;
  description: string;

  createdAt: string;
}

export type TransactionType =
  | 'TOPUP'
  | 'WITHDRAW'
  | 'PAYMENT'
  | 'REFUND';

export type TransactionStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED';

export interface WalletActionRequest {
  userId: string;
  amount: number;
}