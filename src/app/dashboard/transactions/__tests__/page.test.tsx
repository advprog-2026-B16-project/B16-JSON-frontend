import { render, screen, fireEvent } from '@testing-library/react';
import TransactionsClient from '../TransactionsClient';
import { usePayments } from '../../../../hooks/payment/usePayments';
import { useRouter } from 'next/navigation';

jest.mock('../../../../hooks/payment/usePayments', () => ({
  usePayments: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('TransactionsClient', () => {
  const mockFetchPayments = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePayments as jest.Mock).mockReturnValue({
      payments: [],
      isLoading: false,
      error: null,
      fetchPayments: mockFetchPayments,
    });
  });

  it('renders empty state when no payments', () => {
    render(<TransactionsClient />);
    expect(screen.getByText('No purchases yet')).toBeInTheDocument();
  });

  it('renders transactions list correctly', () => {
    (usePayments as jest.Mock).mockReturnValue({
      payments: [
        {
          id: 'pay-1',
          orderId: 'ord-123',
          referenceCode: 'REF123',
          amount: 50.25,
          status: 'PAID',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          transactionId: 'tx-1',
        },
        {
          id: 'pay-2',
          orderId: 'ord-456',
          referenceCode: 'REF456',
          amount: 100,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }
      ],
      isLoading: false,
      error: null,
      fetchPayments: mockFetchPayments,
    });

    render(<TransactionsClient />);
    
    expect(screen.getByText('Order: ord-123...')).toBeInTheDocument();
    expect(screen.getByText('Order: ord-456...')).toBeInTheDocument();
    expect(screen.getByText('PAID')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText(/\$50\.25/i)).toBeInTheDocument();
    expect(screen.getByText(/\$100\.00/i)).toBeInTheDocument();
  });

  it('expands transaction details and shows action buttons', () => {
    (usePayments as jest.Mock).mockReturnValue({
      payments: [
        {
          id: 'pay-1',
          orderId: 'ord-123',
          referenceCode: 'REF123',
          amount: 50,
          status: 'PAID',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          transactionId: 'tx-1',
        },
      ],
      isLoading: false,
      error: null,
      fetchPayments: mockFetchPayments,
    });

    render(<TransactionsClient />);
    
    // Click on the transaction header to expand
    fireEvent.click(screen.getByText('Order: ord-123...'));
    
    expect(screen.getByText('Transaction Details')).toBeInTheDocument();
    expect(screen.getByText('Request Refund')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Request Refund'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard/refund?transactionId=tx-1');
  });
});
