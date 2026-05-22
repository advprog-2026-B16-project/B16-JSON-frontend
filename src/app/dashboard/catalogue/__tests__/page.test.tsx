import { render, screen, waitFor } from '@testing-library/react';
import Page from '../page';
import { getProfile } from '../../settings/actions';
import { getProducts } from '@/services/products/product.service';

jest.mock('../../settings/actions', () => ({
  getProfile: jest.fn(),
}));

jest.mock('@/services/products/product.service', () => ({
  createProduct: jest.fn(),
  deleteProduct: jest.fn(),
  getProducts: jest.fn(),
  updateProduct: jest.fn(),
}));

describe('Catalogue Page', () => {
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
    (getProducts as jest.Mock).mockResolvedValue([
      {
        id: 'product-1',
        name: 'Matcha Powder',
        description: 'Uji matcha',
        price: 450000,
        stock: 8,
        originCountry: 'Japan',
        purchaseDate: '2026-06-01',
        jastiperId: 'jastiper-1',
      },
    ]);
  });

  it('renders catalogue products', async () => {
    render(<Page />);
    expect(screen.getByText(/Your Catalogue/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Matcha Powder/i)).toBeInTheDocument();
    });
  });

  it('shows verification gate for buyers', async () => {
    (getProfile as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        id: 'buyer-1',
        username: 'buyer',
        email: 'buyer@test.com',
        fullName: 'Buyer Test',
        bio: '',
        location: 'Jakarta',
        role: 'USER',
      },
    });

    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText(/Jastiper verification required/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Buyer account detected/i)).toBeInTheDocument();
  });
});
