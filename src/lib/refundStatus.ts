import type { TransactionStatus } from '@/types/wallet';

export function getRefundStatusLabel(status?: TransactionStatus | null) {
  if (status === 'SUCCESS') return 'REFUNDED';
  if (status === 'PENDING') return 'UNDER REVIEW';
  if (status === 'FAILED') return 'REJECTED';
  return 'N/A';
}

export function getRefundStatusDescription(status?: TransactionStatus | null) {
  if (status === 'SUCCESS') return 'Refund has been approved and returned to the buyer wallet.';
  if (status === 'PENDING') return 'Refund request is waiting for validation.';
  if (status === 'FAILED') return 'Refund request was rejected.';
  return 'No refund request found.';
}
