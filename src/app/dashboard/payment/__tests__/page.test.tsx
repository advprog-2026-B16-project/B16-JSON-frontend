import { render, screen, fireEvent } from '@testing-library/react';
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
    });
  });

  it('renders correctly', () => {
    render(<PaymentClient />);
    expect(screen.getByRole('heading', { name: /^Payment$/i })).toBeInTheDocument();
  });

  it('submits create payment form', async () => {
    mockGetParams.mockReturnValue(null); // No initial orderId
    render(<PaymentClient />);
    
    // Assuming PaymentActionForm renders an input for Order ID
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test-order-id' } });
    
    // Using closest button or just finding submit button
    const submitBtn = screen.getByRole('button', { name: /Initiate Payment/i });
    fireEvent.click(submitBtn);
    
    expect(mockCreatePayment).toHaveBeenCalledWith({ orderId: 'test-order-id' });
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
    });

    render(<PaymentClient />);
    // Inside PaymentHistory it should display the order id or status
    expect(screen.getByText(/ord-1/)).toBeInTheDocument();
  });
});
