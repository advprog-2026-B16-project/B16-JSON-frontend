import { render, screen, waitFor } from '@testing-library/react';
import PaymentClient from '../PaymentClient';
import { usePayments } from '../../../../hooks/payment/usePayments';
import { useRouter, useSearchParams } from 'next/navigation';

jest.mock('../../../../hooks/payment/usePayments', () => ({
  usePayments: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('PaymentClient', () => {
  const mockFetchPayments = jest.fn();
  const mockCreatePayment = jest.fn();
  const mockPay = jest.fn();
  const mockBack = jest.fn();
  const mockGetParams = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
    (useSearchParams as jest.Mock).mockReturnValue({ get: mockGetParams });
    (usePayments as jest.Mock).mockReturnValue({
      payments: [],
      isLoading: false,
      actionLoading: false,
      error: null,
      success: null,
      fetchPayments: mockFetchPayments,
      createPayment: mockCreatePayment,
      pay: mockPay,
      cancelPayment: jest.fn(),
    });
  });

  it('renders correctly', () => {
    render(<PaymentClient />);
    expect(screen.getByRole('heading', { name: /Confirm Payment/i })).toBeInTheDocument();
  });

  it('creates payment automatically from checkout order id', async () => {
    mockGetParams.mockImplementation((key) => key === 'orderId' ? 'test-order-id' : null);
    render(<PaymentClient />);

    await waitFor(() => {
      expect(mockCreatePayment).toHaveBeenCalledWith({ orderId: 'test-order-id' });
    });
  });

  it('shows success and error messages', () => {
    (usePayments as jest.Mock).mockReturnValue({
      payments: [],
      isLoading: false,
      actionLoading: false,
      error: 'Test Error',
      success: 'Test Success',
      fetchPayments: mockFetchPayments,
      createPayment: mockCreatePayment,
      pay: mockPay,
      cancelPayment: jest.fn(),
    });

    render(<PaymentClient />);
    expect(screen.getByText('Test Error')).toBeInTheDocument();
    expect(screen.getByText('Test Success')).toBeInTheDocument();
  });

  it('renders payment history', () => {
    (usePayments as jest.Mock).mockReturnValue({
      payments: [
        {
          id: 'pay-1',
          orderId: 'ord-1',
          amount: 150,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }
      ],
      isLoading: false,
      actionLoading: false,
      error: null,
      success: null,
      fetchPayments: mockFetchPayments,
      createPayment: mockCreatePayment,
      pay: mockPay,
      cancelPayment: jest.fn(),
    });

    render(<PaymentClient />);
    // Inside PaymentHistory it should display the order id or status
    expect(screen.getByText(/ord-1/)).toBeInTheDocument();
  });
});
