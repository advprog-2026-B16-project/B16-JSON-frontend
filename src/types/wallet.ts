export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
}

export type TransactionType =
  | 'TOP_UP'
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

export interface PaymentRequest {
  orderId: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  transactionId: string;
  referenceCode: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  expiresAt: string;
  paidAt: string | null;
}

export interface RefundRequest {
  transactionId: string;
  reason: string;
}

export interface RefundResponse {
  id: string;
  originalTransactionId: string;
  refundTransactionId: string;
  orderId: string;
  amount: number;
  reason: string;
  status: TransactionStatus;
}