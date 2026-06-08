import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionsClient from '../TransactionsClient';
import { usePayments } from '../../../../hooks/payment/usePayments';
import { useRefunds } from '../../../../hooks/refund/useRefunds';
import { getOrderById } from '../../orders/orderApi';
import { useRouter } from 'next/navigation';

jest.mock('../../../../hooks/payment/usePayments', () => ({
  usePayments: jest.fn(),
}));

jest.mock('../../../../hooks/refund/useRefunds', () => ({
  useRefunds: jest.fn(),
}));

jest.mock('../../orders/orderApi', () => ({
  getOrderById: jest.fn(),
  markTitiperOrderDone: jest.fn(),
  ORDER_STATUS_LABEL: {},
  ORDER_STATUS_DESCRIPTION: {},
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('TransactionsClient', () => {
  const mockFetchPayments = jest.fn();
  const mockFetchRefunds = jest.fn();
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
    (useRefunds as jest.Mock).mockReturnValue({
      refunds: [],
      isLoading: false,
      fetchRefunds: mockFetchRefunds,
    });
    (getOrderById as jest.Mock).mockImplementation((orderId: string) => Promise.resolve({
      orderId,
      productId: 'prod-1',
      titipersId: 'titiper-1',
      quantity: 1,
      shippingAddress: 'Jakarta',
      orderStatus: 'COMPLETED',
      createdAt: new Date().toISOString(),
    }));
  });

  it('renders empty state when no payments', () => {
    render(<TransactionsClient />);
    expect(screen.getByText('No purchases yet')).toBeInTheDocument();
  });

  it('renders transactions list correctly', async () => {
    (usePayments as jest.Mock).mockReturnValue({
      payments: [
        {
          id: 'pay-1',
          orderId: 'ord-123',
          referenceCode: 'REF123',
          amount: 50.25,
          status: 'SUCCESS',
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
    (useRefunds as jest.Mock).mockReturnValue({
      refunds: [],
      isLoading: false,
      fetchRefunds: mockFetchRefunds,
    });

    render(<TransactionsClient />);

    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Order: ord-1...')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Order: ord-1...')).toBeInTheDocument();
    expect(screen.getByText('Order: ord-4...')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('UNPAID')).toBeInTheDocument();
    expect(screen.getByText(/\$50\.3/i)).toBeInTheDocument();
    expect(screen.getByText(/\$100/i)).toBeInTheDocument();
  });

  it('expands transaction details and shows action buttons', async () => {
    (usePayments as jest.Mock).mockReturnValue({
      payments: [
        {
          id: 'pay-1',
          orderId: 'ord-123',
          referenceCode: 'REF123',
          amount: 50,
          status: 'SUCCESS',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          transactionId: 'tx-1',
        },
      ],
      isLoading: false,
      error: null,
      fetchPayments: mockFetchPayments,
    });
    (useRefunds as jest.Mock).mockReturnValue({
      refunds: [],
      isLoading: false,
      fetchRefunds: mockFetchRefunds,
    });

    render(<TransactionsClient />);
    
    await waitFor(() => {
      expect(screen.getByText('Order: ord-1...')).toBeInTheDocument();
    });

    // Click on the transaction header to expand
    fireEvent.click(screen.getByText('Order: ord-1...'));
    
    expect(screen.getByText('Transaction Details')).toBeInTheDocument();
    expect(screen.getByText('Request Refund')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Request Refund'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard/refund?transactionId=tx-1');
  });

  it('refreshes payments and refunds from the refresh button', async () => {
    mockFetchPayments.mockResolvedValueOnce(undefined);
    mockFetchRefunds.mockResolvedValueOnce(undefined);

    render(<TransactionsClient />);

    fireEvent.click(screen.getByTitle('Refresh transactions'));

    await waitFor(() => {
      expect(mockFetchPayments).toHaveBeenCalled();
      expect(mockFetchRefunds).toHaveBeenCalled();
    });
  });
});
