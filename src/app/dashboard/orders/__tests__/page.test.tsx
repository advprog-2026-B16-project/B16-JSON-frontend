import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Page from '../page';
import { getProfile } from '../../settings/actions';
import { getMyJastiperOrders, markJastiperOrderShipped, type Order, updateOrderStatus } from '../orderApi';

jest.mock('../../settings/actions', () => ({
  getProfile: jest.fn(),
}));

jest.mock('../../../../hooks/refund/useRefunds', () => ({
  useRefunds: () => ({
    refunds: [],
    actionLoading: false,
    error: '',
    success: '',
    approveRefund: jest.fn(),
  }),
}));

jest.mock('../orderApi', () => ({
  getMyJastiperOrders: jest.fn(),
  getOrderTotalAmount: jest.fn((order) => Number(order.totalAmount ?? order.totalPrice ?? order.total_amount ?? order.total_price ?? order.amount ?? 0)),
  updateOrderStatus: jest.fn(),
  markJastiperOrderShipped: jest.fn(),
  markJastiperOrderCompleted: jest.fn(),
  cancelOrder: jest.fn(),
}));

describe('Orders Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getProfile as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 'jastiper-1',
        username: 'jastiper',
        email: 'jastiper@test.com',
        fullName: 'Jastiper Test',
        bio: '',
        location: 'Jakarta',
        role: 'JASTIPER',
      },
    });
  });

  it('renders Jastiper order queue', async () => {
    const mockOrders: Order[] = [
      {
        orderId: 'order-001',
        productId: 'prod-abc-123',
        titipersId: 'user-titipers-01',
        jastiperId: 'jastiper-1',
        quantity: 2,
        totalAmount: 900000,
        shippingAddress: 'Jl. Margonda Raya No. 100, Depok',
        orderStatus: 'PAID',
        createdAt: '2026-06-01T10:00:00',
        updatedAt: null,
        jastiperRating: null,
        productRating: null,
        cancellationReason: null,
      },
    ];

    (getMyJastiperOrders as jest.Mock).mockResolvedValue(mockOrders);

    render(<Page />);

    expect(await screen.findByRole('heading', { name: /Jastiper Dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/Order #order/i)).toBeInTheDocument();
    expect(screen.getByText(/Product: prod-/i)).toBeInTheDocument();
    expect(screen.getByText(/Jl\. Margonda Raya No\. 100, Depok/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(getMyJastiperOrders).toHaveBeenCalled();
    });
  });

  it('updates order status using valid next step', async () => {
    const paidOrder: Order = {
      orderId: 'order-001',
      productId: 'prod-abc-123',
      titipersId: 'user-titipers-01',
      jastiperId: 'jastiper-1',
      quantity: 1,
      totalAmount: 450000,
      shippingAddress: 'Jakarta',
      orderStatus: 'PAID',
      createdAt: '2026-06-01T10:00:00',
    };

    (getMyJastiperOrders as jest.Mock).mockResolvedValue([paidOrder]);
    (updateOrderStatus as jest.Mock).mockResolvedValue({ ...paidOrder, orderStatus: 'PURCHASED' });

    render(<Page />);

    fireEvent.click(await screen.findByText(/Mark Purchased/i));
    fireEvent.click(await screen.findByText('Update'));

    await waitFor(() => {
      expect(updateOrderStatus).toHaveBeenCalledWith('order-001', 'PURCHASED');
    });
    expect(await screen.findByText(/Order moved to Purchased/i)).toBeInTheDocument();
  });

  it('keeps total visible when shipped update response omits amount fields', async () => {
    const purchasedOrder: Order = {
      orderId: 'order-ship-001',
      productId: 'prod-ship-123',
      titipersId: 'user-titipers-01',
      jastiperId: 'jastiper-1',
      quantity: 1,
      totalPrice: 750000,
      shippingAddress: 'Jakarta',
      orderStatus: 'PURCHASED',
      createdAt: '2026-06-01T10:00:00',
    };

    (getMyJastiperOrders as jest.Mock).mockResolvedValue([purchasedOrder]);
    (markJastiperOrderShipped as jest.Mock).mockResolvedValue({
      ...purchasedOrder,
      totalPrice: undefined,
      orderStatus: 'SHIPPED',
    });

    render(<Page />);

    expect(await screen.findByText(/Total: \$750K/i)).toBeInTheDocument();

    fireEvent.click(await screen.findByText(/Mark Shipped/i));
    fireEvent.click(await screen.findByText('Update'));

    await waitFor(() => {
      expect(markJastiperOrderShipped).toHaveBeenCalledWith('order-ship-001');
    });
    expect(await screen.findByText(/Total: \$750K/i)).toBeInTheDocument();
  });

  it('shows access gate for non-Jastipers', async () => {
    (getProfile as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        id: 'buyer-1',
        username: 'buyer',
        email: 'buyer@test.com',
        fullName: 'Buyer Test',
        bio: '',
        location: 'Jakarta',
        role: 'TITIPER',
      },
    });

    render(<Page />);

    expect(await screen.findByText(/Jastiper access required/i)).toBeInTheDocument();
  });
});
