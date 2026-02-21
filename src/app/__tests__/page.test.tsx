import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('HomePage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  it('renders the title JSON', () => {
    render(<HomePage />);
    const elements = screen.getAllByText('JSON');
    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0]).toBeInTheDocument();
  });

  it('renders the full title Jastip Online Nasional', () => {
    render(<HomePage />);
    const elements = screen.getAllByText(/Jastip Online Nasional/i);
    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0]).toBeInTheDocument();
  });

  it('renders the Explore Now button', () => {
    render(<HomePage />);
    expect(screen.getByRole('button', { name: /Explore Now/i })).toBeInTheDocument();
  });

  it('redirects to /login when clicking Explore Now and not authenticated', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    render(<HomePage />);
    
    const exploreButton = screen.getByRole('button', { name: /Explore Now/i });
    fireEvent.click(exploreButton);
    
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('redirects to /dashboard when clicking Explore Now and authenticated', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue('mock-token');
    render(<HomePage />);
    
    const exploreButton = screen.getByRole('button', { name: /Explore Now/i });
    fireEvent.click(exploreButton);
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('renders feature cards', () => {
    render(<HomePage />);
    expect(screen.getByText('Aman & Terpercaya')).toBeInTheDocument();
    expect(screen.getByText('Jangkauan Luas')).toBeInTheDocument();
    expect(screen.getByText('Proses Cepat')).toBeInTheDocument();
  });
});
