export interface Transaction {
  id: string;
  walletId: string;
  type: 'TOPUP' | 'WITHDRAW' | string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface WalletActionRequest {
  userId: string;
  amount: number;
}
