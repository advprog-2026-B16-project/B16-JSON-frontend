import { render, screen, waitFor } from '@testing-library/react';
import Page from '../page';
import { getOrders, type Order } from '../orderApi';

jest.mock('../orderApi', () => ({
  getOrders: jest.fn(),
}));

jest.mock('lucide-react', () => {
  const IconMock = (props: any) => <svg {...props} />;

  return {
    AlertCircle: IconMock,
    ClipboardList: IconMock,
    Loader2: IconMock,
    MapPin: IconMock,
    ShoppingCart: IconMock,
    User: IconMock,
  };
});

const mockedGetOrders = getOrders as jest.MockedFunction<typeof getOrders>;

describe('Orders Page', () => {
  beforeEach(() => {
    mockedGetOrders.mockReset();
    localStorage.setItem('auth_token', 'mock-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders backend orders data', async () => {
    const mockOrders: Order[] = [
      {
        orderId: 'order-001',
        productId: 'prod-abc-123',
        titipersId: 'user-titipers-01',
        jastiperId: 'user-jastipers-01',
        quantity: 2,
        shippingAddress: 'Jl. Margonda Raya No. 100, Depok',
        orderStatus: 'PENDING',
        createdAt: '2025-06-01T10:00:00',
        updatedAt: null,
        jastiperRating: null,
        productRating: null,
        cancellationReason: null,
      },
    ];

    mockedGetOrders.mockResolvedValue(mockOrders);

    render(<Page />);

    expect(await screen.findByRole('heading', { name: /Jastip Orders/i })).toBeInTheDocument();
    expect(screen.getByText(/Order #order-001/i)).toBeInTheDocument();
    expect(screen.getByText(/Product ID: prod-abc-123/i)).toBeInTheDocument();
    expect(screen.getByText(/Jl\. Margonda Raya No\. 100, Depok/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedGetOrders).toHaveBeenCalledWith('mock-token');
    });
  });

  it('renders error state when fetching orders fails', async () => {
    mockedGetOrders.mockRejectedValueOnce(new Error('Backend tidak tersedia'));

    render(<Page />);

    expect(await screen.findByText(/Gagal memuat order/i)).toBeInTheDocument();
    expect(screen.getByText(/Backend tidak tersedia/i)).toBeInTheDocument();
  });

  it('renders empty state when there are no orders', async () => {
    mockedGetOrders.mockResolvedValueOnce([]);

    render(<Page />);

    expect(await screen.findByRole('heading', { name: /Jastip Orders/i })).toBeInTheDocument();
    expect(screen.getByText(/Belum ada pesanan masuk/i)).toBeInTheDocument();
  });
});
