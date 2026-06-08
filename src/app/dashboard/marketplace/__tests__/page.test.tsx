import { render, screen, waitFor } from '@testing-library/react';
import Page from '../page';
import { getProducts } from '@/services/products/product.service';
import { getProfile } from '../../settings/actions';
import { createOrder } from '../../orders/orderApi';

jest.mock('@/services/products/product.service', () => ({
  getProducts: jest.fn(),
}));

jest.mock('../../settings/actions', () => ({
  getProfile: jest.fn(),
}));

jest.mock('../../orders/orderApi', () => ({
  createOrder: jest.fn(),
}));

describe('Marketplace Page', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-31T12:00:00+07:00'));
    jest.clearAllMocks();
    (getProducts as jest.Mock).mockResolvedValue([
      {
        id: 'product-1',
        name: 'Matcha Powder',
        description: 'Uji matcha',
        price: 450000,
        stock: 8,
        originCountry: 'Japan',
        purchaseDate: '2026-06-01',
        jastiperId: 'user-1',
      },
      {
        id: 'product-2',
        name: 'Expired Chocolate',
        description: 'Past trip product',
        price: 120000,
        stock: 4,
        originCountry: 'Japan',
        purchaseDate: '2026-05-30',
        jastiperId: 'user-2',
      },
    ]);
    (getProfile as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 'user-1',
        username: 'jastiper',
        email: 'jastiper@test.com',
        fullName: 'Jastiper Test',
        bio: '',
        location: 'Jakarta',
        role: 'JASTIPER',
      },
    });
    (createOrder as jest.Mock).mockResolvedValue({ orderId: 'order-1' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders products and hides buy action for own product', async () => {
    render(<Page />);
    expect(screen.getByText(/Marketplace/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Matcha Powder/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Your catalogue item/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/By Verified Jastiper/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/By Jastiper Test/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Your Product/i)).toBeInTheDocument();
    expect(screen.queryByText(/Join War/i)).not.toBeInTheDocument();
  });

  it('hides products after the jastiper trip date has passed', async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText(/Matcha Powder/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Expired Chocolate/i)).not.toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
